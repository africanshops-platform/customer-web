import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { keyframes } from '@mui/system';

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

/**
 * Loading state D at its smallest, for a FORM ACTION (saving, updating, posting, deleting a row). A button that shows a small spinner and
 * a plain pending word while the request runs, and cannot be pressed twice. Use it for every submit button instead of a bare Button.
 *
 * @param {boolean} pending True while the request is running (for example a mutation's isLoading).
 * @param {string} pendingLabel What it is doing, for example "Saving". Defaults to the button's own text.
 */
function PendingButton({ pending = false, pendingLabel, disabled, children, startIcon, ...rest }) {
	return (
		<Button
			{...rest}
			disabled={disabled || pending}
			aria-busy={pending || undefined}
			startIcon={
				pending ? (
					<Box
						component="span"
						sx={{
							width: 14,
							height: 14,
							borderRadius: '50%',
							border: '2px solid rgba(255, 107, 53, 0.3)',
							borderTopColor: '#FF6B35',
							animation: `${spin} 0.9s linear infinite`,
							'@media (prefers-reduced-motion: reduce)': { animationDuration: '6s' }
						}}
					/>
				) : (
					startIcon
				)
			}
		>
			{pending && pendingLabel ? pendingLabel : children}
		</Button>
	);
}

export default PendingButton;
