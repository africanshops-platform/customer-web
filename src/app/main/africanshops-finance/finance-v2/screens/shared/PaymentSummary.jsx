import { useState } from 'react';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { nairaFull } from '../../financeFormat';

/**
 * The one Payment summary block (board F18): the same rows on every payment screen, drawn from the server's quote so a new fee policy
 * appears without an app release. A charge row has a small "What is this?" showing the policy's own sentence. When no charge applies an
 * explicit "Processing charge: Free" row is shown, never a blank. `lines` are the server's lines in order (amount first, then charges).
 */
export default function PaymentSummary({ lines, totalLabel, totalKobo, amountLabel = 'Wallet receives', testId = 'payment-summary' }) {
  const { tokens } = useFinanceTheme();
  const [open, setOpen] = useState(null);
  const hasChargeRow = lines.some((l) => l.kind !== 'AMOUNT');
  const rows = hasChargeRow
    ? lines
    : [...lines, { code: 'NO_CHARGE', label: 'Processing charge', kind: 'FREE', amountKobo: 0, explain: 'No processing charge on this payment.' }];

  return (
    <div data-testid={testId} style={{ borderRadius: 16, background: tokens.accentSoft, padding: 14, display: 'grid', gap: 10 }}>
      {rows.map((l) => {
        const isAmount = l.kind === 'AMOUNT';
        const free = l.kind === 'FREE';
        return (
          <div key={l.code}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 14, color: tokens.textSecondary }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isAmount ? amountLabel : l.label}
                {!isAmount && !!l.explain && (
                  <button
                    type="button"
                    data-testid={`explain-${l.code}`}
                    aria-expanded={open === l.code}
                    aria-label={`What is ${l.label}?`}
                    onClick={() => setOpen(open === l.code ? null : l.code)}
                    style={{ border: 0, background: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: tokens.accentSolid, cursor: 'pointer' }}
                  >
                    What is this?
                  </button>
                )}
              </span>
              <b style={{ color: free ? tokens.success : tokens.textPrimary }}>{free ? 'Free' : nairaFull(l.amountKobo)}</b>
            </div>
            {open === l.code && !!l.explain && (
              <div data-testid={`explain-text-${l.code}`} style={{ fontSize: 12.5, color: tokens.textMuted, marginTop: 4, lineHeight: 1.45 }}>{l.explain}</div>
            )}
          </div>
        );
      })}
      <div style={{ height: 1, background: tokens.borderColor }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: 15, color: tokens.textPrimary }}>{totalLabel}</b>
        <b data-testid={`${testId}-total`} style={{ fontSize: 19, color: tokens.accentSolid }}>{nairaFull(totalKobo)}</b>
      </div>
    </div>
  );
}
