import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { useTransferLimits, useFintechKycStatus } from '../../hooks/useFintechApi';
import { describeTx, isCredit, nairaCompact, nairaFull, shortDate } from '../../financeFormat';
import FxRateChip from './FxRateChip';

// Right panel, as in the approved preview: balance card, account with copy and verification badge, limits,
// readable recent activity, exchange rate, help. Presentation only; the same data as before.

const label = (tokens) => ({ margin: '0 0 8px', fontSize: 11, letterSpacing: '0.14em', color: tokens.textMuted, textTransform: 'uppercase', fontWeight: 700 });

function Balance({ balance, loading, tokens }) {
  return (
    <div style={{ background: tokens.heroBg, color: tokens.heroText, borderRadius: 20, padding: 18 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.heroTextMuted }}>Balance</div>
      {loading ? (
        <Skeleton variant="text" width="70%" sx={{ height: 44, bgcolor: 'rgba(255,255,255,0.15)' }} />
      ) : (
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 8px' }}>{nairaFull(balance?.availableBalance)}</div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, borderRadius: 99, padding: '4px 10px', background: 'rgba(255,255,255,0.11)' }}>Pending ₦{nairaCompact(balance?.pendingBalance)}</span>
        <span style={{ fontSize: 12, borderRadius: 99, padding: '4px 10px', background: 'rgba(255,255,255,0.11)' }}>Reserved ₦{nairaCompact(balance?.reservedBalance)}</span>
        {balance?.isFrozen && <span style={{ fontSize: 12, borderRadius: 99, padding: '4px 10px', background: tokens.dangerBg, color: tokens.danger, fontWeight: 700 }}>Frozen</span>}
      </div>
    </div>
  );
}

function Card({ title, tokens, children, style }) {
  return (
    <div style={{ border: `1px solid ${tokens.cardBorder}`, borderRadius: 18, padding: 14, background: tokens.cardBg, ...style }}>
      <div style={label(tokens)}>{title}</div>
      {children}
    </div>
  );
}

function Account({ account, verified, tokens }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!account?.accountNumber) return;
    navigator.clipboard?.writeText(account.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Card title="Account" tokens={tokens}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: 18, letterSpacing: '0.08em', color: tokens.textPrimary }}>{account?.accountNumber ?? '—'}</b>
        <button
          type="button"
          onClick={copy}
          style={{ border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: '6px 12px', fontWeight: 700, fontSize: 12, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 13, color: tokens.textSecondary }}>
        <span>{account?.accountName ?? '—'}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 99,
            padding: '3px 10px',
            background: verified ? tokens.successBg : tokens.warningBg,
            color: verified ? tokens.success : tokens.warning,
          }}
        >
          {verified ? 'Verified' : 'KYC pending'}
        </span>
      </div>
    </Card>
  );
}

function Limits({ account, verified, tokens }) {
  const { data: limits } = useTransferLimits(account?.accountNumber);
  // The monthly allowance comes with the fintech KYC status (null for a verified account), the same source the transfer screens use.
  const { data: kycStatus } = useFintechKycStatus(account?.accountNumber);
  const meter = (pct) => (
    <div style={{ height: 8, borderRadius: 99, background: tokens.borderColor, overflow: 'hidden', margin: '8px 0 6px' }}>
      <div style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: '100%', borderRadius: 99, background: tokens.accentGradient }} />
    </div>
  );
  const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: tokens.textSecondary };

  if (!verified && kycStatus?.monthlyCapKobo != null) {
    const used = Number(kycStatus.monthlyUsedKobo ?? 0);
    const cap = Number(kycStatus.monthlyCapKobo);
    return (
      <Card title="Your limits" tokens={tokens}>
        <div style={row}><span>This month</span><b style={{ color: tokens.textPrimary }}>₦{nairaCompact(used)} / ₦{nairaCompact(cap)}</b></div>
        {meter((used / cap) * 100)}
        <div style={row}><span>Verified accounts get ₦500,000 a day</span></div>
        <NavLink
          to="/africanshops/finance-v2/kyc"
          style={{ display: 'block', textAlign: 'center', marginTop: 10, borderRadius: 10, padding: '8px 12px', fontWeight: 700, fontSize: 12, background: tokens.accentGradient, color: '#fff', textDecoration: 'none' }}
        >
          Verify to raise limits
        </NavLink>
      </Card>
    );
  }

  if (verified && limits?.dailyTransferLimitKobo != null) {
    return (
      <Card title="Your limits" tokens={tokens}>
        <div style={row}><span>Daily limit</span><b style={{ color: tokens.textPrimary }}>₦{nairaCompact(limits.dailyTransferLimitKobo)}</b></div>
        {limits.pendingChange?.newDailyTransferLimitKobo != null && (
          <div style={{ ...row, marginTop: 6 }}><span>Rising to ₦{nairaCompact(limits.pendingChange.newDailyTransferLimitKobo)}{limits.pendingChange.awaitingOtp ? ' (code needed)' : ''}</span></div>
        )}
        <NavLink
          to="/africanshops/finance-v2/settings"
          style={{ display: 'block', textAlign: 'center', marginTop: 10, borderRadius: 10, padding: '8px 12px', fontWeight: 700, fontSize: 12, border: `1px solid ${tokens.cardBorder}`, color: tokens.textPrimary, textDecoration: 'none' }}
        >
          Manage limits
        </NavLink>
      </Card>
    );
  }
  return null;
}

function Recent({ recentTx, tokens }) {
  return (
    <Card title="Recent activity" tokens={tokens}>
      {!recentTx || recentTx.length === 0 ? (
        <div style={{ fontSize: 13, color: tokens.textMuted, padding: '10px 0', textAlign: 'center' }}>No recent transactions</div>
      ) : (
        recentTx.slice(0, 5).map((tx, i) => {
          const credit = isCredit(tx);
          const { title } = describeTx(tx);
          return (
            <div key={tx?.id ?? i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, display: 'grid', placeItems: 'center', flex: 'none', fontSize: 14, background: credit ? tokens.successBg : tokens.dangerBg, color: credit ? tokens.success : tokens.danger }}>
                {credit ? '↓' : '↑'}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: tokens.textPrimary }}>{title}</b>
                <span style={{ color: tokens.textMuted, fontSize: 12 }}>{shortDate(tx?.createdAt)}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', color: credit ? tokens.success : tokens.danger }}>
                {credit ? '+' : '−'}{nairaCompact(tx?.amount ?? tx?.amountKobo)}
              </div>
            </div>
          );
        })
      )}
    </Card>
  );
}

export default function FinanceSidebarRight({ balance, balanceLoading, recentTx, account }) {
  const { tokens } = useFinanceTheme();
  const verified = account?.kycStatus === 'verified';
  return (
    <div
      // flex-1, not h-full: percentage height never resolves against .FusePageSimple-sidebarContent.
      className="flex flex-col flex-1"
      style={{ background: tokens.sidebarBg, borderLeft: `1px solid ${tokens.sidebarBorder}`, padding: 18, gap: 14 }}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Balance balance={balance} loading={balanceLoading} tokens={tokens} />
      </motion.div>
      {account && <Account account={account} verified={verified} tokens={tokens} />}
      <Limits account={account} verified={verified} tokens={tokens} />
      <Recent recentTx={recentTx} tokens={tokens} />
      <FxRateChip tokens={tokens} />
      <div style={{ background: tokens.accentSoft, borderRadius: 18, padding: 14, fontSize: 13, color: tokens.textSecondary }}>
        <b style={{ display: 'block', color: tokens.accentSolid, marginBottom: 2 }}>Need help?</b>
        Contact support for any issue with your account.
      </div>
    </div>
  );
}
