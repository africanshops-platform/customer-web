import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { verifyStepUp } from '../client/RepositoryAuthClient';
import { isSixDigits, registerStepUpHandler, stepUpErrorMessage } from './stepUp';

/**
 * F30: asks for the authenticator code when a payment needs it. Mounted once at the app root; the shared API client opens it (through the
 * broker) and repeats the payment with the approval when the code is right. Closing it cancels: nothing is moved.
 */
export default function StepUpDialog() {
	const [pending, setPending] = useState(null); // { challenge, resolve, reject }
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const pendingRef = useRef(null);

	useEffect(
		() =>
			registerStepUpHandler(
				(challenge) =>
					new Promise((resolve, reject) => {
						const next = { challenge, resolve, reject };

						pendingRef.current = next;
						setCode('');
						setError('');
						setPending(next);
					})
			),
		[]
	);

	const close = () => {
		pendingRef.current?.reject(Object.assign(new Error('cancelled'), { cancelled: true }));
		pendingRef.current = null;
		setPending(null);
	};

	const submit = async () => {
		if (!isSixDigits(code) || busy || !pending) return;

		setBusy(true);
		setError('');

		try {
			await verifyStepUp({ challengeId: pending.challenge.challengeId, code: code.trim() });
			pending.resolve(pending.challenge.challengeId);
			pendingRef.current = null;
			setPending(null);
		} catch (err) {
			setError(stepUpErrorMessage(err));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Dialog open={!!pending} onClose={close} maxWidth="xs" fullWidth>
			<DialogTitle>Confirm with your authenticator</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" className="mb-16">
					Open your authenticator app and enter the 6-digit code for AfricanShops to approve this payment.
				</Typography>
				<TextField
					autoFocus
					fullWidth
					label="6-digit code"
					value={code}
					onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
					onKeyDown={(e) => e.key === 'Enter' && submit()}
					inputProps={{ inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: 6 }}
				/>
				{error && (
					<Alert severity="error" className="mt-12">
						{error}
					</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} disabled={busy}>
					Cancel
				</Button>
				<Button variant="contained" onClick={submit} disabled={!isSixDigits(code) || busy}>
					{busy ? 'Checking…' : 'Approve'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
