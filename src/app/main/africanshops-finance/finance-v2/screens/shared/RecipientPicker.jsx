import { useMemo, useState } from 'react';
import { useFinanceTheme } from '../../FinanceThemeContext';

const COLORS = ['#7c3aed', '#db2777', '#0f766e', '#0369a1', '#b45309', '#be123c', '#15803d', '#4338ca'];
export const colorFor = (text) => COLORS[[...String(text ?? '')].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];
export const initials = (name) => String(name ?? '?').split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || '?';

function Avatar({ name, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#fff', flex: 'none', background: colorFor(name), fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function Mark({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: '#ffe3c2', borderRadius: 3, color: 'inherit' }}>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Transfer recipient search, as in the approved preview: one box that takes a name, a nickname or an account number,
 * live suggestions from the user's saved beneficiaries, and beneficiary chips. Choosing anything only sets the account
 * number: the transfer screen then verifies it exactly as it always did (resolve, not your own account).
 */
export default function RecipientPicker({ beneficiaries, query, onQuery, onChoose, selectedNumber }) {
  const { tokens } = useFinanceTheme();
  const [open, setOpen] = useState(false);
  const list = useMemo(() => beneficiaries ?? [], [beneficiaries]);
  const q = query.trim();
  const low = q.toLowerCase();
  const matches = useMemo(
    () => (q ? list.filter((b) => b.accountName.toLowerCase().includes(low) || (b.nickname ?? '').toLowerCase().includes(low) || b.accountNumber.includes(q)) : []),
    [list, q, low],
  );
  const isNumber = /^\d{10}$/.test(q);
  const showNew = isNumber && !list.some((b) => b.accountNumber === q);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => { onQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a name or type an account number"
          autoComplete="off"
          aria-label="Send to"
          style={{ width: '100%', border: `2px solid ${tokens.borderColor}`, borderRadius: 14, padding: '14px 16px 14px 44px', fontSize: 16, background: tokens.cardBg, color: tokens.textPrimary, outline: 'none' }}
          onFocusCapture={(e) => { e.target.style.borderColor = tokens.accentSolid; e.target.style.boxShadow = `0 0 0 4px ${tokens.accentSolid}1f`; }}
          onBlurCapture={(e) => { e.target.style.borderColor = tokens.borderColor; e.target.style.boxShadow = 'none'; }}
        />
        {open && q && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 10, background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, borderRadius: 16, boxShadow: '0 12px 32px rgba(20,16,8,.14)', maxHeight: 280, overflow: 'auto', padding: 6 }}>
            {matches.map((b) => (
              <div key={b.id} role="button" tabIndex={0} onMouseDown={() => onChoose(b.accountNumber)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 12, cursor: 'pointer' }}>
                <Avatar name={b.accountName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', color: tokens.textPrimary }}><Mark text={b.accountName} q={q} /></b>
                  <span style={{ color: tokens.textSecondary, fontSize: 13 }}><Mark text={b.accountNumber} q={q} />{b.nickname ? ` · ${b.nickname}` : ''}</span>
                </div>
                {b.groupId && <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: tokens.accentSoft, color: tokens.accentSolid }}>Grouped</span>}
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: tokens.infoBg, color: tokens.info }}>Saved</span>
              </div>
            ))}
            {showNew && (
              <div role="button" tabIndex={0} onMouseDown={() => onChoose(q)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 12, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', background: '#6b7280', fontWeight: 800 }}>?</div>
                <div style={{ flex: 1 }}>
                  <b style={{ display: 'block', color: tokens.textPrimary }}>Account {q}</b>
                  <span style={{ color: tokens.textSecondary, fontSize: 13 }}>Not saved. We confirm the name before you pay.</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: tokens.warningBg, color: tokens.warning }}>New</span>
              </div>
            )}
            {!matches.length && !showNew && (
              <div style={{ textAlign: 'center', padding: 18, fontSize: 13, color: tokens.textMuted }}>No match. Type the full 10-digit account number to send to someone new.</div>
            )}
          </div>
        )}
      </div>

      {list.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 700, letterSpacing: '0.1em', margin: '4px 0' }}>YOUR BENEFICIARIES</div>
          <div style={{ display: 'flex', gap: 12, overflow: 'auto', padding: '4px 2px 10px' }}>
            {list.slice(0, 10).map((b) => {
              const sel = b.accountNumber === selectedNumber;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChoose(b.accountNumber)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 76, fontSize: 12, fontWeight: 600, color: tokens.textSecondary, background: 'none', border: 0, cursor: 'pointer' }}
                >
                  <div style={{ borderRadius: '50%', border: `3px solid ${sel ? tokens.accentSolid : 'transparent'}`, boxShadow: sel ? `0 4px 14px ${tokens.accentSolid}44` : 'none', transition: '0.15s' }}>
                    <Avatar name={b.accountName} size={52} />
                  </div>
                  {b.nickname || b.accountName.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
