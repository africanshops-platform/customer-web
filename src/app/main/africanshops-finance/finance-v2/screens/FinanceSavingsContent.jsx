import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import {
  useSavingsBalance,
  useOpenSavings,
  useFundHighYield,
  useWithdrawHighYield,
  useHighYieldRate,
  formatNaira,
} from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import TransactionPinField from './shared/TransactionPinField';
import SavingsPlans from './shared/SavingsPlans';
import { fieldSx } from '../financeUiTokens';

const F = {
  pageTitle:   'clamp(2.8rem,  4.5vw, 4rem)',
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  balanceLg:   'clamp(2.4rem,  4vw,   3.5rem)',
};

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Retail-3 (2026-07-11, revised): savings keeps GREEN as its dedicated accent
// (growth/savings is a natural fit for the semantic-positive color, same as
// the reference design's own savings-goal progress bars) rather than orange —
// orange stays reserved for brand/primary-CTA contexts elsewhere.
//
// Retail-6 (2026-07-12): repointed from the old, now-ambiguous "Savings"
// concept to the High-Yield vault — opt-in, funded only from the default
// wallet, 3 free withdrawals back per month, daily interest at the
// admin-set APY. See docs on HIGH_YIELD_SAVINGS in the ledger schema.
function FundWithdrawDialog({ open, onClose, mode, accountNumber, maxAmountNaira, withdrawalsRemaining, onDone, tokens }) {
  const { mutate: fund, isLoading: funding, error: fundError } = useFundHighYield();
  const { mutate: withdraw, isLoading: withdrawing, error: withdrawError } = useWithdrawHighYield();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');

  const isFund = mode === 'fund';
  const isLoading = isFund ? funding : withdrawing;
  const error = isFund ? fundError : withdrawError;
  const amountValid = parseFloat(amount) > 0;

  async function handleSubmit() {
    const amountKobo = Math.round(parseFloat(amount) * 100);
    try {
      if (isFund) await fund(accountNumber, amountKobo, pin);
      else await withdraw(accountNumber, amountKobo, pin);
      setAmount('');
      setPin('');
      onDone();
    } catch {
      // error surfaced via the hook's own error state
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px', background: tokens.cardBg, p: 1 } }}>
      <div className="p-20">
        <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>
          {isFund ? 'Add Funds to High-Yield' : 'Withdraw to Default Wallet'}
        </Typography>
        <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 20 }}>
          {isFund
            ? 'Moves money from your default wallet into your High-Yield vault.'
            : `${withdrawalsRemaining} free withdrawal${withdrawalsRemaining === 1 ? '' : 's'} left this month.`}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{error}</Alert>}
        {!isFund && withdrawalsRemaining === 0 && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>
            No free withdrawals left this month — try again next month.
          </Alert>
        )}

        <TextField
          label="Amount (₦)"
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          fullWidth
          disabled={!isFund && withdrawalsRemaining === 0}
          InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
          sx={{ ...fieldSx(tokens), mb: 3 }}
        />

        <TransactionPinField value={pin} onChange={setPin} tokens={tokens} />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={isLoading || !amountValid || pin.length < 4 || (!isFund && withdrawalsRemaining === 0)}
          sx={{
            mt: 3,
            background: isFund ? `linear-gradient(135deg, ${tokens.success} 0%, #047857 100%)` : tokens.accentGradient,
            borderRadius: '12px', fontWeight: 700, py: 1.4, textTransform: 'none', fontSize: F.body,
            '&:disabled': { background: tokens.borderColor, color: tokens.textMuted },
          }}
        >
          {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : isFund ? 'Add Funds' : 'Withdraw'}
        </Button>
      </div>
    </Dialog>
  );
}

export default function FinanceSavingsContent() {
  const { account, refetchFinanceData } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const { data: savings, isLoading, refetch } = useSavingsBalance(account?.accountNumber);
  const { data: rate } = useHighYieldRate();
  const { mutate: openSavings, isLoading: opening, error: openError } = useOpenSavings();
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [dialogMode, setDialogMode] = useState(null); // 'fund' | 'withdraw' | null
  const [calc, setCalc] = useState('100000');

  const noSavings = !isLoading && savings === null;
  const hasSavings = !isLoading && savings != null;
  const balance  = parseFloat(savings?.balance ?? 0);
  const reserved = parseFloat(savings?.reservedBalance ?? 0);
  const withdrawalsThisMonth = savings?.withdrawalsThisMonth ?? 0;
  const withdrawalsRemaining = savings?.withdrawalsRemaining ?? 3;
  const apy = rate?.apyPercent ?? 12;

  async function handleOpen() {
    setError('');
    try {
      await openSavings(account?.accountNumber);
      setSuccess('High-Yield savings opened successfully!');
      refetch();
    } catch (err) { setError(err.message); }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <CircularProgress sx={{ color: tokens.accentSolid }} />
      </div>
    );
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div className="grid gap-20" style={{ minWidth: 0 }}>
        {noSavings && (
          <motion.div variants={item}>
            <div className="rounded-3xl p-32 text-center" style={card}>
              <div className="w-80 h-80 rounded-3xl flex items-center justify-center mx-auto mb-24" style={{ background: tokens.successBg }}>
                <FuseSvgIcon size={40} style={{ color: tokens.success }}>heroicons-outline:cash</FuseSvgIcon>
              </div>
              <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>
                Open High-Yield Savings
              </Typography>
              <Typography style={{ fontSize: F.body, color: tokens.textSecondary, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Set money aside from your default wallet and earn {apy}% APY, credited daily. 3 free withdrawals back per month.
              </Typography>

              <div className="grid grid-cols-3 gap-12 mb-28 max-w-sm mx-auto">
                {[
                  { icon: 'heroicons-outline:trending-up', label: `${apy}% APY` },
                  { icon: 'heroicons-outline:refresh', label: '3 free/mo' },
                  { icon: 'heroicons-outline:lock-closed', label: 'Protected' },
                ].map(f => (
                  <div key={f.label} className="rounded-xl p-12 text-center" style={{ background: tokens.successBg }}>
                    <FuseSvgIcon size={22} style={{ color: tokens.success }} className="mx-auto">{f.icon}</FuseSvgIcon>
                    <Typography style={{ fontSize: F.small, color: tokens.textPrimary, marginTop: 6 }}>{f.label}</Typography>
                  </div>
                ))}
              </div>

              {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success, fontSize: F.small }}>{success}</Alert>}
              {(error || openError) && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small }}>{error || openError}</Alert>}

              <Button variant="contained" onClick={handleOpen} disabled={opening}
                sx={{ background: `linear-gradient(135deg, ${tokens.success} 0%, #047857 100%)`, borderRadius: '12px', fontWeight: 700, py: 1.5, px: 4, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
                {opening ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Open High-Yield Savings'}
              </Button>
            </div>
          </motion.div>
        )}

        {hasSavings && (
          <>
            <motion.div variants={item}>
              <div className="rounded-3xl p-28 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${tokens.success} 0%, #047857 100%)` }}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-12">
                      <div className="w-44 h-44 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.16)' }}>
                        <FuseSvgIcon size={24} className="text-white">heroicons-solid:cash</FuseSvgIcon>
                      </div>
                      <div>
                        <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.7)' }}>High-Yield Balance</Typography>
                        <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)' }}>NGN Vault</Typography>
                      </div>
                    </div>
                    <div className="rounded-full px-14 py-6" style={{ background: 'rgba(255,255,255,0.16)' }}>
                      <Typography style={{ fontSize: F.small, fontWeight: 700, color: 'white' }}>{apy}% APY</Typography>
                    </div>
                  </div>
                  <Typography style={{ fontSize: F.balanceLg, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                    {formatNaira(balance, savings?.currency ?? 'NGN')}
                  </Typography>
                  {reserved > 0 && (
                    <Typography style={{ fontSize: F.body, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>+ {formatNaira(reserved)} reserved</Typography>
                  )}
                  <div className="flex gap-12 mt-16">
                    <button
                      onClick={() => setDialogMode('fund')}
                      className="flex items-center gap-8 rounded-xl px-16 py-10 font-semibold text-white transition-all duration-200 cursor-pointer"
                      style={{ fontSize: F.label, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.24)' }}
                    >
                      <FuseSvgIcon size={18} className="text-white">heroicons-solid:plus</FuseSvgIcon>
                      Add Funds
                    </button>
                    <button
                      onClick={() => setDialogMode('withdraw')}
                      className="flex items-center gap-8 rounded-xl px-16 py-10 font-semibold text-white transition-all duration-200 cursor-pointer"
                      style={{ fontSize: F.label, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.24)' }}
                    >
                      <FuseSvgIcon size={18} className="text-white">heroicons-solid:upload</FuseSvgIcon>
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Withdrawal-count tracker */}
            <motion.div variants={item}>
              <div className="rounded-2xl p-20" style={card}>
                <div className="flex items-center justify-between mb-10">
                  <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.textPrimary }}>Free Withdrawals This Month</Typography>
                  <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary }}>{withdrawalsThisMonth}/3</Typography>
                </div>
                <div className="rounded-full h-8 overflow-hidden" style={{ background: tokens.borderColor }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: withdrawalsRemaining === 0 ? tokens.danger : tokens.success }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(withdrawalsThisMonth / 3) * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 8 }}>
                  Resets on the 1st of next month
                </Typography>
              </div>
            </motion.div>

          </>
        )}

        <motion.div variants={item} style={{ display: 'grid', gap: 20 }}>
          <SavingsPlans accountNumber={account?.accountNumber} onChanged={() => { refetch(); refetchFinanceData?.(); }} />
        </motion.div>
        </div>

        <motion.div variants={item} style={{ display: 'grid', gap: 20, minWidth: 0 }}>
          <div className="rounded-2xl p-20" style={card}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>See what it grows to</h3>
            <div style={{ fontSize: 13, color: tokens.textSecondary, marginBottom: 12 }}>An estimate at today's {apy}% a year. The rate can change, and the estimate ignores compounding.</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>If I keep</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: `2px solid ${tokens.borderColor}`, borderRadius: 16, padding: '8px 14px', background: tokens.cardBg }}>
              <b style={{ fontSize: 22, color: tokens.textMuted }}>₦</b>
              <input value={calc} onChange={e => setCalc(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" aria-label="Amount to keep" style={{ border: 0, outline: 0, fontSize: 26, fontWeight: 800, width: '100%', background: 'none', color: tokens.textPrimary }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 14px' }}>
              {[50000, 100000, 500000].map(q => (
                <button key={q} type="button" onClick={() => setCalc(String(q))} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 99, padding: '5px 12px', fontWeight: 700, fontSize: 12, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}>₦{(q / 1000).toLocaleString('en-NG')}k</button>
              ))}
            </div>
            {[['1 month', 1], ['6 months', 6], ['12 months', 12]].map(([l, m]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${tokens.borderColor}`, fontSize: 14, color: tokens.textSecondary }}>
                <span>After {l} you earn about</span>
                <b style={{ color: tokens.success }}>₦{Math.round((Number(calc || 0) * apy / 100) * (m / 12)).toLocaleString('en-NG')}</b>
              </div>
            ))}
          </div>
              <div className="rounded-2xl p-20" style={{ background: tokens.successBg }}>
                <div className="flex items-center gap-10 mb-14">
                  <FuseSvgIcon size={20} style={{ color: tokens.success }}>heroicons-outline:information-circle</FuseSvgIcon>
                  <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.success }}>How High-Yield Works</Typography>
                </div>
                <ul className="space-y-10">
                  {[
                    `Interest accrues daily at ${apy}% APY, credited automatically`,
                    'Funded only from your default wallet — never a bank transfer source',
                    '3 free withdrawals back to your default wallet per month',
                    'Balance shown is in Naira (not kobo)',
                  ].map(tip => (
                    <li key={tip} className="flex items-start gap-10">
                      <div className="w-5 h-5 rounded-full shrink-0 mt-4" style={{ background: tokens.success }} />
                      <Typography style={{ fontSize: F.body, color: tokens.textSecondary, lineHeight: 1.5 }}>{tip}</Typography>
                    </li>
                  ))}
                </ul>
              </div>
        </motion.div>
      </motion.div>

      <FundWithdrawDialog
        open={dialogMode !== null}
        onClose={() => setDialogMode(null)}
        mode={dialogMode}
        accountNumber={account?.accountNumber}
        maxAmountNaira={balance}
        withdrawalsRemaining={withdrawalsRemaining}
        onDone={() => { setDialogMode(null); refetch(); refetchFinanceData?.(); }}
        tokens={tokens}
      />
    </div>
  );
}
