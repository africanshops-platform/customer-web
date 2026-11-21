import { useEffect, useRef } from 'react';
import { CODE_LENGTH, fillDigits } from './stepUp';

/**
 * The authenticator code as six single-digit boxes. Typing a digit moves to the next box, Backspace steps back, the arrow keys move between
 * boxes, and a pasted code (or an autofilled one) fills all six at once. The value is a string of up to six digits.
 */
export default function CodeBoxes({ value = '', onChange, onComplete, autoFocus = false, disabled = false, label = '6-digit code', error = false }) {
	const refs = useRef([]);
	const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

	const focusBox = (i) => {
		const el = refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))];

		if (el) {
			el.focus();
			el.select();
		}
	};

	useEffect(() => {
		if (autoFocus) focusBox(0);
	}, [autoFocus]);

	const change = (next, focusAt) => {
		onChange(next);
		if (focusAt !== undefined) focusBox(focusAt);
		if (next.length === CODE_LENGTH && onComplete) onComplete(next);
	};

	const handleChange = (i, raw) => {
		const typed = String(raw).replace(/\D/g, '');

		if (!typed) return;

		const next = fillDigits(value, i, typed.length > 1 ? typed : typed.slice(-1));

		change(next, Math.min(i + Math.max(typed.length, 1), CODE_LENGTH - 1));
	};

	const handleKeyDown = (i, e) => {
		if (e.key === 'Backspace') {
			e.preventDefault();

			if (digits[i]) change(value.slice(0, i) + value.slice(i + 1));
			else if (i > 0) change(value.slice(0, i - 1) + value.slice(i), i - 1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			focusBox(i - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			focusBox(i + 1);
		}
	};

	const handlePaste = (e) => {
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);

		if (!pasted) return;

		e.preventDefault();
		change(pasted, Math.min(pasted.length, CODE_LENGTH - 1));
	};

	return (
		<div
			role="group"
			aria-label={label}
			style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
		>
			{digits.map((d, i) => (
				<input
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					maxLength={CODE_LENGTH}
					value={d}
					disabled={disabled}
					aria-label={`${label}, digit ${i + 1}`}
					aria-invalid={error || undefined}
					onChange={(e) => handleChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					onPaste={handlePaste}
					onFocus={(e) => e.target.select()}
					style={{
						width: 44,
						height: 52,
						textAlign: 'center',
						fontSize: 22,
						fontWeight: 600,
						borderRadius: 10,
						border: `2px solid ${error ? '#d32f2f' : d ? '#ea580c' : 'rgba(128,128,128,0.45)'}`,
						background: 'transparent',
						color: 'inherit',
						outline: 'none'
					}}
				/>
			))}
		</div>
	);
}
