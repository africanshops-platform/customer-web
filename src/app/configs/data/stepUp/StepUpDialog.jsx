import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { verifyStepUp } from '../client/RepositoryAuthClient';
import { isSixDigits, registerStepUpHandler, stepUpErrorMessage } from './stepUp';
import CodeBoxes from './CodeBoxes';
import { PendingButton, ProcessingState } from 'app/shared-components/loading';

/**
 * F30: asks for the authenticator code when a payment needs it. Mounted once at the app root; the shared API client opens it (through the
 * broker) and repeats the payment with the approval when the code is right. Closing it cancels: nothing is moved.
 */
export default function StepUpDialog() {
	const [pending, setPending] = useState(null); // { challenge, resolve, reject }
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const [attempt, setAttempt] = useState(0); // bumps after a wrong code so the boxes clear and refocus
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
			setCode('');
			setAttempt((n) => n + 1);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Dialog open={!!pending} onClose={close} maxWidth="xs" fullWidth>
			<DialogTitle>Confirm with your authenticator</DialogTitle>
			<DialogContent onKeyDown={(e) => e.key === 'Enter' && submit()}>
				<Typography variant="body2" color="text.secondary" className="mb-16">
					Open your authenticator app and enter the 6-digit code for AfricanShops to approve this payment. You can paste it too.
				</Typography>
				{/* One fixed-height area, so the dialog never jumps: the boxes (and any error) while waiting for a code, the branded spiral while it is checked. */}
				<div style={{ minHeight: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					{busy ? (
						<ProcessingState
							title="Checking your code"
							subtitle=""
						/>
					) : (
						<>
							<CodeBoxes
								key={attempt}
								autoFocus
								value={code}
								onChange={(next) => {
									setCode(next);
									if (error) setError('');
								}}
								error={!!error}
							/>
							{error && (
								<Alert
									severity="error"
									className="mt-12"
								>
									{error}
								</Alert>
							)}
						</>
					)}
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} disabled={busy}>
					Cancel
				</Button>
				<PendingButton variant="contained" onClick={submit} disabled={!isSixDigits(code)} pending={busy} pendingLabel="Checking…">
					Approve
				</PendingButton>
			</DialogActions>
		</Dialog>
	);
}
