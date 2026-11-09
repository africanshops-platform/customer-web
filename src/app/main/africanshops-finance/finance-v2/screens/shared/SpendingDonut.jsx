import { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { F } from '../../financeUiTokens';

const CATEGORY_LABELS = {
  TRANSFER_OUT: 'Transfers',
  WITHDRAWAL:   'Withdrawals',
  DEBIT:        'Payments',
  FEE:          'Fees',
  PLATFORM_EARNING: 'Platform',
};

// Only DEBIT-direction spend counts toward "where money went" — CREDIT/DEPOSIT/
// REFUND/TRANSFER_IN are inflows, not spend categories.
function bucketByCategory(transactions) {
  const totals = new Map();
  for (const tx of transactions ?? []) {
    if (tx?.direction !== 'DEBIT') continue;
    const label = CATEGORY_LABELS[tx?.transactionType] ?? 'Other';
    totals.set(label, (totals.get(label) ?? 0) + Math.abs(parseFloat(tx?.amount ?? 0)));
  }
  return Array.from(totals.entries())
    .map(([label, kobo]) => ({ label, kobo }))
    .sort((a, b) => b.kobo - a.kobo);
}

export default function SpendingDonut({ transactions, isLoading, tokens: tokensProp }) {
  const { tokens: themeTokens } = useFinanceTheme();
  const tokens = tokensProp ?? themeTokens;
  const [hoverIdx, setHoverIdx] = useState(null);
  const slices = useMemo(() => bucketByCategory(transactions), [transactions]);
  const total = useMemo(() => slices.reduce((sum, s) => sum + s.kobo, 0), [slices]);

  const palette = [tokens.accentSolid, tokens.info, tokens.tertiary, tokens.danger, tokens.success, tokens.warning];

  // Founder 6 Nov: the donut should be about three times larger. It fills the card width (up to 300px) with the legend below.
  const size = 300;
  const stroke = 44;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  let offsetAcc = 0;
  const arcs = slices.map((s, i) => {
    const frac = total > 0 ? s.kobo / total : 0;
    const dash = frac * circumference;
    const arc = { ...s, color: palette[i % palette.length], dash, offset: offsetAcc, frac };
    offsetAcc += dash;
    return arc;
  });

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Where it went</h3>

      {isLoading ? (
        <div className="flex items-center gap-20">
          <div className="rounded-full animate-pulse" style={{ width: size, height: size, background: tokens.borderColor }} />
        </div>
      ) : total === 0 ? (
        <Typography style={{ fontSize: F.body, color: tokens.textMuted, textAlign: 'center', padding: '20px 0' }}>
          No spending yet this period
        </Typography>
      ) : (
        <div className="flex flex-col items-center gap-20">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tokens.borderColor} strokeWidth={stroke} />
              {arcs.map((a, i) => (
                <motion.circle
                  key={a.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${a.dash} ${circumference - a.dash}`}
                  strokeDashoffset={-a.offset}
                  strokeLinecap="butt"
                  opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.35}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${a.dash} ${circumference - a.dash}` }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Typography style={{ fontSize: F.body, color: tokens.textMuted }}>Total</Typography>
              <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.textPrimary }}>
                ₦{(total / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
              </Typography>
            </div>
          </div>

          <div className="flex flex-col gap-10 w-full" style={{ maxWidth: 320 }}>
            {arcs.map((a, i) => (
              <div
                key={a.label}
                className="flex items-center justify-between gap-10 cursor-default"
                style={{ opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5 }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <span className="flex items-center gap-8 min-w-0">
                  <span className="w-10 h-10 rounded-full shrink-0" style={{ background: a.color }} />
                  <Typography className="truncate" style={{ fontSize: F.small, color: tokens.textSecondary }}>{a.label}</Typography>
                </span>
                <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.textPrimary, whiteSpace: 'nowrap' }}>
                  {Math.round(a.frac * 100)}%
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
