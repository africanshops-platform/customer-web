import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { useAppSelector } from 'app/store/hooks';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import { useVerifyWalletFunding } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { nairaFull } from '../financeFormat';

// Fund account, as in the approved preview: the default wallet, a choice of card or bank transfer, a large amount
// field with quick amounts. The card payment is the old one, unchanged: Paystack inline checkout with the same reference
// format, the payment verified on the server before the balance moves, the same minimum (100 naira).

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const QUICK = [5000, 10000, 50000, 100000];

export default function FinanceFundAccountContent() {
  const { account, balance, balanceLoading, refetchFinanceData } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const user = useAppSelector(selectUser);
  const { mutate: verifyFunding, isLoading: verifying, error: verifyError } = useVerifyWalletFunding();

  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };
  const amountNaira = parseFloat(amount);
  const amountValid = amountNaira >= 100;
  // A unique reference per payment, prefixed so the server can tell wallet funding apart from other Paystack payments.
  const reference = `AFSHFUND${account?.accountNumber ?? ''}${Date.now()}`;

  const initializePayment = usePaystackPayment({
    reference,
    email: user?.email,
    amount: amountValid ? Math.round(amountNaira * 100) : 0,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  });

  // Paystack confirms the charge to the browser; the server re-verifies the reference before crediting the wallet.
  async function handleSuccess(paystackResponse) {
    setSuccess('');
    try {
      await verifyFunding(account?.accountNumber, paystackResponse.reference);
      setSuccess('Payment confirmed. Your balance has been updated.');
      setAmount('');
      refetchFinanceData?.();
    } catch {
      // verifyError is shown by the hook state
    }
  }

  function handleFundClick() {
    if (!amountValid || !user?.email) return;
    initializePayment({ onSuccess: handleSuccess, onClose: () => undefined });
  }

  const shown = amount ? Number(amount.split('.')[0] || 0).toLocaleString('en-NG') + (amount.includes('.') ? `.${amount.split('.')[1]}` : '') : '';
  const optionStyle = (on) => ({ border: `2px solid ${on ? tokens.accentSolid : tokens.cardBorder}`, borderRadius: 20, padding: 18, background: tokens.cardBg, textAlign: 'left', display: 'block', textDecoration: 'none', boxShadow: on ? `0 8px 22px ${tokens.accentSolid}22` : 'none', cursor: 'pointer' });
  const iconBox = { fontStyle: 'normal', width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 22, background: tokens.accentSoft, marginBottom: 10 };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
        <motion.div variants={item} style={{ background: tokens.heroBg, color: '#fff', borderRadius: 24, padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Default wallet</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', margin: '6px 0 12px' }}>{balanceLoading ? '—' : nairaFull(balance?.availableBalance)}</div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Account number</div>
              <b style={{ fontSize: 16, letterSpacing: '0.08em' }}>{account?.accountNumber ?? '—'}</b>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Account name</div>
              <b style={{ fontSize: 16 }}>{account?.accountName ?? '—'}</b>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={optionStyle(true)}>
            <i style={iconBox}>💳</i>
            <b style={{ display: 'block', fontSize: 16, color: tokens.textPrimary }}>Pay with card</b>
            <span style={{ color: tokens.textSecondary, fontSize: 13 }}>Instant, through Paystack. Minimum ₦100.</span>
          </div>
          <Link to="/africanshops/finance-v2/receive-money" style={optionStyle(false)}>
            <i style={iconBox}>🏦</i>
            <b style={{ display: 'block', fontSize: 16, color: tokens.textPrimary }}>Bank transfer</b>
            <span style={{ color: tokens.textSecondary, fontSize: 13 }}>Send to your own account number from any bank. See your details.</span>
          </Link>
        </motion.div>

        <motion.div variants={item} style={card}>
          {success && <div style={{ background: tokens.successBg, color: tokens.success, borderRadius: 14, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>{success}</div>}
          {verifyError && <div style={{ background: tokens.dangerBg, color: tokens.danger, borderRadius: 14, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>{verifyError}</div>}

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Amount to add</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: `2px solid ${tokens.borderColor}`, borderRadius: 18, padding: '12px 18px', background: tokens.cardBg }}>
            <b style={{ fontSize: 28, color: tokens.textMuted }}>₦</b>
            <input
              value={shown}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              aria-label="Amount in naira"
              style={{ border: 0, outline: 0, fontSize: 38, fontWeight: 800, width: '100%', background: 'none', letterSpacing: '-0.02em', color: tokens.textPrimary }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setAmount(String(q))} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 99, padding: '6px 14px', fontWeight: 700, fontSize: 13, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}>
                ₦{q.toLocaleString('en-NG')}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: tokens.textSecondary, padding: '6px 0' }}><span>Fee</span><b style={{ color: tokens.textPrimary }}>₦0.00</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: tokens.textSecondary, padding: '6px 0 16px' }}><span>You will receive</span><b style={{ color: tokens.textPrimary }}>{amountValid ? nairaFull(amountNaira * 100) : '₦0.00'}</b></div>

          {verifying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: 14 }}>
              <CircularProgress size={20} sx={{ color: tokens.accentSolid }} />
              <span style={{ fontSize: 14, color: tokens.textMuted }}>Confirming payment…</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFundClick}
              disabled={!amountValid}
              style={{ width: '100%', padding: 15, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, background: amountValid ? tokens.accentGradient : tokens.borderColor, color: amountValid ? '#fff' : tokens.textMuted, cursor: amountValid ? 'pointer' : 'not-allowed', boxShadow: amountValid ? `0 6px 16px ${tokens.accentSolid}44` : 'none' }}
            >
              {amountValid ? `Fund ₦${amountNaira.toLocaleString('en-NG')}` : 'Enter an amount (minimum ₦100)'}
            </button>
          )}
          <div style={{ fontSize: 13, color: tokens.textMuted, marginTop: 14, lineHeight: 1.5 }}>Funds land in your default wallet immediately after the payment confirms.</div>
        </motion.div>
      </motion.div>
    </div>
  );
}
