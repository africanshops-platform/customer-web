import { useEffect, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { useFeeQuote } from '../../hooks/useFintechApi';
import { nairaFull } from '../../financeFormat';
import { depositArrived, exactSendAmount, fundingErrorMessage } from '../../fundingHelpers';
import PaymentSummary from './PaymentSummary';

const POLL_MS = 6000;
const GIVE_UP_MS = 15 * 60 * 1000;

function CopyLine({ label, value, mono = true }) {
  const { tokens } = useFinanceTheme();
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the value is on screen to read
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${tokens.borderColor}`, borderRadius: 14, padding: '10px 14px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <small style={{ display: 'block', color: tokens.textMuted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</small>
        <b style={{ fontSize: 16, color: tokens.textPrimary, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.05em' : 0 }}>{value ?? '—'}</b>
      </div>
      <button type="button" onClick={copy} disabled={!value} style={{ fontSize: 12, fontWeight: 700, border: `1px solid ${tokens.accentSolid}55`, background: tokens.accentSoft, color: tokens.accentSolid, borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}

/**
 * Fund by bank transfer (board F18): the amount the person wants in the wallet gives the exact figure to send, drawn from the server's quote
 * (the charge is on top, so a sender who follows the screen gets exactly what they asked for). After "I've sent it" the screen follows the
 * wallet balance instead of leaving the person waiting in the dark, and says plainly when the money has arrived.
 *
 * `balanceKobo` is the wallet's current available balance and `refetch` refreshes it; both come from the finance shell.
 */
export default function BankTransferPanel({ amount, onAmountChange, showAmountInput = false, dva, balanceKobo, refetch, onReceived }) {
  const { tokens } = useFinanceTheme();
  const [phase, setPhase] = useState('calculate'); // calculate | waiting | received | stopped
  const [gotKobo, setGotKobo] = useState(0);
  const baseline = useRef(0);
  const startedAt = useRef(0);

  const wantedKobo = Math.round(parseFloat(amount || '0') * 100);
  const { data: quote, isFetching, error } = useFeeQuote('FUND_TRANSFER', wantedKobo);
  const showQuote = !!quote && quote.wantedKobo === wantedKobo;

  function startWaiting() {
    baseline.current = Number(balanceKobo ?? 0);
    startedAt.current = Date.now();
    setPhase('waiting');
  }

  // Ask for a fresh balance while waiting; give up after a while (the money is still added when it arrives).
  useEffect(() => {
    if (phase !== 'waiting') return undefined;
    const timer = setInterval(() => {
      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        setPhase('stopped');
        return;
      }
      refetch?.();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [phase, refetch]);

  // The balance prop moves when the refetch lands.
  useEffect(() => {
    if (phase === 'waiting' && depositArrived(baseline.current, Number(balanceKobo))) {
      setGotKobo(Number(balanceKobo) - baseline.current);
      setPhase('received');
      onReceived?.();
    }
  }, [phase, balanceKobo, onReceived]);

  const box = { border: `1px solid ${tokens.cardBorder}`, borderRadius: 16, padding: 16, background: tokens.cardBg, display: 'grid', gap: 12 };

  return (
    <div data-testid="bank-transfer-panel" style={box}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i style={{ fontStyle: 'normal', width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 20, background: tokens.accentSoft }}>🏦</i>
        <div>
          <b style={{ display: 'block', color: tokens.textPrimary }}>Bank transfer</b>
          <span style={{ fontSize: 13, color: tokens.textSecondary }}>The lower-charge way, from any Nigerian bank.</span>
        </div>
      </div>

      {dva?.accountNumber && (
        <div style={{ display: 'grid', gap: 8 }}>
          <CopyLine label="Account number" value={dva.accountNumber} />
          <CopyLine label="Bank" value={dva.bankName} mono={false} />
          <CopyLine label="Account name" value={dva.accountName} mono={false} />
        </div>
      )}

      {phase === 'received' && (
        <div data-testid="deposit-received" style={{ background: tokens.successBg, color: tokens.success, borderRadius: 14, padding: '12px 14px', fontSize: 14 }}>
          <b>{nairaFull(gotKobo)} has arrived in your wallet.</b>
          <div>
            <button type="button" data-testid="fund-again" onClick={() => { setPhase('calculate'); onAmountChange?.(''); }} style={{ marginTop: 6, border: 0, background: 'none', padding: 0, fontWeight: 700, color: tokens.accentSolid, cursor: 'pointer' }}>Fund again</button>
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div data-testid="deposit-waiting" style={{ background: tokens.accentSoft, borderRadius: 14, padding: '12px 14px', display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CircularProgress size={18} sx={{ color: tokens.accentSolid }} />
            <b style={{ color: tokens.textPrimary }}>Waiting for your transfer…</b>
          </div>
          <span style={{ fontSize: 13, color: tokens.textSecondary }}>Banks usually take under a minute. You can leave this page; it is added to your wallet as soon as it arrives.</span>
          <button type="button" data-testid="stop-waiting" onClick={() => setPhase('calculate')} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, fontSize: 13, color: tokens.textMuted, cursor: 'pointer' }}>Stop watching</button>
        </div>
      )}

      {(phase === 'calculate' || phase === 'stopped') && (
        <>
          {phase === 'stopped' && (
            <div data-testid="deposit-stopped" style={{ fontSize: 13, color: tokens.textSecondary }}>
              We stopped watching. If you did send it, it is still added to your wallet when it arrives. Refresh to check.
            </div>
          )}
          {showAmountInput && (
            <div style={{ display: 'grid', gap: 6 }}>
              <span id="bank-transfer-amount-label" style={{ fontSize: 13, fontWeight: 700, color: tokens.textPrimary }}>How much do you want in your wallet?</span>
              <input
                id="bank-transfer-amount"
                value={amount}
                onChange={(e) => onAmountChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="0"
                aria-labelledby="bank-transfer-amount-label"
                style={{ border: `2px solid ${tokens.borderColor}`, borderRadius: 14, padding: '10px 14px', fontSize: 20, fontWeight: 800, background: tokens.cardBg, color: tokens.textPrimary }}
              />
            </div>
          )}
          {isFetching && !showQuote && <CircularProgress size={18} sx={{ color: tokens.accentSolid }} />}
          {!!error && !showQuote && (
            <div data-testid="transfer-quote-error" style={{ fontSize: 13, color: tokens.textSecondary }}>
              {fundingErrorMessage(error, 'We could not work out the charge just now.')} You can still send money to this account; the charge is worked out on what arrives.
            </div>
          )}
          {showQuote && (
            <>
              <PaymentSummary lines={quote.lines} totalLabel="Send exactly" totalKobo={quote.grossKobo} />
              <CopyLine label="Amount to send" value={exactSendAmount(quote.grossKobo)} />
              <button type="button" data-testid="i-have-sent" onClick={startWaiting} style={{ padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, background: tokens.accentGradient, color: '#fff', cursor: 'pointer', boxShadow: `0 6px 16px ${tokens.accentSolid}44` }}>
                I&apos;ve sent it
              </button>
            </>
          )}
          <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.5 }}>Send the exact amount shown. If you send a different amount, the same charge rule is applied to what arrives.</div>
        </>
      )}
    </div>
  );
}
