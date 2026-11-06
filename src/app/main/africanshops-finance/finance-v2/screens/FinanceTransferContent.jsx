import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransfer, useResolveInternalAccount, useFintechKycStatus, useWalletBeneficiaries, useWalletBeneficiaryActions } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { nairaFull } from '../financeFormat';
import { exceedsMonthlyAllowance } from './shared/PartialKycAllowanceBanner';
import RecipientPicker, { colorFor, initials } from './shared/RecipientPicker';
import TransactionPinField from './shared/TransactionPinField';

// Transfer, as in the approved preview: search by name or account number, beneficiary chips, a live summary, and a
// "save this account" choice after a successful send. The transfer logic is the old screen's, unchanged: resolve the
// account, block your own account, the balance and monthly-allowance guards, PIN, emailed code, and the receipt.

const STEPS = { FORM: 'form', PIN: 'pin', OTP: 'otp', SUCCESS: 'success' };
const QUICK = [5000, 10000, 50000, 100000];

function Avatar({ name, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#fff', flex: 'none', background: colorFor(name), fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function Row({ label, value, strong, tokens }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px dashed ${tokens.borderColor}`, fontSize: 14, color: tokens.textSecondary }}>
      <span>{label}</span>
      <b style={{ color: tokens.textPrimary, fontSize: strong ? 22 : 14, fontWeight: strong ? 800 : 700, textAlign: 'right' }}>{value}</b>
    </div>
  );
}

function Stepper({ step, tokens }) {
  const labels = ['Details', 'PIN', 'Confirm', 'Done'];
  const keys = [STEPS.FORM, STEPS.PIN, STEPS.OTP, STEPS.SUCCESS];
  const at = keys.indexOf(step);
  const dotBg = (done, on) => {
    if (done) return tokens.success;
    return on ? tokens.accentGradient : tokens.borderColor;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 20px' }}>
      {labels.map((l, i) => {
        const done = i < at;
        const on = i === at;
        return (
          <div key={l} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 14, color: done || on ? tokens.textPrimary : tokens.textMuted }}>
              <i
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontStyle: 'normal',
                  background: dotBg(done, on),
                  color: done || on ? '#fff' : tokens.textSecondary,
                  boxShadow: on ? `0 4px 12px ${tokens.accentSolid}44` : 'none',
                }}
              >
                {done ? <FuseSvgIcon size={16} className="text-white">heroicons-solid:check</FuseSvgIcon> : i + 1}
              </i>
              {l}
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, background: done ? tokens.success : tokens.borderColor, margin: '0 12px' }} />}
          </div>
        );
      })}
    </div>
  );
}

function Notice({ kind, children, tokens }) {
  const map = { error: [tokens.dangerBg, tokens.danger], warn: [tokens.warningBg, tokens.warning], ok: [tokens.successBg, tokens.success] }[kind];
  return <div style={{ background: map[0], color: map[1], borderRadius: 14, padding: '10px 14px', fontSize: 14, margin: '10px 0' }}>{children}</div>;
}

/** After a successful send: offer to save an account that is not yet a beneficiary, with its details beside the toggle. */
function SaveBeneficiary({ accountNumber, accountName, list, account, onSaved, tokens }) {
  const actions = useWalletBeneficiaryActions(account?.accountNumber);
  const [on, setOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const sameName = (list?.beneficiaries ?? []).find((b) => b.accountName === accountName);
  const groups = list?.groups ?? [];
  let toggleLabel = 'Save as beneficiary?';
  if (saved) toggleLabel = 'Saved';
  else if (on) toggleLabel = 'Yes, save it';
  // Suggest the group of an existing saved account with the same name; the user can change it.
  const defaultGroup = sameName?.groupId ?? 'new';
  const [group, setGroup] = useState(defaultGroup);

  async function save() {
    setSaving(true);
    setErr('');
    try {
      const dto = { beneficiaryAccountNumber: accountNumber };
      if (group === 'new') dto.groupName = accountName;
      else if (group !== 'none') dto.groupId = group;
      await actions.add(dto);
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ border: `2px solid ${on ? tokens.accentSolid : tokens.borderColor}`, background: on ? tokens.accentSoft : 'transparent', borderRadius: 20, padding: 16, textAlign: 'left', transition: '0.2s' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
          <Avatar name={accountName} />
          <div style={{ minWidth: 0 }}>
            <b style={{ color: tokens.textPrimary }}>{accountName}</b>
            <div style={{ color: tokens.textSecondary, fontSize: 13 }}>{accountNumber} · AfricanShops wallet</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>{toggleLabel}</div>
          <button
            type="button"
            aria-label="Save as beneficiary"
            aria-pressed={on}
            disabled={saved}
            onClick={() => setOn((v) => !v)}
            style={{ width: 54, height: 30, borderRadius: 99, background: on ? tokens.accentSolid : tokens.borderColor, position: 'relative', border: 0, cursor: saved ? 'default' : 'pointer', transition: '0.2s' }}
          >
            <span style={{ position: 'absolute', left: on ? 27 : 3, top: 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: '0.2s', boxShadow: '0 2px 6px rgba(0,0,0,.25)' }} />
          </button>
        </div>
      </div>
      {on && !saved && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Add to a group</div>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            style={{ width: '100%', border: `2px solid ${tokens.borderColor}`, borderRadius: 14, padding: '10px 12px', fontSize: 14, background: tokens.cardBg, color: tokens.textPrimary }}
          >
            <option value="new">{accountName} (new group)</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            <option value="none">No group</option>
          </select>
          {sameName && (
            <div style={{ marginTop: 12, background: tokens.infoBg, color: tokens.info, borderRadius: 14, padding: '10px 12px', fontSize: 13 }}>
              💡 {accountName} has another account you saved ({sameName.accountNumber}). It will be grouped together.
            </div>
          )}
          {err && <Notice kind="error" tokens={tokens}>{err}</Notice>}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{ marginTop: 14, width: '100%', padding: '12px 20px', borderRadius: 14, fontWeight: 700, background: tokens.accentGradient, color: '#fff', border: 0, cursor: 'pointer' }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save beneficiary'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FinanceTransferContent() {
  const { account, balance, refetchFinanceData } = useOutletContext();
  const { mutate, isLoading } = useTransfer();
  const { mutate: resolveAccount } = useResolveInternalAccount();
  const { data: kycSubmission } = useFintechKycStatus(account?.accountNumber);
  const { data: benList, refetch: refetchBeneficiaries } = useWalletBeneficiaries(account?.accountNumber);
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };

  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({ receiverAccountNumber: '', amount: '', narration: '' });
  const [query, setQuery] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Recipient verification: no "Continue" until the receiver account number has been resolved to a real, distinct account.
  const [recipient, setRecipient] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const verifyToken = useRef(0);

  const availableNGN = parseFloat(balance?.availableBalance ?? 0) / 100;
  const amountNaira = parseFloat(form.amount || 0);
  const isSelf = form.receiverAccountNumber.length === 10 && form.receiverAccountNumber === account?.accountNumber;
  const saved = useMemo(() => (benList?.beneficiaries ?? []).find((b) => b.accountNumber === form.receiverAccountNumber), [benList, form.receiverAccountNumber]);

  useEffect(() => {
    setRecipient(null);
    setNotFoundError(false);
    const num = form.receiverAccountNumber;
    if (num.length !== 10 || num === account?.accountNumber) { setVerifying(false); return undefined; }

    verifyToken.current += 1;
    const myToken = verifyToken.current;
    setVerifying(true);
    const timer = setTimeout(async () => {
      try {
        const resolved = await resolveAccount(num);
        if (verifyToken.current === myToken) { setRecipient(resolved); setNotFoundError(false); }
      } catch {
        if (verifyToken.current === myToken) { setNotFoundError(true); setRecipient(null); }
      } finally {
        if (verifyToken.current === myToken) setVerifying(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [form.receiverAccountNumber, account?.accountNumber]);

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })); setError(''); }

  // Typing in the search box: ten digits become the account number (then verified as always); anything else is a name search.
  function onQuery(text) {
    setQuery(text);
    const digits = text.replace(/\D/g, '');
    if (/^\d+$/.test(text.trim()) && digits.length === 10) update('receiverAccountNumber', digits);
    else if (form.receiverAccountNumber && text !== form.receiverAccountNumber) update('receiverAccountNumber', '');
  }
  function choose(number) {
    setQuery('');
    update('receiverAccountNumber', number);
  }
  function clearRecipient() {
    setQuery('');
    update('receiverAccountNumber', '');
  }

  async function submitTransfer(otpCode) {
    setError('');
    try {
      const payload = {
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: form.receiverAccountNumber,
        // initiateTransfer's `amount` is naira, not kobo: it converts to kobo itself for the ledger call.
        amount: amountNaira,
        transactionPin: pin,
        narration: form.narration,
        // The backend re-verifies this exact pending transaction when confirming an OTP.
        ...(otpCode ? { otpCode, transactionReference: result?.transactionReference } : {}),
      };
      const res = await mutate(payload);
      if (res?.requiresOtp) { setStep(STEPS.OTP); setResult(res); return; }
      setResult(res);
      setStep(STEPS.SUCCESS);
      refetchFinanceData?.();
      refetchBeneficiaries?.();
    } catch (err) { setError(err.message); }
  }

  function reset() {
    setStep(STEPS.FORM);
    setForm({ receiverAccountNumber: '', amount: '', narration: '' });
    setQuery('');
    setPin(''); setOtp(''); setResult(null); setError('');
    setRecipient(null); setNotFoundError(false);
  }

  const overMonthlyAllowance = exceedsMonthlyAllowance(kycSubmission, amountNaira);
  const canContinue = !!recipient && !isSelf && form.amount && amountNaira > 0 && amountNaira <= availableNGN && !overMonthlyAllowance;
  let amountHelper = '';
  if (amountNaira > availableNGN) amountHelper = 'Insufficient balance';
  else if (overMonthlyAllowance) amountHelper = 'Exceeds your remaining monthly allowance';

  let continueLabel = `Continue with ${nairaFull(amountNaira * 100)}`;
  if (!form.receiverAccountNumber) continueLabel = 'Choose who to send to';
  else if (!recipient) continueLabel = 'Confirming the account…';
  else if (!(amountNaira > 0)) continueLabel = 'Enter an amount';
  else if (!canContinue) continueLabel = amountHelper || 'Check the details';

  const monthly = kycSubmission?.monthlyCapKobo != null ? kycSubmission : null;
  const allowanceUsedPct = monthly ? Math.min(100, (Number(monthly.monthlyUsedKobo) / Number(monthly.monthlyCapKobo)) * 100) : 0;
  const inputBase = { width: '100%', border: `2px solid ${tokens.borderColor}`, borderRadius: 14, padding: '14px 16px', fontSize: 16, background: tokens.cardBg, color: tokens.textPrimary, outline: 'none' };
  const primary = (enabled) => ({ width: '100%', padding: 15, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, cursor: enabled ? 'pointer' : 'not-allowed', background: enabled ? tokens.accentGradient : tokens.borderColor, color: enabled ? '#fff' : tokens.textMuted, boxShadow: enabled ? `0 6px 16px ${tokens.accentSolid}44` : 'none' });

  const summary = (
    <div style={{ ...card, position: 'sticky', top: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Summary</h3>
      {!recipient && !(amountNaira > 0) ? (
        <div style={{ textAlign: 'center', padding: 18, fontSize: 13, color: tokens.textMuted }}>Choose who you are sending to and the amount. Your summary appears here.</div>
      ) : (
        <>
          <Row label="To" value={recipient?.accountName ?? '—'} tokens={tokens} />
          <Row label="Account" value={form.receiverAccountNumber || '—'} tokens={tokens} />
          <Row label="Amount" value={nairaFull(amountNaira * 100)} tokens={tokens} />
          <Row label="Fee" value="₦0.00" tokens={tokens} />
          <Row label="Balance after" value={nairaFull((availableNGN - amountNaira) * 100)} tokens={tokens} />
          <Row label="Total" value={nairaFull(amountNaira * 100)} strong tokens={tokens} />
        </>
      )}
    </div>
  );

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Stepper step={step} tokens={tokens} />

      <AnimatePresence mode="wait">
        {step === STEPS.FORM && (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
            <div style={card}>
              <div style={{ background: tokens.accentSoft, borderRadius: 16, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: tokens.textSecondary }}>Sending from</div>
                <b style={{ color: tokens.textPrimary }}>{account?.accountName ?? '—'}</b>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: tokens.textSecondary }}>{account?.accountNumber ?? '—'}</div>
                <div style={{ fontSize: 13, color: tokens.success, fontWeight: 600, marginTop: 4 }}>Balance: {nairaFull(availableNGN * 100)}</div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Send to</div>
              {!form.receiverAccountNumber || (!recipient && !verifying && !notFoundError && !isSelf) ? (
                <RecipientPicker beneficiaries={benList?.beneficiaries} query={query} onQuery={onQuery} onChoose={choose} selectedNumber={form.receiverAccountNumber} />
              ) : (
                <div>
                  {verifying && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, border: `1px solid ${tokens.borderColor}`, background: tokens.pageBg }}>
                      <CircularProgress size={18} sx={{ color: tokens.accentSolid }} />
                      <span style={{ fontSize: 14, color: tokens.textMuted }}>Verifying account…</span>
                    </div>
                  )}
                  {isSelf && <Notice kind="warn" tokens={tokens}>You can't send money to your own account.</Notice>}
                  {notFoundError && <Notice kind="error" tokens={tokens}>No account found with that number. Double-check and try again.</Notice>}
                  {recipient && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', border: `2px solid ${tokens.accentSolid}`, borderRadius: 18, padding: 14, background: tokens.accentSoft }}>
                      <Avatar name={recipient.accountName} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontSize: 16, color: tokens.textPrimary }}>{recipient.accountName}</b>
                        <span style={{ display: 'block', color: tokens.textSecondary, fontSize: 13 }}>{form.receiverAccountNumber} · name confirmed{saved ? ' · saved' : ''}</span>
                      </div>
                      <button type="button" onClick={clearRecipient} style={{ color: tokens.textMuted, fontWeight: 700, padding: 6, background: 'none', border: 0, cursor: 'pointer' }}>Change</button>
                    </div>
                  )}
                  {(isSelf || notFoundError) && (
                    <button type="button" onClick={clearRecipient} style={{ marginTop: 6, color: tokens.accentSolid, fontWeight: 700, background: 'none', border: 0, cursor: 'pointer' }}>Choose someone else</button>
                  )}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Amount</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: `2px solid ${amountHelper ? tokens.danger : tokens.borderColor}`, borderRadius: 18, padding: '12px 18px', background: tokens.cardBg }}>
                  <b style={{ fontSize: 28, color: tokens.textMuted }}>₦</b>
                  <input
                    value={form.amount ? Number(form.amount.split('.')[0] || 0).toLocaleString('en-NG') + (form.amount.includes('.') ? `.${form.amount.split('.')[1]}` : '') : ''}
                    onChange={(e) => update('amount', e.target.value.replace(/[^0-9.]/g, ''))}
                    inputMode="decimal"
                    placeholder="0"
                    aria-label="Amount in naira"
                    style={{ border: 0, outline: 0, fontSize: 38, fontWeight: 800, width: '100%', background: 'none', letterSpacing: '-0.02em', color: tokens.textPrimary }}
                  />
                </div>
                {amountHelper && <div style={{ color: tokens.danger, fontSize: 13, marginTop: 6 }}>{amountHelper}</div>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {QUICK.map((q) => (
                    <button key={q} type="button" onClick={() => update('amount', String(q))} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 99, padding: '6px 14px', fontWeight: 700, fontSize: 13, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}>
                      ₦{q.toLocaleString('en-NG')}
                    </button>
                  ))}
                </div>
              </div>

              {monthly && (
                <div style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 16, padding: '12px 14px', margin: '16px 0', background: tokens.pageBg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: tokens.textSecondary }}>
                    <span>Monthly allowance (KYC pending)</span>
                    <b style={{ color: tokens.textPrimary }}>{nairaFull(monthly.monthlyRemainingKobo)} left</b>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: tokens.borderColor, overflow: 'hidden', margin: '8px 0 6px' }}>
                    <div style={{ width: `${Math.max(2, allowanceUsedPct)}%`, height: '100%', borderRadius: 99, background: allowanceUsedPct > 80 ? 'linear-gradient(90deg,#f59e0b,#dc2626)' : tokens.accentGradient }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: tokens.textSecondary }}>
                    <span>{nairaFull(monthly.monthlyUsedKobo)} of {nairaFull(monthly.monthlyCapKobo)} used</span>
                    <a href="/africanshops/finance-v2/kyc" style={{ color: tokens.accentSolid, fontWeight: 700, textDecoration: 'none' }}>Complete KYC to remove the limit</a>
                  </div>
                </div>
              )}

              <div style={{ margin: '16px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Narration <span style={{ color: tokens.textMuted, fontWeight: 500 }}>(optional)</span></div>
                <input value={form.narration} onChange={(e) => update('narration', e.target.value)} placeholder="e.g. Rent payment" style={inputBase} />
              </div>

              {error && <Notice kind="error" tokens={tokens}>{error}</Notice>}
              <button type="button" disabled={!canContinue} onClick={() => setStep(STEPS.PIN)} style={primary(canContinue)}>{continueLabel}</button>
            </div>
            {summary}
          </motion.div>
        )}

        {step !== STEPS.FORM && (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ ...card, maxWidth: 640, margin: '0 auto' }}>
            {step === STEPS.PIN && (
              <>
                <div style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 16, padding: 16, background: tokens.pageBg, marginBottom: 16 }}>
                  <Row label="To" value={<span>{recipient?.accountName}<span style={{ display: 'block', fontFamily: 'monospace', fontSize: 12, color: tokens.textMuted }}>{form.receiverAccountNumber}</span></span>} tokens={tokens} />
                  <Row label="Amount" value={nairaFull(amountNaira * 100)} strong tokens={tokens} />
                </div>
                <TransactionPinField value={pin} onChange={setPin} tokens={tokens} label="Enter transaction PIN" />
                {error && <Notice kind="error" tokens={tokens}>{error}</Notice>}
                <button type="button" disabled={pin.length < 6 || isLoading} onClick={() => submitTransfer()} style={primary(pin.length === 6 && !isLoading)}>
                  {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Confirm Transfer'}
                </button>
                <button type="button" onClick={() => { setStep(STEPS.FORM); setPin(''); }} style={{ marginTop: 8, color: tokens.textMuted, width: '100%', background: 'none', border: 0, cursor: 'pointer', fontSize: 14 }}>Back</button>
              </>
            )}

            {step === STEPS.OTP && (
              <>
                <div style={{ fontSize: 15, color: tokens.textPrimary, textAlign: 'center', marginBottom: 6 }}>An OTP has been sent to your registered email.</div>
                <TransactionPinField value={otp} onChange={setOtp} tokens={tokens} label="OTP code" masked={false} />
                {result?._devOtp && <div style={{ fontSize: 13, color: tokens.warning, textAlign: 'center', marginTop: 8 }}>DEV OTP: {result._devOtp}</div>}
                {error && <Notice kind="error" tokens={tokens}>{error}</Notice>}
                <button type="button" disabled={otp.length < 6 || isLoading} onClick={() => submitTransfer(otp)} style={primary(otp.length === 6 && !isLoading)}>
                  {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify & Send'}
                </button>
              </>
            )}

            {step === STEPS.SUCCESS && (
              <>
                <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }} style={{ width: 76, height: 76, borderRadius: '50%', background: tokens.successBg, margin: '0 auto 10px', display: 'grid', placeItems: 'center' }}>
                    <FuseSvgIcon size={36} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
                  </motion.div>
                  <h1 style={{ fontSize: 24, margin: '0 0 2px', color: tokens.textPrimary }}>{nairaFull(Number(result?.amount ?? amountNaira) * 100)} sent</h1>
                  <p style={{ margin: 0, color: tokens.textSecondary }}>Delivered to <b>{result?.receiverName ?? recipient?.accountName}</b> instantly</p>
                </div>
                <div style={{ border: `1px dashed ${tokens.borderColor}`, borderRadius: 18, padding: '6px 16px', margin: '16px 0', background: tokens.pageBg }}>
                  <Row label="From" value={result?.senderName ?? account?.accountName} tokens={tokens} />
                  <Row label="To" value={<span>{result?.receiverName ?? recipient?.accountName}<span style={{ display: 'block', fontFamily: 'monospace', fontSize: 12, color: tokens.textMuted }}>{result?.receiverAccountNumber ?? form.receiverAccountNumber}</span></span>} tokens={tokens} />
                  {(result?.narration || form.narration) && <Row label="Note" value={result?.narration ?? form.narration} tokens={tokens} />}
                  <Row label="Fee" value="₦0.00" tokens={tokens} />
                  <Row label="Reference" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>{result?.reference ?? '—'}</span>} tokens={tokens} />
                  <Row label="Date" value={(result?.completedAt ? new Date(result.completedAt) : new Date()).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })} tokens={tokens} />
                  {result?.senderBalance != null && <Row label="New balance" value={nairaFull(Number(result.senderBalance))} tokens={tokens} />}
                </div>

                {!saved && recipient && (
                  <SaveBeneficiary accountNumber={form.receiverAccountNumber} accountName={recipient.accountName} list={benList} account={account} onSaved={() => refetchBeneficiaries?.()} tokens={tokens} />
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button type="button" onClick={reset} style={{ ...primary(true), flex: 1 }}>New Transfer</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
