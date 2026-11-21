import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { sendTransferReceipt, useBankTransferInfo, useTransferClaim } from './useBankTransfer';
import { claimView, expiryState, fileToDataUrl, nairaToKobo, nowLocalInput, receiptFormError, rememberClaim, rememberedClaim } from './bankTransferHelpers';

const NEUTRAL = {
  cardBg: '#ffffff', cardBorder: '#e5e7eb', cardShadow: 'none', borderColor: '#d1d5db', textPrimary: '#111827', textSecondary: '#4b5563', textMuted: '#6b7280',
  accentSolid: '#ea580c', accentSoft: '#fff7ed', accentGradient: 'linear-gradient(135deg,#f97316,#ea580c)', success: '#15803d', successBg: '#f0fdf4', danger: '#b91c1c', dangerBg: '#fef2f2',
};
const naira = (kobo) => `₦${(Number(kobo ?? 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const messageOf = (e, fallback) => {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join('. ');
  return typeof m === 'string' && m.trim() ? m : fallback;
};
const STEPS = ['Send the money', 'Upload your receipt', 'We confirm it'];

/** The warning and the declaration the customer must accept before a receipt can be sent (founder, 19 Nov 2026). The server requires the declaration too. */
export const FALSE_CLAIM_NOTICE =
  'Only submit a genuine receipt for a transfer you really made. Submitting a false, altered or reused receipt is fraud. It will lead to disciplinary action on your account, including suspension.';
export const DECLARATION_TEXT = 'I confirm this receipt is genuine and I understand that false claims lead to suspension of my account.';

function Copy({ value, tokens }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(String(value)); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked: the value is on screen */ } }}
      style={{ border: `1px solid ${tokens.borderColor}`, background: 'none', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: tokens.accentSolid, cursor: 'pointer' }}>
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * THE bank-transfer payment option, one component for every checkout and top-up (B1b, founder 19 Nov 2026). Plug it in wherever a flow offers payment methods.
 * The customer sends the exact amount to the company account with a reference, uploads the receipt, and we confirm it against our bank (usually within an hour);
 * the flow then completes exactly as a card payment would. The server makes the amount and the reference: this component only shows them.
 *
 * @param {string}   flow        Which flow this is ('fund', 'marketplace', ...). The open request is remembered per flow so a reload resumes it.
 * @param {number}   amountKobo  What the customer wants to pay, for the Continue gate and the labels (the server's own amount is what is shown after).
 * @param {function} startClaim  async () => ({ claim, amountToTransferKobo?, walletReceivesKobo? }): the flow's own call that makes the claim. Never sends an amount the server did not price.
 * @param {function} [validate]  () => '' | 'message': the flow's own check before Continue (e.g. the amount rules).
 * @param {string}   [senderName] Prefill for "name on the account you sent from".
 * @param {function} [onCompleted] Called once when the payment is confirmed and has completed (refresh a balance, move to the next page).
 * @param {string}   [doneLabel]  What the confirmed message calls the thing paid for, e.g. "has been added to your wallet".
 * @param {object}   [tokens]     Theme colours; a neutral palette is used when absent.
 */
export default function PayByBankTransfer({ flow, amountKobo, startClaim, validate, senderName = '', onCompleted, doneLabel = 'has been added to your wallet', tokens: given }) {
  const tokens = { ...NEUTRAL, ...(given ?? {}) };
  const info = useBankTransferInfo();
  const [claimId, setClaimId] = useState(rememberedClaim(flow));
  const { claim, setClaim, error: loadError } = useTransferClaim(claimId);
  const [fee, setFee] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ senderAccountName: senderName, senderBank: '', bankReference: '', transferredAt: nowLocalInput(), amountSentNaira: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [declared, setDeclared] = useState(false);

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 18, padding: 18 };
  const input = { width: '100%', border: `1px solid ${tokens.borderColor}`, borderRadius: 12, padding: '10px 12px', fontSize: 15, background: tokens.cardBg, color: tokens.textPrimary };
  const label = { fontSize: 12, fontWeight: 700, color: tokens.textMuted, marginBottom: 4, display: 'block' };
  const view = claim ? claimView(claim) : null;
  const gate = validate ? validate() : '';

  useEffect(() => { if (claim && !form.amountSentNaira) setForm((f) => ({ ...f, amountSentNaira: String(Number(claim.expectedAmountKobo) / 100) })); }, [claim]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (claim?.status === 'COMPLETED') { rememberClaim(flow, ''); onCompleted?.(claim); } }, [claim?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    setStarting(true);
    setStartError('');
    try {
      const res = await startClaim();
      setFee(res?.amountToTransferKobo != null ? { toTransferKobo: res.amountToTransferKobo, receivesKobo: res.walletReceivesKobo } : null);
      setClaim(res.claim);
      setClaimId(res.claim.id);
      rememberClaim(flow, res.claim.id);
    } catch (e) {
      setStartError(messageOf(e, 'We could not start this transfer. Please try again.'));
    } finally {
      setStarting(false);
    }
  }

  async function submitReceipt() {
    const problem = receiptFormError(form, file);
    if (problem) { setSendError(problem); return; }
    if (!declared) { setSendError('Please confirm that your receipt is genuine.'); return; }
    setSending(true);
    setSendError('');
    try {
      const receiptBase64 = await fileToDataUrl(file);
      setClaim(await sendTransferReceipt(claim.id, {
        receiptBase64, senderAccountName: form.senderAccountName.trim(), senderBank: form.senderBank.trim(), bankReference: form.bankReference.trim(),
        transferredAt: new Date(form.transferredAt).toISOString(), amountSentNaira: nairaToKobo(form.amountSentNaira) / 100, declarationAccepted: true,
      }));
      setFile(null);
      setDeclared(false);
    } catch (e) {
      setSendError(messageOf(e, 'We could not send your receipt. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    rememberClaim(flow, '');
    setClaimId('');
    setClaim(null);
    setFee(null);
  }

  if (info === null) return <div style={{ padding: 24, display: 'grid', placeItems: 'center' }}><CircularProgress size={22} sx={{ color: tokens.accentSolid }} /></div>;
  if (!info.enabled && !claim) return <div style={{ ...card, color: tokens.textSecondary, fontSize: 14 }}>Bank transfer is not available right now.</div>;

  const toTransfer = claim ? Number(claim.expectedAmountKobo) : 0;
  const payTo = claim?.payTo ?? (info.enabled ? info : null);
  const canUpload = claim && view?.canUpload && ['PENDING_RECEIPT', 'EXPIRED'].includes(claim.status);
  const step = view?.step ?? 0;

  return (
    <div style={{ display: 'grid', gap: 14 }} data-testid="pay-by-bank-transfer">
      {claim && (
        <div style={{ display: 'flex', gap: 6 }} aria-label="Progress">
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '8px 4px', borderRadius: 10, background: step > i + 1 || step === 4 ? tokens.successBg : step === i + 1 ? tokens.accentSoft : 'transparent', border: `1px solid ${tokens.borderColor}`, color: step === i + 1 ? tokens.accentSolid : tokens.textMuted }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
      )}

      {!claim && !claimId && (
        <div style={card}>
          <div style={{ color: tokens.textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
            Send the money from your bank to our account, upload your receipt, and we confirm it against our bank, usually within an hour. No card limits.
          </div>
          {(gate || startError) && <div role="alert" style={{ background: tokens.dangerBg, color: tokens.danger, borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>{startError || gate}</div>}
          <button type="button" data-testid="start-bank-transfer" disabled={!!gate || starting} onClick={start}
            style={{ width: '100%', padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, cursor: !gate && !starting ? 'pointer' : 'not-allowed', background: !gate && !starting ? tokens.accentGradient : '#d4d4d8', color: '#fff' }}>
            {starting ? 'Starting…' : gate ? 'Enter an amount' : `Continue${amountKobo ? ` with ${naira(amountKobo)}` : ''}`}
          </button>
        </div>
      )}

      {claimId && !claim && (loadError ? (
        <div style={card} role="alert"><div style={{ color: tokens.danger }}>{loadError}</div><button type="button" onClick={startOver} style={{ marginTop: 10, border: 0, background: 'none', color: tokens.accentSolid, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Start a new request</button></div>
      ) : <div style={{ padding: 24, display: 'grid', placeItems: 'center' }}><CircularProgress size={22} sx={{ color: tokens.accentSolid }} /></div>)}

      {claim && view && (
        <div style={{ ...card, borderColor: view.tone === 'ok' ? tokens.success : view.tone === 'bad' ? tokens.danger : tokens.cardBorder }} data-testid="claim-status">
          <b style={{ fontSize: 16, color: view.tone === 'ok' ? tokens.success : view.tone === 'bad' ? tokens.danger : tokens.textPrimary }}>{view.title}</b>
          <div style={{ color: tokens.textSecondary, fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{claim.status === 'COMPLETED' ? `${naira(claim.expectedAmountKobo)} ${doneLabel}.` : view.body}</div>
          {loadError && <div style={{ color: tokens.textMuted, fontSize: 12, marginTop: 8 }}>{loadError}</div>}
          {view.final && view.tone === 'bad' && <button type="button" onClick={startOver} style={{ marginTop: 12, border: 0, background: 'none', color: tokens.accentSolid, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Start a new request</button>}
          {view.final && view.tone === 'ok' && <button type="button" onClick={startOver} style={{ marginTop: 12, border: 0, background: 'none', color: tokens.accentSolid, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Make another transfer</button>}
        </div>
      )}

      {canUpload && payTo && (
        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', fontWeight: 800, color: tokens.textMuted }}>SEND EXACTLY</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
            <b style={{ fontSize: 28, letterSpacing: '-0.02em', color: tokens.textPrimary }} data-testid="amount-to-send">{naira(toTransfer)}</b>
            <Copy value={(toTransfer / 100).toFixed(2)} tokens={tokens} />
          </div>
          {fee && fee.receivesKobo != null && fee.receivesKobo !== fee.toTransferKobo && (
            <div style={{ fontSize: 13, color: tokens.textSecondary, marginBottom: 10 }}>You receive {naira(fee.receivesKobo)}. The difference is the transaction fee.</div>
          )}
          {[['Bank', payTo.bankName], ['Account name', payTo.accountName], ['Account number', payTo.accountNumber], ['Transfer narration (reference)', claim.reference]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: `1px dashed ${tokens.borderColor}` }}>
              <span style={{ color: tokens.textMuted, fontSize: 13 }}>{k}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b style={{ color: tokens.textPrimary, letterSpacing: k.startsWith('Account number') || k.startsWith('Transfer') ? '0.06em' : 0 }}>{v}</b><Copy value={v} tokens={tokens} /></span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 10, lineHeight: 1.5 }}>Put the reference in the transfer narration so we can match your payment. Send exactly this amount; a different amount cannot be accepted.{expiryState(claim) === 'open' && claim.expiresAt ? ` This request is open until ${new Date(claim.expiresAt).toLocaleString()}.` : ''}</div>

          <div style={{ borderTop: `1px solid ${tokens.cardBorder}`, marginTop: 14, paddingTop: 14 }}>
            <b style={{ color: tokens.textPrimary }}>Your receipt</b>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <div><label style={label} htmlFor="bt-file">Receipt (JPG, PNG, WebP or PDF, up to 5 MB)</label><input id="bt-file" data-testid="receipt-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSendError(''); }} /></div>
              <div><label style={label} htmlFor="bt-name">Name on the account you sent from</label><input id="bt-name" style={input} value={form.senderAccountName} onChange={(e) => setForm({ ...form, senderAccountName: e.target.value })} /></div>
              <div><label style={label} htmlFor="bt-bank">Bank you sent from</label><input id="bt-bank" style={input} value={form.senderBank} onChange={(e) => setForm({ ...form, senderBank: e.target.value })} /></div>
              <div><label style={label} htmlFor="bt-ref">Bank transaction reference (on your receipt)</label><input id="bt-ref" style={input} value={form.bankReference} onChange={(e) => setForm({ ...form, bankReference: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={label} htmlFor="bt-when">When you sent it</label><input id="bt-when" style={input} type="datetime-local" value={form.transferredAt} onChange={(e) => setForm({ ...form, transferredAt: e.target.value })} /></div>
                <div><label style={label} htmlFor="bt-sent">Amount you sent (₦)</label><input id="bt-sent" style={input} inputMode="decimal" value={form.amountSentNaira} onChange={(e) => setForm({ ...form, amountSentNaira: e.target.value.replace(/[^0-9.]/g, '') })} /></div>
              </div>
              {nairaToKobo(form.amountSentNaira) !== null && nairaToKobo(form.amountSentNaira) !== toTransfer && (
                <div style={{ fontSize: 13, color: '#b45309' }}>The amount due is {naira(toTransfer)}. A transfer for a different amount cannot be accepted.</div>
              )}
              <div data-testid="false-claim-notice" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: 12, padding: '10px 14px', fontSize: 13, lineHeight: 1.5 }}>{FALSE_CLAIM_NOTICE}</div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: tokens.textSecondary, cursor: 'pointer' }}>
                <input data-testid="declaration" type="checkbox" checked={declared} onChange={(e) => { setDeclared(e.target.checked); setSendError(''); }} style={{ marginTop: 3 }} />
                <span>{DECLARATION_TEXT}</span>
              </label>
              {sendError && <div role="alert" style={{ background: tokens.dangerBg, color: tokens.danger, borderRadius: 12, padding: '10px 14px', fontSize: 14 }}>{sendError}</div>}
              <button type="button" data-testid="send-receipt" disabled={sending || !declared} onClick={submitReceipt}
                style={{ width: '100%', padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, background: sending || !declared ? '#d4d4d8' : tokens.accentGradient, color: '#fff', cursor: sending ? 'wait' : declared ? 'pointer' : 'not-allowed' }}>
                {sending ? 'Sending…' : 'Send my receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
