import { useState } from 'react';
import CodeBoxes from './CodeBoxes';

/**
 * Where a person types the authenticator code on sign-in or when turning the authenticator off: six single-digit boxes (a pasted code fills
 * them all), with a switch to a plain field for an 8-character backup code, which six digit boxes cannot hold. Switching clears what was typed.
 */
export default function CodeEntry({ value, onChange, onSubmit, autoFocus = false, disabled = false }) {
	const [backup, setBackup] = useState(false);

	const toggle = () => {
		onChange('');
		setBackup((b) => !b);
	};

	return (
		<div onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}>
			{backup ? (
				<input
					autoFocus
					type="text"
					value={value}
					disabled={disabled}
					maxLength={8}
					autoComplete="off"
					aria-label="Backup code"
					placeholder="Backup code"
					onChange={(e) => onChange(e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 8).toUpperCase())}
					style={{
						display: 'block',
						margin: '0 auto',
						width: 280,
						height: 52,
						textAlign: 'center',
						fontSize: 22,
						fontWeight: 600,
						letterSpacing: '0.2em',
						borderRadius: 10,
						border: '2px solid rgba(128,128,128,0.45)',
						background: 'transparent',
						color: 'inherit',
						outline: 'none'
					}}
				/>
			) : (
				<CodeBoxes
					value={value}
					onChange={onChange}
					autoFocus={autoFocus}
					disabled={disabled}
				/>
			)}
			<div style={{ textAlign: 'center', marginTop: 12 }}>
				<button
					type="button"
					onClick={toggle}
					style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
				>
					{backup ? 'Use the code from my authenticator app' : 'Lost your phone? Use a backup code'}
				</button>
			</div>
		</div>
	);
}
