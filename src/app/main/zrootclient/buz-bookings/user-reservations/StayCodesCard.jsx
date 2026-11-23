import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { STAY_CODE_COPY, stayCodeToShow } from './stayCodes';

/**
 * The guest's check-in or check-out code on screen (it used to arrive only by email). Hidden behind a button until the guest asks for it, so it is not
 * shown to anyone looking over their shoulder; renders nothing when there is no code to give (unpaid, or the stay is over).
 */
export default function StayCodesCard({ reservation }) {
	const [shown, setShown] = useState(false);
	const [copied, setCopied] = useState(false);
	const current = stayCodeToShow(reservation);

	if (!current) return null;

	const copy = STAY_CODE_COPY[current.kind];

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(current.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard blocked: the code is on screen anyway.
		}
	};

	return (
		<div className="p-6 border-t border-gray-100" data-testid="stay-code-card">
			<div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
				<Typography variant="subtitle1" className="font-bold text-gray-900">
					{copy.title}
				</Typography>
				<Typography variant="caption" className="text-gray-700 block mb-3">
					{copy.hint}
				</Typography>
				{shown ? (
					<div className="flex items-center gap-3 flex-wrap">
						<span data-testid="stay-code-value" className="font-mono text-2xl font-bold tracking-widest text-gray-900">
							{current.code}
						</span>
						<Button size="small" variant="outlined" onClick={onCopy} sx={{ textTransform: 'none' }}>
							{copied ? 'Copied' : 'Copy'}
						</Button>
						<Button size="small" onClick={() => setShown(false)} sx={{ textTransform: 'none' }}>
							Hide
						</Button>
					</div>
				) : (
					<Button variant="contained" onClick={() => setShown(true)} sx={{ textTransform: 'none' }}>
						Show my {current.kind} code
					</Button>
				)}
			</div>
		</div>
	);
}
