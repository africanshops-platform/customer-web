import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransfer, useResolveInternalAccount, useFintechKycStatus } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import PartialKycAllowanceBanner, { exceedsMonthlyAllowance } from './shared/PartialKycAllowanceBanner';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  amountLg:    'clamp(2rem,    3.2vw, 2.8rem)',
};

function fieldSx(tokens, fontSize = '1.5rem') {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: tokens.pageBg,
      '& fieldset': { borderColor: tokens.borderColor },
      '&:hover fieldset': { borderColor: tokens.accentSolid },
      '&.Mui-focused fieldset': { borderColor: tokens.accentSolid },
    },
    '& input': { color: tokens.textPrimary, fontSize },
    '& .MuiInputLabel-root': { color: tokens.textMuted, fontSize },
    '& .MuiInputLabel-root.Mui-focused': { color: tokens.accentSolid },
    '& .MuiFormHelperText-root': { color: tokens.textMuted, fontSize: F.small },
  };
}

const STEPS = { FORM: 'form', PIN: 'pin', OTP: 'otp', SUCCESS: 'success' };

/** Recipient verification card shown under the account-number field — the load-bearing piece of the "verify before Continue" flow. */
function RecipientCard({ tokens, verifying, recipient, selfError, notFoundError }) {
  if (verifying) {
    return (
      <div className="rounded-2xl p-16 flex items-center gap-12" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
        <CircularProgress size={18} sx={{ color: tokens.accentSolid }} />
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Verifying account…</Typography>
      </div>
    );
  }
  if (selfError) {
    return (
      <Alert severity="warning" sx={{ borderRadius: '10px', fontSize: F.small, background: tokens.warningBg, color: tokens.warning, '& .MuiAlert-icon': { color: tokens.warning } }}>
        You can't send money to your own account.
      </Alert>
    );
  }
  if (notFoundError) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px', fontSize: F.small, background: tokens.dangerBg, color: tokens.danger, '& .MuiAlert-icon': { color: tokens.danger } }}>
        No account found with that number. Double-check and try again.
      </Alert>
    );
  }
  if (recipient) {
    return (
      <div className="rounded-2xl p-16 flex items-center gap-12" style={{ background: tokens.successBg, border: `1px solid ${tokens.success}44` }}>
        <div className="w-36 h-36 rounded-full flex items-center justify-center shrink-0" style={{ background: `${tokens.success}22` }}>
          <FuseSvgIcon size={18} style={{ color: tokens.success }}>heroicons-solid:check-circle</FuseSvgIcon>
        </div>
        <div className="min-w-0">
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Sending to</Typography>
          <Typography className="truncate" style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary }}>{recipient.accountName}</Typography>
        </div>
      </div>
    );
  }
  return null;
}

export default function FinanceTransferContent() {
  const { account, balance, refetchFinanceData } = useOutletContext();
  const { mutate, isLoading } = useTransfer();
  const { mutate: resolveAccount } = useResolveInternalAccount();
  const { data: kycSubmission } = useFintechKycStatus(account?.accountNumber);
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({ receiverAccountNumber: '', amount: '', narration: '' });
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Recipient verification — no "Continue" until the receiver account number
  // has been resolved to a real, distinct account name.
  const [recipient, setRecipient] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const verifyToken = useRef(0);

  const availableNGN = parseFloat(balance?.availableBalance ?? 0) / 100;
  const amountNaira  = parseFloat(form.amount || 0);
  const isSelf = form.receiverAccountNumber.length === 10 && form.receiverAccountNumber === account?.accountNumber;

  useEffect(() => {
    setRecipient(null);
    setNotFoundError(false);
    const num = form.receiverAccountNumber;
    if (num.length !== 10 || num === account?.accountNumber) { setVerifying(false); return undefined; }

    const myToken = ++verifyToken.current;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.receiverAccountNumber, account?.accountNumber]);

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); setError(''); }

  async function submitTransfer(otpCode) {
    setError('');
    try {
      const payload = {
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: form.receiverAccountNumber,
        // Retail-N (2026-07-13) bugfix: initiateTransfer's `amount` is naira,
        // not kobo — it does its own naira->kobo conversion internally for
        // the ledger call (unlike withdrawal/external-transfer, which take
        // amountKobo directly). Sending amountNaira * 100 here silently
        // multiplied every internal transfer by 100x.
        amount: amountNaira,
        transactionPin: pin,
        narration: form.narration,
        // The backend re-verifies this exact pending transaction when
        // confirming an OTP — it can't be regenerated client-side.
        ...(otpCode ? { otpCode, transactionReference: result?.transactionReference } : {}),
      };
      const res = await mutate(payload);
      if (res?.requiresOtp) { setStep(STEPS.OTP); setResult(res); return; }
      setResult(res);
      setStep(STEPS.SUCCESS);
      refetchFinanceData?.();
    } catch (err) { setError(err.message); }
  }

  function reset() {
    setStep(STEPS.FORM);
    setForm({ receiverAccountNumber: '', amount: '', narration: '' });
    setPin(''); setOtp(''); setResult(null); setError('');
    setRecipient(null); setNotFoundError(false);
  }

  function PinDots({ value }) {
    return (
      <div className="flex gap-10 justify-center my-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-full transition-all duration-200"
            style={{ background: i < value.length ? tokens.accentSolid : tokens.borderColor, transform: i < value.length ? 'scale(1.2)' : 'scale(1)' }} />
        ))}
      </div>
    );
  }

  const stepLabels = ['Details', 'PIN', 'Confirm', 'Done'];
  const stepKeys   = [STEPS.FORM, STEPS.PIN, STEPS.OTP, STEPS.SUCCESS];
  const errorAlertSx = { borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small, '& .MuiAlert-icon': { color: tokens.danger } };

  const overMonthlyAllowance = exceedsMonthlyAllowance(kycSubmission, amountNaira);
  const canContinue = !!recipient && !isSelf && form.amount && amountNaira > 0 && amountNaira <= availableNGN && !overMonthlyAllowance;
  let amountHelperText = '';
  if (amountNaira > availableNGN) amountHelperText = 'Insufficient balance';
  else if (overMonthlyAllowance) amountHelperText = 'Exceeds your remaining monthly allowance';

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24 flex justify-center">
      <div className="w-full max-w-md">
        <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Send Money</Typography>
        <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Instant account-to-account transfer</Typography>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-28">
          {stepLabels.map((s, i) => {
            const stepIndex = stepKeys.indexOf(step);
            const done = i < stepIndex, active = i === stepIndex;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center font-bold transition-all duration-300"
                    style={{ fontSize: F.small, background: done || active ? tokens.accentGradient : tokens.borderColor, color: done || active ? '#ffffff' : tokens.textMuted }}>
                    {done ? <FuseSvgIcon size={16} className="text-white">heroicons-solid:check</FuseSvgIcon> : i + 1}
                  </div>
                  <Typography style={{ fontSize: F.small, color: active ? tokens.accentSolid : tokens.textMuted }}>{s}</Typography>
                </div>
                {i < 3 && <div className="flex-1 h-1 mx-4" style={{ background: done ? tokens.accentSolid : tokens.borderColor }} />}
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl p-24" style={card}>
          <AnimatePresence mode="wait">
            {step === STEPS.FORM && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                <div className="rounded-2xl p-16" style={{ background: tokens.accentSoft }}>
                  <Typography style={{ fontSize: F.small, color: tokens.textSecondary, marginBottom: 4 }}>Sending from</Typography>
                  <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary }}>{account?.accountName ?? '—'}</Typography>
                  <Typography style={{ fontSize: F.label, fontFamily: 'monospace', color: tokens.textSecondary, marginBottom: 8 }}>{account?.accountNumber ?? '—'}</Typography>
                  <Typography style={{ fontSize: F.small, color: tokens.success, fontWeight: 600 }}>Balance: ₦{availableNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                </div>

                <TextField label="Receiver Account Number" value={form.receiverAccountNumber}
                  onChange={e => update('receiverAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  fullWidth inputProps={{ maxLength: 10 }} helperText="10-digit account number" sx={fieldSx(tokens, F.body)} />

                <RecipientCard tokens={tokens} verifying={verifying} recipient={recipient} selfError={isSelf} notFoundError={notFoundError} />

                <PartialKycAllowanceBanner submission={kycSubmission} />

                <TextField label="Amount (₦)" value={form.amount}
                  onChange={e => update('amount', e.target.value.replace(/[^0-9.]/g, ''))}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography style={{ color: tokens.textMuted, fontSize: F.body }}>₦</Typography></InputAdornment> }}
                  error={amountNaira > availableNGN || overMonthlyAllowance}
                  helperText={amountHelperText}
                  sx={{ ...fieldSx(tokens, F.body), '& .MuiFormHelperText-root.Mui-error': { color: tokens.danger } }} />

                <TextField label="Narration (optional)" value={form.narration}
                  onChange={e => update('narration', e.target.value)} fullWidth
                  placeholder="e.g. Rent payment" sx={fieldSx(tokens, F.body)} />

                {error && <Alert severity="error" sx={errorAlertSx}>{error}</Alert>}

                <Button variant="contained" fullWidth
                  disabled={!canContinue}
                  onClick={() => setStep(STEPS.PIN)}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
                  Continue
                </Button>
              </motion.div>
            )}

            {step === STEPS.PIN && (
              <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-20 rounded-2xl p-16" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.body, color: tokens.textSecondary }}>To</Typography>
                    <div style={{ textAlign: 'right' }}>
                      <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary }}>{recipient?.accountName}</Typography>
                      <Typography style={{ fontSize: F.small, fontFamily: 'monospace', color: tokens.textMuted }}>{form.receiverAccountNumber}</Typography>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Typography style={{ fontSize: F.body, color: tokens.textSecondary }}>Amount</Typography>
                    <Typography style={{ fontSize: F.amountLg, fontWeight: 700, color: tokens.accentSolid }}>₦{parseFloat(form.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                  </div>
                </div>

                <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>Enter transaction PIN</Typography>
                <PinDots value={pin} />
                <TextField type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••" fullWidth
                  inputProps={{ maxLength: 6, inputMode: 'numeric', style: { textAlign: 'center', fontSize: 28, letterSpacing: 14, color: tokens.textPrimary } }}
                  sx={fieldSx(tokens, F.body)} />

                {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}

                <Button variant="contained" fullWidth disabled={pin.length < 6 || isLoading} onClick={() => submitTransfer()}
                  sx={{ mt: 3, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
                  {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Confirm Transfer'}
                </Button>
                <Button onClick={() => { setStep(STEPS.FORM); setPin(''); }} sx={{ mt: 1, color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>Back</Button>
              </motion.div>
            )}

            {step === STEPS.OTP && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Typography style={{ fontSize: F.body, color: tokens.textPrimary, marginBottom: 4 }}>An OTP has been sent to your registered email.</Typography>
                <TextField label="OTP Code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  fullWidth inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 28, letterSpacing: 14, color: tokens.textPrimary } }}
                  sx={{ ...fieldSx(tokens, F.body), mt: 2 }} />
                {result?._devOtp && (
                  <Typography style={{ fontSize: F.small, color: tokens.warning, textAlign: 'center', marginTop: 8 }}>DEV OTP: {result._devOtp}</Typography>
                )}
                {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}
                <Button variant="contained" fullWidth disabled={otp.length < 6 || isLoading} onClick={() => submitTransfer(otp)}
                  sx={{ mt: 3, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
                  {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify & Send'}
                </Button>
              </motion.div>
            )}

            {step === STEPS.SUCCESS && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center pt-8 pb-24">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-72 h-72 rounded-full flex items-center justify-center mx-auto mb-16"
                    style={{ background: tokens.successBg }}>
                    <FuseSvgIcon size={36} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
                  </motion.div>
                  <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.textPrimary, marginBottom: 4 }}>Transfer Successful!</Typography>
                  <Typography style={{ fontSize: F.amountLg, fontWeight: 800, color: tokens.success }}>
                    ₦{Number(result?.amount ?? amountNaira).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Typography>
                </div>

                <div className="rounded-2xl p-20 mb-16" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                  <div className="flex justify-between mb-10">
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>From</Typography>
                    <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>{result?.senderName ?? account?.accountName}</Typography>
                  </div>
                  <div className="flex justify-between mb-10">
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>To</Typography>
                    <div style={{ textAlign: 'right' }}>
                      <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>{result?.receiverName ?? recipient?.accountName}</Typography>
                      <Typography style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: tokens.textMuted }}>{result?.receiverAccountNumber ?? form.receiverAccountNumber}</Typography>
                    </div>
                  </div>
                  {(result?.narration || form.narration) && (
                    <div className="flex justify-between mb-10">
                      <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Note</Typography>
                      <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>{result?.narration ?? form.narration}</Typography>
                    </div>
                  )}
                  <div className="flex justify-between mb-10 pt-10" style={{ borderTop: `1px dashed ${tokens.borderColor}` }}>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Reference</Typography>
                    <Typography style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: tokens.textPrimary }}>{result?.reference ?? '—'}</Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Date</Typography>
                    <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>
                      {result?.completedAt ? new Date(result.completedAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </Typography>
                  </div>
                  {result?.senderBalance != null && (
                    <div className="flex justify-between mt-10 pt-10" style={{ borderTop: `1px dashed ${tokens.borderColor}` }}>
                      <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>New balance</Typography>
                      <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.success }}>₦{(Number(result.senderBalance) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Button variant="contained" onClick={reset}
                    sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, px: 4, textTransform: 'none', fontSize: F.body }}>
                    New Transfer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
