// Presentation pieces shared by the Send to Bank and Withdraw screens (the approved full-width layout). No logic of
// their own: the screens pass in values and handlers.

export function BankStepper({ step, tokens, keys = ['form', 'confirm', 'otp', 'success'], labels = ['Details', 'Confirm', 'Code', 'Done'] }) {
  const at = keys.indexOf(step);
  const dotBg = (done, on) => {
    if (done) return tokens.success;
    return on ? tokens.accentGradient : tokens.borderColor;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 20px' }}>
      {labels.map((l, i) => {
        const done = i < at;
        const on = i === at;
        return (
          <div key={l} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 14, color: done || on ? tokens.textPrimary : tokens.textMuted }}>
              <i style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', fontStyle: 'normal', background: dotBg(done, on), color: done || on ? '#fff' : tokens.textSecondary, boxShadow: on ? `0 4px 12px ${tokens.accentSolid}44` : 'none' }}>
                {done ? '✓' : i + 1}
              </i>
              {l}
            </div>
            {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: done ? tokens.success : tokens.borderColor, margin: '0 12px' }} />}
          </div>
        );
      })}
    </div>
  );
}

/** The large amount field with quick amounts and its helper line (the screen decides the text and whether it is an error). */
export function AmountField({ value, onChange, tokens, helper, isError, quick = [5000, 10000, 50000, 100000] }) {
  const shown = value ? Number(value.split('.')[0] || 0).toLocaleString('en-NG') + (value.includes('.') ? `.${value.split('.')[1]}` : '') : '';
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Amount</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: `2px solid ${isError ? tokens.danger : tokens.borderColor}`, borderRadius: 18, padding: '12px 18px', background: tokens.cardBg }}>
        <b style={{ fontSize: 28, color: tokens.textMuted }}>₦</b>
        <input
          value={shown}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          inputMode="decimal"
          placeholder="0"
          aria-label="Amount in naira"
          style={{ border: 0, outline: 0, fontSize: 38, fontWeight: 800, width: '100%', background: 'none', letterSpacing: '-0.02em', color: tokens.textPrimary }}
        />
      </div>
      <div style={{ fontSize: 13, marginTop: 6, color: isError ? tokens.danger : tokens.textMuted }}>{helper}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        {quick.map((q) => (
          <button key={q} type="button" onClick={() => onChange(String(q))} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 99, padding: '6px 14px', fontWeight: 700, fontSize: 13, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}>
            ₦{q.toLocaleString('en-NG')}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Right column: a live summary and a "good to know" card. `rows` is [[label, value]]; `facts` is [[icon, title, text]]. */
export function SideColumn({ rows, facts, emptyText, tokens, card }) {
  return (
    <div style={{ display: 'grid', gap: 16, position: 'sticky', top: 16 }}>
      <div style={{ ...card, borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Summary</h3>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 18, fontSize: 13, color: tokens.textMuted }}>{emptyText}</div>
        ) : (
          rows.map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: `1px dashed ${tokens.borderColor}`, fontSize: 14, color: tokens.textSecondary }}>
              <span>{l}</span>
              <b style={{ color: tokens.textPrimary, textAlign: 'right' }}>{v}</b>
            </div>
          ))
        )}
      </div>
      <div style={{ ...card, borderRadius: 20, padding: 20, background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33`, boxShadow: 'none' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Good to know</h3>
        {facts.map(([icon, title, text]) => (
          <div key={title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: tokens.cardBg, display: 'grid', placeItems: 'center', fontSize: 14, flex: 'none' }}>{icon}</div>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}><b style={{ display: 'block', color: tokens.textPrimary }}>{title}</b>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
