import { useLayoutEffect, useRef, useState } from 'react';
import { useFinanceTheme } from '../../FinanceThemeContext';

/**
 * The platform tab switch (docs/design-system/tab-switch.md): a pill with a white knob that slides to the chosen side,
 * 800-weight labels, optional real count badges. `options` is [{ key, label, count? }].
 */
export default function PillSwitch({ options, value, onChange }) {
  const { mode } = useFinanceTheme();
  const dark = mode === 'dark';
  const refs = useRef({});
  const [knob, setKnob] = useState({ left: 3, width: 0 });

  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setKnob({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length, options.map((o) => o.count).join(',')]); // eslint-disable-line

  return (
    <div role="tablist" style={{ position: 'relative', display: 'inline-flex', background: dark ? '#2c2724' : '#ece6df', borderRadius: 99, padding: 3 }}>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: knob.left,
          width: knob.width,
          borderRadius: 99,
          background: dark ? '#211d1a' : '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
          transition: 'left .28s cubic-bezier(.3,.8,.3,1), width .28s cubic-bezier(.3,.8,.3,1)',
        }}
      />
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            ref={(el) => { refs.current[o.key] = el; }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            style={{ position: 'relative', zIndex: 1, minHeight: 40, padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 99, border: 0, background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, color: active ? '#c2410c' : '#78716c' }}
          >
            {o.label}
            {o.count != null && (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', borderRadius: 99, padding: '1px 8px', background: active ? '#ea580c' : '#d6cdc4' }}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
