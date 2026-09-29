import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { formatKobo, useTransactionHistory } from '../hooks/useFintechApi';
import { useMemo, useState } from 'react';
import { useFinanceTheme } from '../FinanceThemeContext';
import CashflowChart from './shared/CashflowChart';
import SpendingDonut from './shared/SpendingDonut';

const F = {
  pageTitle:   'clamp(2.8rem,  4.5vw, 4rem)',
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  balanceLg:   'clamp(2.8rem,  5vw,   4.2rem)',
  statValue:   'clamp(1.5rem,  2.4vw, 2rem)',
};

// Retail-3 (2026-07-11, revised): quick-action tiles use soft semantic tints
// (success/info/tertiary/accent) on flat white cards, not raw hex-with-alpha —
// keeps every color sourced from the theme instead of hardcoded per-tile.
const QUICK_ACTIONS = [
  { label: 'Transfer',  icon: 'heroicons-solid:refresh',              to: '/africanshops/finance-v2/transfer' },
  { label: 'Withdraw',  icon: 'heroicons-solid:upload',           to: '/africanshops/finance-v2/withdrawal' },
  { label: 'Savings',   icon: 'heroicons-solid:cash',               to: '/africanshops/finance-v2/savings' },
  { label: 'Wallets',   icon: 'heroicons-solid:briefcase',                  to: '/africanshops/finance-v2/wallets' },
  { label: 'History',   icon: 'heroicons-solid:clipboard-list', to: '/africanshops/finance-v2/transactions' },
  { label: 'Cards',     icon: 'heroicons-solid:credit-card',             to: '/africanshops/finance-v2/cards' },
];

const container = { show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

// Solid near-black (light) / vivid orange (dark) hero — mirrors the reference
// design's black balance card, with orange doing the accent work its green did.
function BalanceCard({ balance, isLoading, tokens }) {
  const [hidden, setHidden] = useState(true);
  const avail   = parseFloat(balance?.availableBalance ?? 0) / 100;
  const pending = parseFloat(balance?.pendingBalance   ?? 0) / 100;

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl p-24 md:p-32"
      style={{ background: tokens.heroBg }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-16">
          <div>
            <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: tokens.heroTextMuted }}>
              Available Balance
            </Typography>
            <div className="flex items-end gap-10 mt-6">
              {isLoading ? (
                <Skeleton variant="text" width={200} sx={{ bgcolor: 'rgba(255,255,255,0.15)', height: 56 }} />
              ) : (
                <Typography style={{ fontSize: F.balanceLg, fontWeight: 800, color: tokens.heroText, lineHeight: 1 }}>
                  {hidden ? '₦ •••••••' : `₦${avail.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                </Typography>
              )}
            </div>
            {!hidden && !isLoading && (
              <Typography style={{ fontSize: F.body, color: tokens.heroTextMuted, marginTop: 6 }}>
                + ₦{pending.toLocaleString('en-NG', { minimumFractionDigits: 2 })} pending
              </Typography>
            )}
          </div>
          <button
            onClick={() => setHidden(h => !h)}
            className="rounded-full p-10 transition-all duration-200 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <FuseSvgIcon size={20} className="text-white">
              {hidden ? 'heroicons-outline:eye' : 'heroicons-outline:eye-off'}
            </FuseSvgIcon>
          </button>
        </div>

        {balance?.isFrozen && (
          <div className="flex items-center gap-8 rounded-xl px-12 py-8 mb-16" style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <FuseSvgIcon size={18} className="text-red-300">heroicons-solid:lock-closed</FuseSvgIcon>
            <Typography style={{ fontSize: F.body, fontWeight: 500, color: '#fca5a5' }}>
              Account Frozen — {balance.freezeReason ?? 'Contact support'}
            </Typography>
          </div>
        )}

        <div className="flex gap-12 mt-8">
          <Link to="/africanshops/finance-v2/transfer" style={{ textDecoration: 'none' }}>
            <button className="flex items-center gap-8 rounded-xl px-16 py-10 font-semibold text-white transition-all duration-200 cursor-pointer" style={{ fontSize: F.label, background: tokens.accentGradient }}>
              <FuseSvgIcon size={18} className="text-white">heroicons-solid:refresh</FuseSvgIcon>
              Transfer
            </button>
          </Link>
          <Link to="/africanshops/finance-v2/withdrawal" style={{ textDecoration: 'none' }}>
            <button className="flex items-center gap-8 rounded-xl px-16 py-10 font-semibold transition-all duration-200 cursor-pointer" style={{ fontSize: F.label, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: tokens.heroText }}>
              <FuseSvgIcon size={18} style={{ color: tokens.heroText }}>heroicons-solid:upload</FuseSvgIcon>
              Withdraw
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function TxItem({ tx, index, tokens }) {
  const isCredit = tx?.direction === 'CREDIT' || tx?.type === 'CREDIT';
  const dotColor = isCredit ? tokens.success : tokens.danger;
  const dotBg = isCredit ? tokens.successBg : tokens.dangerBg;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-14 py-14 border-b last:border-b-0"
      style={{ borderColor: tokens.borderColor }}
    >
      <div
        className="w-44 h-44 rounded-full flex items-center justify-center shrink-0"
        style={{ background: dotBg }}
      >
        <FuseSvgIcon size={20} style={{ color: dotColor }}>
          {isCredit ? 'heroicons-solid:arrow-down' : 'heroicons-solid:arrow-up'}
        </FuseSvgIcon>
      </div>
      <div className="flex-1 min-w-0">
        <Typography className="truncate" style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary }}>
          {tx?.narration ?? tx?.description ?? 'Transaction'}
        </Typography>
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>
          {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          {tx?.status && <span style={{ marginLeft: 8 }}>{tx.status.toLowerCase()}</span>}
        </Typography>
      </div>
      <Typography style={{ fontSize: F.body, fontWeight: 700, whiteSpace: 'nowrap', color: dotColor }}>
        {isCredit ? '+' : '-'}{formatKobo(tx?.amount ?? tx?.amountKobo)}
      </Typography>
    </motion.div>
  );
}

export default function FinanceOverviewContent() {
  const { account, balance, balanceLoading, kycStatus } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = {
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    boxShadow: tokens.cardShadow,
  };
  const { data: txData, isLoading: txLoading } = useTransactionHistory({
    accountNumber: account?.accountNumber,
    limit: 8,
  });

  // Wider window feeds the cashflow/spending charts — recent-transactions list
  // above only needs the last 8, charts need trailing-6-months coverage.
  const { chartStartDate, chartEndDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    return { chartStartDate: start.toISOString(), chartEndDate: end.toISOString() };
  }, []);
  const { data: chartTxData, isLoading: chartTxLoading } = useTransactionHistory({
    accountNumber: account?.accountNumber,
    limit: 200,
    startDate: chartStartDate,
    endDate: chartEndDate,
  });

  const transactions = useMemo(() => txData?.transactions ?? txData ?? [], [txData]);
  const chartTransactions = useMemo(() => chartTxData?.transactions ?? chartTxData ?? [], [chartTxData]);
  const totalKobo    = parseFloat(balance?.availableBalance ?? 0);
  const pendingKobo  = parseFloat(balance?.pendingBalance   ?? 0);
  const reservedKobo = parseFloat(balance?.reservedBalance  ?? 0);

  const quickActionAccents = [tokens.accentSolid, tokens.info, tokens.success, tokens.info, tokens.tertiary, tokens.accentSolid];

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      {/* KYC pending banner */}
      {kycStatus?.kycStatus === 'PENDING_REVIEW' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-12 rounded-2xl p-16 mb-20"
          style={{ background: tokens.warningBg, border: `1px solid ${tokens.warning}33` }}
        >
          <div className="w-10 h-10 rounded-full animate-pulse shrink-0" style={{ background: tokens.warning }} />
          <Typography style={{ fontSize: F.body, color: tokens.warning, flex: 1 }}>
            <span style={{ fontWeight: 700 }}>Identity verification under review.</span>{' '}
            Financial operations will be unlocked once our team approves your documents.
          </Typography>
          <Link to="/account/kyc" style={{ textDecoration: 'none' }}>
            <Button size="small" sx={{ color: tokens.warning, textTransform: 'none', fontWeight: 700, fontSize: F.small }}>Check Status</Button>
          </Link>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20">
        {/* Balance card */}
        <BalanceCard balance={balance} isLoading={balanceLoading} tokens={tokens} />

        {/* Stats row — flat white cards */}
        <motion.div variants={item} className="grid grid-cols-3 gap-12">
          {[
            { label: 'Available', value: formatKobo(totalKobo),    color: tokens.success },
            { label: 'Pending',   value: formatKobo(pendingKobo),  color: tokens.warning },
            { label: 'Reserved',  value: formatKobo(reservedKobo), color: tokens.info },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-16 text-center" style={card}>
              <Typography className="font-semibold uppercase tracking-wider" style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 6 }}>
                {s.label}
              </Typography>
              {balanceLoading
                ? <Skeleton variant="text" sx={{ mx: 'auto', width: '70%' }} />
                : <Typography style={{ fontSize: F.statValue, fontWeight: 700, color: s.color }}>{s.value}</Typography>
              }
            </div>
          ))}
        </motion.div>

        {/* Cashflow + Spending charts */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="rounded-2xl p-20" style={card}>
            <CashflowChart transactions={chartTransactions} isLoading={chartTxLoading} />
          </div>
          <div className="rounded-2xl p-20" style={card}>
            <SpendingDonut transactions={chartTransactions} isLoading={chartTxLoading} tokens={tokens} />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Typography className="uppercase tracking-widest font-semibold mb-14" style={{ fontSize: F.small, color: tokens.textMuted }}>
            Quick Actions
          </Typography>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-10">
            {QUICK_ACTIONS.map((action, i) => (
              <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-10 rounded-2xl p-14 cursor-pointer transition-all duration-200"
                  style={card}
                >
                  <div
                    className="w-44 h-44 rounded-xl flex items-center justify-center"
                    style={{ background: `${quickActionAccents[i]}1a` }}
                  >
                    <FuseSvgIcon size={22} style={{ color: quickActionAccents[i] }}>{action.icon}</FuseSvgIcon>
                  </div>
                  <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, textAlign: 'center' }}>
                    {action.label}
                  </Typography>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-14">
            <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: tokens.textMuted }}>
              Recent Transactions
            </Typography>
            <Link to="/africanshops/finance-v2/transactions" style={{ textDecoration: 'none' }}>
              <Button size="small" sx={{ color: tokens.accentSolid, textTransform: 'none', fontWeight: 600, fontSize: F.small }}>
                View All
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl px-20 py-4" style={card}>
            {txLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-14 py-14 border-b" style={{ borderColor: tokens.borderColor }}>
                    <Skeleton variant="circular" width={44} height={44} sx={{ shrink: 0 }} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="55%" />
                      <Skeleton variant="text" width="35%" />
                    </div>
                    <Skeleton variant="text" width={70} />
                  </div>
                ))
              : transactions.length === 0
                ? <Typography style={{ fontSize: F.body, color: tokens.textMuted, padding: '24px 0', textAlign: 'center' }}>No transactions yet</Typography>
                : transactions.map((tx, i) => <TxItem key={tx?.id ?? i} tx={tx} index={i} tokens={tokens} />)
            }
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
