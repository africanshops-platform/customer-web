import { useMemo, useState } from 'react';
import { useFinanceTheme } from '../../FinanceThemeContext';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Buckets transactions into the trailing 6 calendar months (oldest first) and sums CREDIT vs DEBIT kobo per month.
// Purely client-side: useTransactionHistory already returns direction, amount and createdAt.
function bucketByMonth(transactions) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], inKobo: 0, outKobo: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const tx of transactions ?? []) {
    const created = tx?.createdAt ? new Date(tx.createdAt) : null;
    if (!created) continue;
    const bucket = byKey.get(`${created.getFullYear()}-${created.getMonth()}`);
    if (!bucket) continue;
    const amount = Math.abs(parseFloat(tx?.amount ?? 0));
    if (tx?.direction === 'CREDIT') bucket.inKobo += amount;
    else bucket.outKobo += amount;
  }
  return buckets;
}

// A round top for the scale (200k, 500k, 1m...) with headroom, so the tallest bar never touches the title.
function niceMax(kobo) {
  const naira = Math.max(1, kobo / 100) * 1.15;
  const pow = 10 ** Math.floor(Math.log10(naira));
  const n = naira / pow;
  const step = [1, 2, 2.5, 5, 10].find((s) => n <= s) ?? 10;
  return step * pow;
}

const compact = (naira) => {
  if (naira >= 1_000_000) return `₦${+(naira / 1_000_000).toFixed(1)}m`;
  if (naira >= 1_000) return `₦${+(naira / 1_000).toFixed(0)}k`;
  return `₦${naira}`;
};

export default function CashflowChart({ transactions, isLoading }) {
  const { tokens } = useFinanceTheme();
  const [hover, setHover] = useState(null);
  const buckets = useMemo(() => bucketByMonth(transactions), [transactions]);
  const top = useMemo(() => niceMax(Math.max(...buckets.map((b) => Math.max(b.inKobo, b.outKobo)), 1)), [buckets]);

  const W = 420;
  const H = 190;
  const x0 = 38;
  const plotTop = 20;
  const plotBottom = 150;
  const plotH = plotBottom - plotTop;
  const groupW = (W - x0 - 10) / 6;
  const y = (naira) => plotBottom - (naira / top) * plotH;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Cashflow, last 6 months</h3>
        <span style={{ fontSize: 12, color: tokens.textMuted }}>
          <i style={{ color: tokens.success, fontStyle: 'normal' }}>●</i> In &nbsp;<i style={{ color: tokens.danger, fontStyle: 'normal' }}>●</i> Out
        </span>
      </div>
      {isLoading ? (
        <div className="animate-pulse" style={{ height: 170, borderRadius: 12, background: tokens.borderColor }} />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" onMouseLeave={() => setHover(null)} role="img" aria-label="Money in and out for the last 6 months">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={x0} x2={W - 6} y1={y(top * f)} y2={y(top * f)} stroke={tokens.borderColor} />
              <text x={2} y={y(top * f) + 4} fontSize="10" fill={tokens.textMuted}>{compact(top * f)}</text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const gx = x0 + i * groupW + groupW / 2 - 15;
            const inH = Math.max(2, plotBottom - y(b.inKobo / 100));
            const outH = Math.max(2, plotBottom - y(b.outKobo / 100));
            const active = hover === i;
            return (
              <g key={b.key} onMouseEnter={() => setHover(i)} opacity={hover === null || active ? 1 : 0.6}>
                <rect x={gx - 6} y={plotTop} width={groupW - 4} height={plotH + 24} fill="transparent" />
                <rect x={gx} y={plotBottom - inH} width="14" height={inH} rx="4" fill={tokens.success} />
                <rect x={gx + 18} y={plotBottom - outH} width="14" height={outH} rx="4" fill={tokens.danger} />
                <text x={gx + 16} y={172} fontSize="11" textAnchor="middle" fill={active ? tokens.textPrimary : tokens.textSecondary} fontWeight={active ? 700 : 400}>{b.label}</text>
              </g>
            );
          })}
          {hover !== null && (buckets[hover].inKobo > 0 || buckets[hover].outKobo > 0) && (
            <g>
              <rect x={Math.min(W - 128, Math.max(x0, x0 + hover * groupW - 20))} y={2} width="124" height="30" rx="8" fill={tokens.heroBg.includes('gradient') ? '#1a140e' : tokens.heroBg} />
              <text x={Math.min(W - 128, Math.max(x0, x0 + hover * groupW - 20)) + 62} y={21} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
                +{compact(buckets[hover].inKobo / 100)} / −{compact(buckets[hover].outKobo / 100)}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
