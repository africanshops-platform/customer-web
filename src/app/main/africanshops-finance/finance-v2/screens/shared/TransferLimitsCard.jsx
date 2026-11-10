import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import TransactionPinField from './TransactionPinField';

const naira = (kobo) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

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
 * Transfer limits, one slider for every account (board F23, founder 10 Nov 2026). A verified account picks a daily limit (default ₦500,000)
 * from fixed steps up to ₦5,000,000. An account that is not verified picks from ₦10,000 up to its monthly allowance (₦100,000 in any 30 days,
 * admin-adjustable), shown as monthly with how much is used. Every raise is confirmed with a code emailed to the user and starts 24 hours
 * later; lowering applies at once. If the server returns no steps (an older backend) the older free-text daily cap is shown instead.
 */
export default function TransferLimitsCard({ account, tokens, card }) {
  const { data: fetched, isLoading, refetch } = useTransferLimits(account?.accountNumber);
  // What the save and confirm calls just returned, shown at once instead of waiting for the refetch.
  const [local, setLocal] = useState(null);
  const limits = local ?? fetched;
  const { mutate: setLimits, isLoading: saving, error: apiError } = useSetTransferLimits();
  const { mutate: confirmIncrease, isLoading: confirming, error: confirmError } = useConfirmTransferLimitIncrease();
  const [perTx, setPerTx] = useState('');
  const [daily, setDaily] = useState('');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [success, setSuccess] = useState('');

  const steps = limits?.dailyLimitStepsKobo ?? [];
  const hasSlider = steps.length > 0;
  const verified = !!limits?.verified;
  const allowance = !verified ? limits?.monthlyAllowance ?? null : null;
  // The limit in force: a number the account set or the verified default; an unverified account with none of its own sits at its allowance.
  const inForce = limits?.dailyTransferLimitKobo ?? limits?.defaultDailyLimitKobo ?? null;

  useEffect(() => {
    setLocal(null);
  }, [fetched]);

  useEffect(() => {
    if (!limits) return;
    setPerTx(limits.perTransactionLimitKobo != null ? String(limits.perTransactionLimitKobo / 100) : '');
    setDaily(limits.dailyTransferLimitKobo != null ? String(limits.dailyTransferLimitKobo / 100) : '');
    if (limits.dailyLimitStepsKobo?.length) {
      // Sit on the increase that is waiting (for a code or for its 24 hours), otherwise on today's limit.
      const target = limits.pendingChange?.newDailyTransferLimitKobo ?? limits.dailyTransferLimitKobo ?? limits.defaultDailyLimitKobo;
      const idx = limits.dailyLimitStepsKobo.indexOf(target);
      setStep(idx >= 0 ? idx : 0);
    }
    setAwaitingCode(!!limits.pendingChange?.awaitingOtp);
  }, [limits]);

  async function handleSave() {
    setSuccess('');
    try {
      const body = { perTransactionLimitKobo: perTx === '' ? null : Math.round(parseFloat(perTx) * 100) };
      // Only send the daily limit when the choice differs from what is in force or already waiting.
      if (hasSlider && dailyChanged) body.dailyTransferLimitKobo = steps[step];
      else if (!hasSlider && daily !== '') body.dailyTransferLimitKobo = Math.round(parseFloat(daily) * 100);
      const res = await setLimits(account?.accountNumber, body);
      if (res?.pendingChange !== undefined) setLocal(res);
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
      const confirmed = await confirmIncrease(account?.accountNumber, code.trim());
      if (confirmed?.pendingChange !== undefined) setLocal(confirmed);
      setAwaitingCode(false);
      setCode('');
      setSuccess('Confirmed. Your new limit starts 24 hours from now.');
      refetch();
    } catch {
      // error surfaced via confirmError
    }
  }

  const pending = limits?.pendingChange;
  const pendingTarget = limits?.pendingChange?.newDailyTransferLimitKobo ?? null;
  const dailyChanged = hasSlider && steps[step] !== (pendingTarget ?? inForce);
  const raised = dailyChanged && steps[step] > (inForce ?? 0);
  const allowanceUsedPct = allowance && allowance.usedKobo != null && allowance.capKobo > 0 ? Math.min(100, (allowance.usedKobo / allowance.capKobo) * 100) : 0;
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
            {hasSlider && inForce != null ? `Daily limit now ${naira(inForce)}` : 'Optional caps for your own peace of mind'}
          </Typography>
        </div>
      </div>

      {isLoading ? (
        <CircularProgress size={24} sx={{ color: tokens.accentSolid }} />
      ) : (
        <>
          {pending && !pending.awaitingOtp && pending.effectiveAt && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>
              {pending.newDailyTransferLimitKobo ? `Your daily limit rises to ${naira(pending.newDailyTransferLimitKobo)}` : 'A limit increase'} on {new Date(pending.effectiveAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}.
            </Alert>
          )}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
          {(apiError || confirmError) && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{apiError || confirmError}</Alert>}

          <div className="grid grid-cols-1 gap-16 max-w-lg">
            <LimitField label="Per-transaction limit" value={perTx} onChange={setPerTx} tokens={tokens} />
            {allowance && (
              <div data-testid="monthly-allowance" style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 16, padding: '12px 14px', background: tokens.pageBg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: tokens.textSecondary }}>
                  <span>Monthly allowance (identity not verified)</span>
                  <b style={{ color: tokens.textPrimary }}>{allowance.remainingKobo != null ? `${naira(allowance.remainingKobo)} left` : naira(allowance.capKobo)}</b>
                </div>
                {allowance.usedKobo != null && (
                  <>
                    <div style={{ height: 8, borderRadius: 99, background: tokens.borderColor, overflow: 'hidden', margin: '8px 0 6px' }}>
                      <div style={{ width: `${Math.max(2, allowanceUsedPct)}%`, height: '100%', borderRadius: 99, background: allowanceUsedPct > 80 ? 'linear-gradient(90deg,#f59e0b,#dc2626)' : tokens.accentGradient }} />
                    </div>
                    <div style={{ fontSize: 13, color: tokens.textSecondary }}>{naira(allowance.usedKobo)} of {naira(allowance.capKobo)} used in the last 30 days</div>
                  </>
                )}
                <Link to="/africanshops/finance-v2/kyc" style={{ display: 'inline-block', marginTop: 8, color: tokens.accentSolid, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Verify your identity to lift this limit
                </Link>
              </div>
            )}
            {hasSlider ? (
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
                    marks={steps.map((v, i) => ({ value: i, label: naira(v) }))}
                    onChange={(_, v) => setStep(v)}
                    aria-label="Daily transfer limit"
                    sx={{
                      color: tokens.accentSolid,
                      // Full amounts under the marks; the first and last stay inside the card, and on a narrow screen
                      // only the chosen amount (shown above) is spelled out so the labels never overlap.
                      '& .MuiSlider-markLabel': { fontSize: 11, whiteSpace: 'nowrap' },
                      '& .MuiSlider-markLabel[data-index="0"]': { transform: 'translateX(-20%)' },
                      [`& .MuiSlider-markLabel[data-index="${steps.length - 1}"]`]: { transform: 'translateX(-80%)' },
                      '@media (max-width: 520px)': { '& .MuiSlider-markLabel': { display: 'none' } },
                    }}
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
            {hasSlider && verified && ` The highest daily limit is ${naira(limits.maxDailyLimitKobo)}.`}
            {hasSlider && !verified && ` Until you verify your identity the most you can send, withdraw or put into civic payments is ${naira(limits.maxDailyLimitKobo)} in any 30 days.`}
            {!hasSlider && ' Verify your identity to raise your daily limit.'}
          </Typography>

          {awaitingCode && (
            <div className="max-w-lg" style={{ marginTop: 16 }}>
              <TransactionPinField value={code} onChange={setCode} tokens={tokens} label="Code from your email" masked={false} />
              <div className="flex justify-center">
                <Button
                  variant="contained" disabled={confirming || code.length !== 6} onClick={handleConfirm}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, px: 4, textTransform: 'none', fontSize: F.body }}
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
