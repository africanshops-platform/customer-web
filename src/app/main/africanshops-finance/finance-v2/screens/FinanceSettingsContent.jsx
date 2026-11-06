import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import {
  useChangePin,
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

export default function FinanceSettingsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Settings</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Security and account preferences</Typography>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20 max-w-3xl">
        <motion.div variants={item}><ChangePinCard account={account} tokens={tokens} card={card} /></motion.div>
        <motion.div variants={item}><TransferLimitsCard account={account} tokens={tokens} card={card} /></motion.div>
      </motion.div>
    </div>
  );
}
