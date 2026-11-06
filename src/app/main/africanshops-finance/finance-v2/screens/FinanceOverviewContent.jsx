import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { describeTx, isCredit, nairaFull, shortDate } from '../financeFormat';
import CashflowChart from './shared/CashflowChart';
import SpendingDonut from './shared/SpendingDonut';

// Overview, as in the approved preview. Presentation only: the same data hooks as before, with plain transaction
// titles, this month's money in and out, and a balance trend computed from the same transactions.

const QUICK_ACTIONS = [
  { label: 'Transfer', icon: 'heroicons-solid:refresh', to: '/africanshops/finance-v2/transfer', tint: 'accentSoft', color: 'accentSolid' },
  { label: 'Receive', icon: 'heroicons-solid:library', to: '/africanshops/finance-v2/receive-money', tint: 'successBg', color: 'success' },
  { label: 'Fund', icon: 'heroicons-solid:credit-card', to: '/africanshops/finance-v2/fund-account', tint: 'infoBg', color: 'info' },
  { label: 'Savings', icon: 'heroicons-solid:cash', to: '/africanshops/finance-v2/savings', tint: 'warningBg', color: 'warning' },
  { label: 'History', icon: 'heroicons-solid:clipboard-list', to: '/africanshops/finance-v2/transactions', tint: 'infoBg', color: 'info' },
  { label: 'Limits', icon: 'heroicons-solid:shield-check', to: '/africanshops/finance-v2/settings', tint: 'dangerBg', color: 'danger' },
];

const container = { show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

/** Daily closing balance for the last 30 days, worked backwards from today's balance using the same transactions. */
function balanceTrend(currentKobo, transactions) {
  const days = 30;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const points = [];
  let running = currentKobo;
  for (let i = 0; i < days; i += 1) {
    const dayEnd = new Date(end.getTime() - i * 86_400_000);
    points.unshift(running);
    const dayStart = new Date(dayEnd.getTime() - 86_400_000 + 1);
    const net = (transactions ?? []).reduce((sum, tx) => {
      const t = tx?.createdAt ? new Date(tx.createdAt).getTime() : 0;
      if (t < dayStart.getTime() || t > dayEnd.getTime()) return sum;
      const amt = Math.abs(parseFloat(tx?.amount ?? tx?.amountKobo ?? 0));
      return sum + (isCredit(tx) ? amt : -amt);
    }, 0);
    running -= net;
  }
  return points;
}

function Sparkline({ points }) {
  const w = 300;
  const h = 90;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, 14 + (1 - (p - min) / span) * 60]);
  const line = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="90" role="img" aria-label="Balance over the last 30 days">
      <defs>
        <linearGradient id="fin-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f97316" stopOpacity=".5" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h}Z`} fill="url(#fin-spark)" />
      <path d={line} fill="none" stroke="#fb923c" strokeWidth="3" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="5" fill="#fff" />
    </svg>
  );
}

function Hero({ balance, isLoading, account, verified, trend, tokens }) {
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!account?.accountNumber) return;
    navigator.clipboard?.writeText(account.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const ghost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 14, fontWeight: 700, background: 'rgba(255,255,255,0.11)', color: '#fff', textDecoration: 'none', fontSize: 14 };
  return (
    <motion.div
      variants={item}
      style={{ background: tokens.heroBg, color: '#fff', borderRadius: 24, padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 18, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(rgba(249,115,22,0.33),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Available balance</div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', margin: '6px 0 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
          {isLoading ? <Skeleton variant="text" width={220} sx={{ bgcolor: 'rgba(255,255,255,0.15)', height: 56 }} /> : <span>{hidden ? '₦ •••••••' : nairaFull(balance?.availableBalance)}</span>}
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', border: 0, cursor: 'pointer' }}
          >
            <FuseSvgIcon size={18} className="text-white">{hidden ? 'heroicons-outline:eye' : 'heroicons-outline:eye-off'}</FuseSvgIcon>
          </button>
        </div>
        {balance?.isFrozen && (
          <div style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '8px 12px', marginBottom: 12, color: '#fca5a5', fontSize: 14 }}>
            Account frozen. {balance.freezeReason ?? 'Contact support.'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/africanshops/finance-v2/transfer" style={{ ...ghost, background: tokens.accentGradient, boxShadow: '0 6px 16px rgba(234,88,12,0.27)' }}>⇄ Transfer</Link>
          <Link to="/africanshops/finance-v2/withdrawal" style={ghost}>⬆ Withdraw</Link>
          <Link to="/africanshops/finance-v2/fund-account" style={ghost}>＋ Fund</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 12px', marginTop: 10, fontSize: 13 }}>
          <span>Account</span>
          <code style={{ fontSize: 15, letterSpacing: '0.08em' }}>{account?.accountNumber ?? '—'}</code>
          <span style={{ borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700, background: verified ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: verified ? '#86efac' : '#fcd34d' }}>
            {verified ? 'Verified' : 'KYC pending'}
          </span>
          <button type="button" onClick={copy} style={{ marginLeft: 'auto', fontSize: 12, background: 'rgba(255,255,255,0.13)', borderRadius: 8, padding: '4px 10px', border: 0, color: '#fff', cursor: 'pointer' }}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      </div>
      <div style={{ alignSelf: 'end', position: 'relative' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Balance, last 30 days</div>
        <Sparkline points={trend} />
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone, note, loading, tokens }) {
  const pill = { up: [tokens.successBg, tokens.success], nt: [tokens.warningBg, tokens.warning] }[note?.kind ?? 'up'];
  return (
    <div style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: tokens.textSecondary, fontSize: 13 }}>{label}</span>
      {loading ? <Skeleton variant="text" width="60%" sx={{ height: 36 }} /> : <b style={{ fontSize: 24, letterSpacing: '-0.01em', color: tone ?? tokens.textPrimary }}>{value}</b>}
      {note && !loading && <em style={{ fontStyle: 'normal', fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '2px 8px', width: 'max-content', background: pill[0], color: pill[1] }}>{note.text}</em>}
    </div>
  );
}

function TxRow({ tx, index, tokens }) {
  const credit = isCredit(tx);
  const { title, sub } = describeTx(tx);
  const amount = Math.abs(parseFloat(tx?.amount ?? tx?.amountKobo ?? 0));
  // The old list showed the status text; keep it, but only call out the ones that are not completed.
  const status = (tx?.status ?? '').toLowerCase();
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: `1px solid ${tokens.borderColor}` }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', flex: 'none', fontSize: 18, background: credit ? tokens.successBg : tokens.dangerBg, color: credit ? tokens.success : tokens.danger }}>
        {credit ? '↓' : '↑'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: tokens.textPrimary }}>{title}</b>
        <span style={{ color: tokens.textMuted, fontSize: 12.5 }}>{[sub, shortDate(tx?.createdAt)].filter(Boolean).join(' · ')}</span>
      </div>
      {status && status !== 'completed' && (
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', borderRadius: 99, padding: '3px 10px', textTransform: 'uppercase', background: status === 'failed' ? tokens.dangerBg : tokens.warningBg, color: status === 'failed' ? tokens.danger : tokens.warning }}>
          {status}
        </span>
      )}
      <div style={{ fontWeight: 800, whiteSpace: 'nowrap', color: credit ? tokens.success : tokens.danger }}>
        {credit ? '+' : '−'}{nairaFull(amount)}
      </div>
    </motion.div>
  );
}

export default function FinanceOverviewContent() {
  const { account, balance, balanceLoading, kycStatus } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const verified = account?.kycStatus === 'verified';
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };

  const { data: txData, isLoading: txLoading } = useTransactionHistory({ accountNumber: account?.accountNumber, limit: 8 });

  // Wider window feeds the charts, the trend and this month's totals; the list only needs the latest 8.
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

  const trend = useMemo(() => balanceTrend(parseFloat(balance?.availableBalance ?? 0), chartTransactions), [balance, chartTransactions]);

  const month = useMemo(() => {
    const now = new Date();
    return chartTransactions.reduce(
      (acc, tx) => {
        const d = tx?.createdAt ? new Date(tx.createdAt) : null;
        if (!d || d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return acc;
        const amt = Math.abs(parseFloat(tx?.amount ?? tx?.amountKobo ?? 0));
        if (isCredit(tx)) return { ...acc, inKobo: acc.inKobo + amt, inCount: acc.inCount + 1 };
        return { ...acc, outKobo: acc.outKobo + amt, outCount: acc.outCount + 1 };
      },
      { inKobo: 0, outKobo: 0, inCount: 0, outCount: 0 },
    );
  }, [chartTransactions]);

  const pendingKobo = parseFloat(balance?.pendingBalance ?? 0);

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      {kycStatus?.kycStatus === 'PENDING_REVIEW' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: tokens.warningBg, border: `1px solid ${tokens.warning}33`, borderRadius: 16, padding: 16, marginBottom: 20, color: tokens.warning }}>
          <b>Identity verification under review.</b>
          <span style={{ flex: 1 }}>Financial operations unlock once our team approves your documents.</span>
          <Link to="/africanshops/finance-v2/kyc" style={{ fontWeight: 700, color: tokens.warning }}>Check status</Link>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 16 }}>
        <Hero balance={balance} isLoading={balanceLoading} account={account} verified={verified} trend={trend} tokens={tokens} />

        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
          <Stat label="Money in, this month" value={nairaFull(month.inKobo)} tone={tokens.success} note={{ kind: 'up', text: `▲ ${month.inCount} payment${month.inCount === 1 ? '' : 's'}` }} loading={chartTxLoading} tokens={tokens} />
          <Stat
            label="Money out, this month"
            value={nairaFull(month.outKobo)}
            note={month.outCount ? { kind: 'up', text: `${month.outCount} payment${month.outCount === 1 ? '' : 's'}` } : { kind: 'nt', text: 'No spending yet' }}
            loading={chartTxLoading}
            tokens={tokens}
          />
          <Stat label="Pending" value={nairaFull(pendingKobo)} note={{ kind: 'up', text: pendingKobo ? 'Settling' : 'All settled' }} loading={balanceLoading} tokens={tokens} />
        </motion.div>

        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
          <div style={card}><CashflowChart transactions={chartTransactions} isLoading={chartTxLoading} /></div>
          <div style={card}><SpendingDonut transactions={chartTransactions} isLoading={chartTxLoading} tokens={tokens} /></div>
        </motion.div>

        <motion.div variants={item}>
          <h3 style={{ margin: '6px 0 12px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Quick actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 12 }}>
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to + a.label} to={a.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, borderRadius: 18, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, boxShadow: tokens.cardShadow, color: tokens.textPrimary }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: tokens[a.tint] }}>
                    <FuseSvgIcon size={22} style={{ color: tokens[a.color] }}>{a.icon}</FuseSvgIcon>
                  </div>
                  {a.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Recent transactions</h3>
            <Link to="/africanshops/finance-v2/transactions" style={{ color: tokens.accentSolid, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>View all</Link>
          </div>
          {txLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px' }}>
              <Skeleton variant="rounded" width={42} height={42} />
              <div style={{ flex: 1 }}><Skeleton variant="text" width="55%" /><Skeleton variant="text" width="35%" /></div>
              <Skeleton variant="text" width={80} />
            </div>
          ))}
          {!txLoading && transactions.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: tokens.textMuted }}>No transactions yet. Fund your wallet to get started.</div>
          )}
          {!txLoading && transactions.map((tx, i) => <TxRow key={tx?.id ?? i} tx={tx} index={i} tokens={tokens} />)}
        </motion.div>
      </motion.div>
    </div>
  );
}
