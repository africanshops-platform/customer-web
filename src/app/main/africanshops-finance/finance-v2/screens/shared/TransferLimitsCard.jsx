import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferLimits, useSetTransferLimits, useConfirmTransferLimitIncrease } from '../../hooks/useFintechApi';
import { F, fieldSx } from '../../financeUiTokens';

const naira = (kobo) => `₦${(kobo / 100).toLocaleString('en-NG')}`;
const shortNaira = (kobo) => (kobo >= 100_000_000 ? `${kobo / 100_000_000}m` : `${kobo / 100_000}k`);

function LimitField({ label, value, onChange, tokens }) {
  return (
    <div>
      <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 6 }}>{label}</Typography>
      <TextField
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        fullWidth
        placeholder="No limit"
        InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
        sx={fieldSx(tokens)}
      />
    </div>
  );
}

/**
 * Transfer limits. A verified account has a daily limit (default ₦500,000) that it picks from fixed steps up to ₦5,000,000;
 * every raise is confirmed with a code emailed to the user and starts 24 hours later, lowering applies at once.
 * An account that is not verified keeps the older free-text daily cap (its real limit is the monthly allowance shown elsewhere).
 */
export default function TransferLimitsCard({ account, tokens, card }) {
  const { data: limits, isLoading, refetch } = useTransferLimits(account?.accountNumber);
  const { mutate: setLimits, isLoading: saving, error: apiError } = useSetTransferLimits();
  const { mutate: confirmIncrease, isLoading: confirming, error: confirmError } = useConfirmTransferLimitIncrease();
  const [perTx, setPerTx] = useState('');
  const [daily, setDaily] = useState('');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [success, setSuccess] = useState('');

  const steps = limits?.dailyLimitStepsKobo ?? [];
  const verified = !!limits?.verified && steps.length > 0;

  useEffect(() => {
    if (!limits) return;
    setPerTx(limits.perTransactionLimitKobo != null ? String(limits.perTransactionLimitKobo / 100) : '');
    setDaily(limits.dailyTransferLimitKobo != null ? String(limits.dailyTransferLimitKobo / 100) : '');
    if (limits.verified && limits.dailyLimitStepsKobo?.length) {
      const idx = limits.dailyLimitStepsKobo.indexOf(limits.dailyTransferLimitKobo);
      setStep(idx >= 0 ? idx : 0);
    }
    setAwaitingCode(!!limits.pendingChange?.awaitingOtp);
  }, [limits]);

  async function handleSave() {
    setSuccess('');
    try {
      const body = { perTransactionLimitKobo: perTx === '' ? null : Math.round(parseFloat(perTx) * 100) };
      if (verified) body.dailyTransferLimitKobo = steps[step];
      else if (daily !== '') body.dailyTransferLimitKobo = Math.round(parseFloat(daily) * 100);
      const res = await setLimits(account?.accountNumber, body);
      if (res?.requiresOtp) {
        setAwaitingCode(true);
        setCode('');
        setSuccess('We emailed you a code. Enter it below to confirm the increase.');
      } else {
        setSuccess('Transfer limits updated. Lowering applies immediately.');
      }
      refetch();
    } catch {
      // error surfaced via apiError
    }
  }

  async function handleConfirm() {
    setSuccess('');
    try {
      await confirmIncrease(account?.accountNumber, code.trim());
      setAwaitingCode(false);
      setCode('');
      setSuccess('Confirmed. Your new limit starts 24 hours from now.');
      refetch();
    } catch {
      // error surfaced via confirmError
    }
  }

  const pending = limits?.pendingChange;
  const raised = verified && steps[step] > (limits?.dailyTransferLimitKobo ?? 0);
  let saveLabel = 'Save Limits';
  if (raised) saveLabel = 'Request increase';

  return (
    <div className="rounded-2xl p-24" style={card}>
      <div className="flex items-center gap-12 mb-20">
        <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.infoBg }}>
          <FuseSvgIcon size={20} style={{ color: tokens.info }}>heroicons-outline:shield-check</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Transfer Limits</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>
            {verified ? `Daily limit now ${naira(limits.dailyTransferLimitKobo)}` : 'Optional caps for your own peace of mind'}
          </Typography>
        </div>
      </div>

      {isLoading ? (
        <CircularProgress size={24} sx={{ color: tokens.accentSolid }} />
      ) : (
        <>
          {pending && !pending.awaitingOtp && pending.effectiveAt && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>
              A limit increase is scheduled for {new Date(pending.effectiveAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}.
            </Alert>
          )}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
          {(apiError || confirmError) && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{apiError || confirmError}</Alert>}

          <div className="grid grid-cols-1 gap-16 max-w-lg">
            <LimitField label="Per-transaction limit" value={perTx} onChange={setPerTx} tokens={tokens} />
            {verified ? (
              <div>
                <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 6 }}>
                  Daily limit: {naira(steps[step])}
                </Typography>
                <div style={{ padding: '0 12px' }}>
                  <Slider
                    value={step}
                    min={0}
                    max={steps.length - 1}
                    step={1}
                    marks={steps.map((v, i) => ({ value: i, label: shortNaira(v) }))}
                    onChange={(_, v) => setStep(v)}
                    aria-label="Daily transfer limit"
                    sx={{ color: tokens.accentSolid }}
                  />
                </div>
              </div>
            ) : (
              <LimitField label="Daily total limit" value={daily} onChange={setDaily} tokens={tokens} />
            )}
          </div>

          <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 14, maxWidth: 480, lineHeight: 1.5 }}>
            Lowering a limit applies immediately. Raising it needs a code we email you, and then takes effect 24 hours later,
            so a compromised PIN can't be used to raise your own limit and drain the account in one session.
            {verified ? ` The highest daily limit is ${naira(limits.maxDailyLimitKobo)}.` : ' Verify your identity to raise your daily limit.'}
          </Typography>

          {awaitingCode && (
            <div className="max-w-lg" style={{ marginTop: 16 }}>
              <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 6 }}>Code from your email</Typography>
              <div className="flex gap-12">
                <TextField
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  sx={fieldSx(tokens)}
                />
                <Button
                  variant="contained" disabled={confirming || code.length !== 6} onClick={handleConfirm}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, px: 3, textTransform: 'none', fontSize: F.body }}
                >
                  {confirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm'}
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="contained" disabled={saving} onClick={handleSave}
            sx={{ mt: 3, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.2, px: 3, textTransform: 'none', fontSize: F.body }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : saveLabel}
          </Button>
        </>
      )}
    </div>
  );
}
