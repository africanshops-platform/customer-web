import { useRef } from 'react';
import Typography from '@mui/material/Typography';
import { F } from '../../financeUiTokens';

const LENGTH = 6;

/**
 * 6-digit transaction PIN as six single boxes: typing a digit moves to the next box, Backspace steps back, the arrow keys
 * move between boxes and a pasted PIN fills them all. `masked={false}` shows the digits (used for the emailed code). Same props and same value (a string of up to 6 digits) as before,
 * so every screen that uses it keeps working unchanged. Matches the PIN set at WalletSetupWizard account creation.
 */
export default function TransactionPinField({ value = '', onChange, tokens, label = 'Enter transaction PIN', masked = true }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  const focusBox = (i) => {
    const el = refs.current[Math.max(0, Math.min(LENGTH - 1, i))];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const setDigit = (i, d) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join('').slice(0, LENGTH));
  };

  const handleChange = (i, raw) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    if (typed.length > 1) {
      // Several digits at once (autofill, or a paste that reached the input): fill from this box onwards.
      onChange((value.slice(0, i) + typed).slice(0, LENGTH));
      focusBox(Math.min(i + typed.length, LENGTH - 1));
      return;
    }
    setDigit(i, typed);
    if (i < LENGTH - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) {
        setDigit(i, '');
      } else if (i > 0) {
        setDigit(i - 1, '');
        focusBox(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusBox(Math.min(pasted.length, LENGTH - 1));
  };

  return (
    <div>
      <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary, marginBottom: 12, textAlign: 'center' }}>
        {label}
      </Typography>
      <div className="flex gap-10 justify-center mb-16" role="group" aria-label={label}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={2}
            value={d}
            aria-label={`${label}, digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: tokens.textPrimary,
              background: tokens.pageBg,
              border: `2px solid ${d ? tokens.accentSolid : tokens.borderColor}`,
              borderRadius: 12,
              outline: 'none',
              transition: 'border-color 150ms, box-shadow 150ms, transform 150ms',
              transform: d ? 'scale(1.04)' : 'scale(1)',
            }}
            onFocusCapture={(e) => {
              e.target.style.borderColor = tokens.accentSolid;
              e.target.style.boxShadow = `0 0 0 3px ${tokens.accentSolid}33`;
            }}
            onBlurCapture={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = e.target.value ? tokens.accentSolid : tokens.borderColor;
            }}
          />
        ))}
      </div>
    </div>
  );
}
