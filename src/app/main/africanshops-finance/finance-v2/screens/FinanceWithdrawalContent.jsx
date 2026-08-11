import { useState, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useWithdrawalInitiate, useWithdrawalConfirm, useBanksList, useDeleteBeneficiary, useFintechKycStatus } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F, fieldSx } from '../financeUiTokens';
import OtpTimer from './shared/OtpTimer';
import BeneficiaryPicker from './shared/BeneficiaryPicker';
import TransactionPinField from './shared/TransactionPinField';
import ForgotPinDialog from './shared/ForgotPinDialog';
import PartialKycAllowanceBanner, { exceedsMonthlyAllowance } from './shared/PartialKycAllowanceBanner';

export default function FinanceWithdrawalContent() {
  const { account, balance, refetchFinanceData } = useOutletContext();
  const { mutate: initiate, isLoading: initiating } = useWithdrawalInitiate();
  const { mutate: confirm, isLoading: confirming } = useWithdrawalConfirm();
  const { mutate: deleteBeneficiary } = useDeleteBeneficiary();
  const { data: banks, isLoading: banksLoading } = useBanksList();
  const { data: kycSubmission } = useFintechKycStatus(account?.accountNumber);
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const errorAlertSx = { borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small, '& .MuiAlert-icon': { color: tokens.danger } };

  const bankNameByCode = useMemo(() => {
    const map = {};
    (banks ?? []).forEach(b => { map[b.code] = b.name; });
    return map;
  }, [banks]);

  const [step, setStep] = useState('form'); // form -> confirm -> otp (conditional) -> success
  const [form, setForm] = useState({ amountNGN: '' });
  const [beneficiary, setBeneficiary] = useState(null);
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [btxData, setBtxData] = useState(null);
  const [result, setResult] = useState(null);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [error, setError] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);
  const [forgotPinOpen, setForgotPinOpen] = useState(false);

  const idempotencyKey = useRef(`WD-${crypto.randomUUID()}`);

  const availableNGN = parseFloat(balance?.availableBalance ?? 0) / 100;
  const amountNGN = parseFloat(form.amountNGN || 0);
  const overMonthlyAllowance = exceedsMonthlyAllowance(kycSubmission, amountNGN);
  let amountHelperText = 'Paystack + platform fees are added on top and shown at confirmation';
  if (amountNGN > availableNGN && amountNGN > 0) amountHelperText = 'Exceeds available balance';
  else if (overMonthlyAllowance) amountHelperText = 'Exceeds your remaining monthly allowance';

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  }

  async function handleConfirmPin() {
    if (pin.length < 6) return;
    setError('');
    try {
      const payload = {
        amountKobo: Math.round(amountNGN * 100),
        beneficiaryId: beneficiary.id,
        idempotencyKey: idempotencyKey.current,
        transactionPin: pin,
      };
      const res = await initiate(payload);
      setBtxData(res);
      if (res.requiresOtp) {
        setStep('otp');
      } else {
        setResult(res);
        setStep('success');
        refetchFinanceData?.();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmOtp() {
    if (otpExpired) { setError('OTP has expired. Please start a new withdrawal.'); return; }
    setError('');
    try {
      const res = await confirm({ btxId: btxData.btxId, otp });
      setResult(res);
      setStep('success');
      refetchFinanceData?.();
    } catch (err) {
      setError(err.message);
      if (err.status === 410) setOtpExpired(true);
    }
  }

  async function handleDone() {
    if (beneficiary?._isNewlyAdded && !saveBeneficiary) {
      deleteBeneficiary(beneficiary.id, account.accountNumber).catch(() => {});
    }
    restart();
  }

  function restart() {
    setStep('form');
    setForm({ amountNGN: '' });
    setBeneficiary(null);
    setPin('');
    setOtp('');
    setBtxData(null);
    setResult(null);
    setSaveBeneficiary(false);
    setError('');
    setOtpExpired(false);
    idempotencyKey.current = `WD-${crypto.randomUUID()}`;
  }

  const bankName = bankNameByCode[beneficiary?.beneficiaryBankCode] ?? beneficiary?.beneficiaryBankCode;

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24 flex justify-center">
      <div className="w-full max-w-md">
        <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Withdraw Funds</Typography>
        <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 24 }}>Send money to any Nigerian bank account</Typography>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
              <div className="rounded-3xl p-24 space-y-16" style={card}>
                <div className="flex items-center justify-between rounded-xl px-16 py-12" style={{ background: tokens.accentSoft }}>
                  <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Available</Typography>
                  <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.success }}>₦{availableNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                </div>

                <TextField
                  label="Amount (₦)"
                  value={form.amountNGN}
                  onChange={e => update('amountNGN', e.target.value.replace(/[^0-9.]/g, ''))}
                  fullWidth
                  error={(amountNGN > availableNGN && amountNGN > 0) || overMonthlyAllowance}
                  helperText={amountHelperText}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography style={{ color: tokens.textMuted, fontSize: F.body }}>₦</Typography></InputAdornment> }}
                  sx={{ ...fieldSx(tokens), '& .MuiFormHelperText-root.Mui-error': { color: tokens.danger } }}
                />

                <PartialKycAllowanceBanner submission={kycSubmission} />
              </div>

              <BeneficiaryPicker
                account={account}
                tokens={tokens}
                card={card}
                selectedId={beneficiary?.id}
                onSelect={setBeneficiary}
                banks={banks}
                banksLoading={banksLoading}
                bankNameByCode={bankNameByCode}
                requireVerified
              />

              {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}

              <Button
                variant="contained"
                fullWidth
                disabled={!form.amountNGN || !beneficiary || amountNGN > availableNGN || amountNGN <= 0 || overMonthlyAllowance}
                onClick={() => setStep('confirm')}
                sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-3xl p-24 space-y-16" style={card}>
                <div className="rounded-2xl p-16" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                  <Typography style={{ fontSize: F.small, color: tokens.textSecondary, marginBottom: 8 }}>You're withdrawing</Typography>
                  <Typography style={{ fontSize: F.amountLg, fontWeight: 700, color: tokens.accentSolid, marginBottom: 12 }}>
                    ₦{amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Typography>
                  <div className="flex justify-between mb-6">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>To</Typography>
                    <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>{beneficiary?.beneficiaryAccountName}</Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Bank</Typography>
                    <Typography style={{ fontSize: F.small, color: tokens.textPrimary }}>{bankName} · {beneficiary?.beneficiaryAccountNumber}</Typography>
                  </div>
                  <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 10 }}>
                    Paystack + platform fees will be added on top of this amount — you'll see the exact breakdown once confirmed.
                  </Typography>
                </div>

                <TransactionPinField value={pin} onChange={setPin} tokens={tokens} />
                <Button onClick={() => setForgotPinOpen(true)} sx={{ color: tokens.textMuted, textTransform: 'none', fontSize: F.small, width: '100%', mt: -1 }}>
                  Forgot PIN?
                </Button>

                {error && <Alert severity="error" sx={errorAlertSx}>{error}</Alert>}

                <Button
                  variant="contained"
                  fullWidth
                  disabled={pin.length < 6 || initiating}
                  onClick={handleConfirmPin}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
                >
                  {initiating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm Withdrawal'}
                </Button>
                <Button onClick={() => setStep('form')} sx={{ color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>Back</Button>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-3xl p-24" style={card}>
                <div className="rounded-2xl p-16 mb-20" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Recipient gets</Typography>
                    <Typography style={{ fontSize: F.amountLg, fontWeight: 700, color: tokens.accentSolid }}>₦{amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                  </div>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Bank</Typography>
                    <Typography style={{ fontSize: F.body, color: tokens.textPrimary }}>{bankName}</Typography>
                  </div>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Account</Typography>
                    <Typography style={{ fontSize: F.body, color: tokens.textPrimary, fontFamily: 'monospace' }}>{beneficiary?.beneficiaryAccountNumber}</Typography>
                  </div>
                  {typeof btxData?.commissionKobo === 'number' && (
                    <>
                      <div className="flex justify-between mb-6 pt-8" style={{ borderTop: `1px dashed ${tokens.borderColor}` }}>
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Platform fee</Typography>
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>+₦{(btxData.commissionKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                      </div>
                      <div className="flex justify-between mb-8">
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Paystack fee</Typography>
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>+₦{(btxData.paystackFeeKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.textPrimary }}>Total debited</Typography>
                        <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.danger }}>₦{(btxData.totalDebitKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                      </div>
                    </>
                  )}
                </div>

                <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>Enter OTP</Typography>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 16 }}>
                  A 6-digit code was emailed to your registered address
                </Typography>

                {btxData?.expiresAt && <OtpTimer expiresAt={btxData.expiresAt} onExpired={() => setOtpExpired(true)} tokens={tokens} />}

                <div className="flex gap-8 justify-center mb-16">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-40 h-48 rounded-xl flex items-center justify-center font-bold border transition-all"
                      style={{ fontSize: F.body, background: tokens.pageBg, borderColor: i < otp.length ? tokens.accentSolid : tokens.borderColor, color: tokens.textPrimary }}
                    >
                      {otp[i] ? '•' : ''}
                    </div>
                  ))}
                </div>

                <TextField
                  type="password"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  fullWidth
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 24, letterSpacing: 14, color: tokens.textPrimary } }}
                  placeholder="Enter 6-digit OTP"
                  sx={fieldSx(tokens)}
                />

                {btxData?._devOtp && (
                  <Typography style={{ fontSize: F.small, color: tokens.warning, textAlign: 'center', marginTop: 8 }}>DEV OTP: {btxData._devOtp}</Typography>
                )}

                {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}

                {otpExpired
                  ? (
                    <div className="mt-16 text-center">
                      <Typography style={{ fontSize: F.body, color: tokens.danger, marginBottom: 12 }}>OTP expired</Typography>
                      <Button onClick={restart} sx={{ color: tokens.accentSolid, textTransform: 'none', fontWeight: 700, fontSize: F.label }}>Start New Withdrawal</Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={otp.length < 6 || confirming}
                        onClick={handleConfirmOtp}
                        sx={{ mt: 2, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
                      >
                        {confirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm Withdrawal'}
                      </Button>
                      <Button onClick={restart} sx={{ mt: 1, color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>Cancel</Button>
                    </>
                  )
                }
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="rounded-3xl p-32" style={card}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-72 h-72 rounded-full flex items-center justify-center mx-auto mb-20"
                  style={{ background: tokens.successBg }}
                >
                  <FuseSvgIcon size={36} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
                </motion.div>
                <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.textPrimary, marginBottom: 8 }}>Withdrawal Submitted!</Typography>
                <Typography style={{ fontSize: F.body, color: tokens.textSecondary, marginBottom: 24 }}>
                  {result?.message ?? 'Funds will arrive within minutes.'}
                </Typography>
                {result?.transferCode && (
                  <div className="rounded-xl p-12 mb-20" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 4 }}>Transfer Code</Typography>
                    <Typography style={{ fontSize: F.body, fontFamily: 'monospace', color: tokens.textPrimary }}>{result.transferCode}</Typography>
                  </div>
                )}

                {beneficiary?._isNewlyAdded && (
                  <div
                    className="flex items-center gap-8 rounded-xl p-12 mb-20 text-left cursor-pointer"
                    style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}
                    onClick={() => setSaveBeneficiary(v => !v)}
                  >
                    <Checkbox checked={saveBeneficiary} onChange={e => setSaveBeneficiary(e.target.checked)} onClick={e => e.stopPropagation()} />
                    <Typography style={{ fontSize: F.small, color: tokens.textPrimary }}>
                      Save {beneficiary.beneficiaryAccountName} as a beneficiary for faster withdrawals next time
                    </Typography>
                  </div>
                )}

                <Button
                  variant="contained"
                  onClick={handleDone}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, px: 4, py: 1.5, textTransform: 'none', fontSize: F.body }}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ForgotPinDialog open={forgotPinOpen} onClose={() => setForgotPinOpen(false)} tokens={tokens} />
    </div>
  );
}
