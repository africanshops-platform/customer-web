import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import {
  useChangePin,
  useTransferLimits,
} from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F } from '../financeUiTokens';
import TransactionPinField from './shared/TransactionPinField';
import ForgotPinDialog from './shared/ForgotPinDialog';
import TransferLimitsCard from './shared/TransferLimitsCard';

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Retail-7 (2026-07-12): consolidates two previously-scattered concerns —
// PIN management (was only reachable inline mid-transaction) and self-service
// transfer limits (new) — into one settings home, matching the shop-dashboard
// pattern the founder referenced when first asking for a transaction PIN.
function ChangePinCard({ account, tokens, card }) {
  const { mutate: changePin, isLoading, error: apiError } = useChangePin();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const pinsMatch = newPin.length === 6 && newPin === confirmNewPin;
  const canSubmit = oldPin.length === 6 && pinsMatch && !isLoading;

  async function handleSubmit() {
    setSuccess('');
    try {
      await changePin(account?.accountNumber, { oldPin, newPin, confirmNewPin });
      setSuccess('PIN changed successfully.');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
    } catch {
      // error surfaced via apiError
    }
  }

  return (
    <div className="rounded-2xl p-24" style={card}>
      <div className="flex items-center gap-12 mb-20">
        <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.accentSoft }}>
          <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }}>heroicons-outline:lock-closed</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Transaction PIN</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Confirms every withdrawal, transfer, and payout</Typography>
        </div>
      </div>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
      {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{apiError}</Alert>}

      <div className="grid gap-16 max-w-sm">
        <TransactionPinField value={oldPin} onChange={setOldPin} tokens={tokens} label="Current PIN" />
        <TransactionPinField value={newPin} onChange={setNewPin} tokens={tokens} label="New PIN" />
        <div>
          <TransactionPinField value={confirmNewPin} onChange={setConfirmNewPin} tokens={tokens} label="Confirm new PIN" />
          {confirmNewPin.length === 6 && !pinsMatch && (
            <Typography style={{ fontSize: F.small, color: tokens.danger, textAlign: 'center', marginTop: 4 }}>PINs do not match</Typography>
          )}
        </div>
      </div>

      <div className="flex items-center gap-16 mt-20">
        <Button
          variant="contained" disabled={!canSubmit} onClick={handleSubmit}
          sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.2, px: 3, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Change PIN'}
        </Button>
        <Button onClick={() => setForgotOpen(true)} sx={{ color: tokens.textMuted, textTransform: 'none', fontSize: F.small }}>
          Forgot PIN?
        </Button>
      </div>

      <ForgotPinDialog open={forgotOpen} onClose={() => setForgotOpen(false)} tokens={tokens} />
    </div>
  );
}

/** Right column: where the account stands on security today, from data the app already has. */
function SecurityOverview({ account, tokens, card }) {
  const { data: limits } = useTransferLimits(account?.accountNumber);
  const verified = account?.kycStatus === 'verified';
  const pending = limits?.pendingChange;
  const rows = [
    { ok: true, title: 'Transaction PIN', text: 'Set. Every transfer, withdrawal and payout asks for it.' },
    { ok: verified, title: 'Identity verification', text: verified ? 'Verified. No monthly cap on moving money.' : 'Not complete. Verify to raise your limits.', to: verified ? null : '/africanshops/finance-v2/kyc', cta: 'Verify now' },
    { ok: !!account?.dvaProvisioned, title: 'Receive-money account', text: account?.dvaProvisioned ? 'Set up. Anyone can pay you by bank transfer.' : 'Not set up yet.', to: account?.dvaProvisioned ? null : '/africanshops/finance-v2/receive-money', cta: 'Set up' },
    { ok: limits?.dailyTransferLimitKobo != null, title: 'Daily limit', text: limits?.dailyTransferLimitKobo != null ? `Currently ₦${(limits.dailyTransferLimitKobo / 100).toLocaleString('en-NG')} a day${pending?.newDailyTransferLimitKobo ? `, rising to ₦${(pending.newDailyTransferLimitKobo / 100).toLocaleString('en-NG')}` : ''}.` : 'No daily limit set.' },
  ];
  return (
    <div style={{ display: 'grid', gap: 16, position: 'sticky', top: 16 }}>
      <div style={{ ...card, borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Your security</h3>
        {rows.map((r, i) => (
          <div key={r.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < rows.length - 1 ? `1px dashed ${tokens.borderColor}` : 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', flex: 'none', fontWeight: 800, fontSize: 14, background: r.ok ? tokens.successBg : tokens.warningBg, color: r.ok ? tokens.success : tokens.warning }}>{r.ok ? '✓' : '!'}</div>
            <div style={{ fontSize: 13.5, color: tokens.textSecondary, flex: 1 }}>
              <b style={{ display: 'block', color: tokens.textPrimary }}>{r.title}</b>
              {r.text}
              {r.to && <Link to={r.to} style={{ display: 'block', marginTop: 4, color: tokens.accentSolid, fontWeight: 700, textDecoration: 'none' }}>{r.cta}</Link>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...card, borderRadius: 20, padding: 20, background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33`, boxShadow: 'none' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Keeping your money safe</h3>
        {[
          ['🔒', 'Never share your PIN', 'No one from AfricanShops will ever ask for it.'],
          ['✉', 'Codes come by email', 'Larger payments and limit raises ask for a code we email you. Keep your email secure.'],
          ['⏳', 'Limit raises wait 24 hours', 'So a stolen PIN cannot raise your limit and drain the account in one go.'],
        ].map(([icon, title, text]) => (
          <div key={title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: tokens.cardBg, display: 'grid', placeItems: 'center', fontSize: 14, flex: 'none' }}>{icon}</div>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}><b style={{ display: 'block', color: tokens.textPrimary }}>{title}</b>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinanceSettingsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div className="grid gap-20" style={{ minWidth: 0 }}>
          <motion.div variants={item}><ChangePinCard account={account} tokens={tokens} card={card} /></motion.div>
          <motion.div variants={item}><TransferLimitsCard account={account} tokens={tokens} card={card} /></motion.div>
        </div>
        <motion.div variants={item}><SecurityOverview account={account} tokens={tokens} card={card} /></motion.div>
      </motion.div>
    </div>
  );
}
