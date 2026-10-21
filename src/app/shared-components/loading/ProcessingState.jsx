import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

const spin = keyframes`
	to { transform: rotate(360deg); }
`;
const pulse = keyframes`
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.85; transform: scale(0.95); }
`;

const RINGS = [
	{ size: 130, border: 3, color: '#FF6B35', sides: ['Top', 'Right'], speed: '1.2s', dir: 'normal', opacity: 0.85 },
	{ size: 110, border: 3, color: '#F7931E', sides: ['Top', 'Left'], speed: '1.5s', dir: 'reverse', opacity: 0.65 },
	{ size: 90, border: 2, color: '#FFA726', sides: ['Top', 'Right', 'Bottom'], speed: '1s', dir: 'normal', opacity: 0.45 }
];

/**
 * Loading state A, for PROCESSING: something the person asked for is being done (paying, saving, submitting, verifying, uploading).
 * The branded spiral says "we are working on it". Do not use it to wait for data to appear; use PageSkeleton or SectionSkeleton for that.
 *
 * @param {string} title What is happening, for example "Confirming your payment".
 * @param {string} subtitle Optional second line.
 * @param {boolean} overlay Cover the nearest positioned parent (or the whole screen when the parent is the page) and block clicks while it works.
 */
function ProcessingState({ title = 'Working on it', subtitle = 'Please do not close this page', overlay = false }) {
	const body = (
		<Box
			role="status"
			aria-live="polite"
			sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}
		>
			<Box sx={{ position: 'relative', width: 140, height: 140, display: 'grid', placeItems: 'center' }}>
				{RINGS.map((r) => (
					<Box
						key={r.size}
						sx={{
							position: 'absolute',
							width: r.size,
							height: r.size,
							borderRadius: '50%',
							border: `${r.border}px solid transparent`,
							...Object.fromEntries(r.sides.map((s) => [`border${s}Color`, r.color])),
							opacity: r.opacity,
							animation: `${spin} ${r.speed} linear infinite ${r.dir}`,
							'@media (prefers-reduced-motion: reduce)': { animationDuration: '8s' }
						}}
					/>
				))}
				<Box
					sx={{
						width: 75,
						height: 75,
						borderRadius: '50%',
						bgcolor: '#fff',
						display: 'grid',
						placeItems: 'center',
						boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
						animation: `${pulse} 2s ease-in-out infinite`,
						'@media (prefers-reduced-motion: reduce)': { animation: 'none' }
					}}
				>
					<img src="/assets/images/afslogo/aflogo.png" alt="" style={{ width: 50, height: 50, objectFit: 'contain' }} />
				</Box>
			</Box>
			<Typography sx={{ color: '#FF6B35', fontWeight: 700, textAlign: 'center' }}>{title}</Typography>
			{subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>{subtitle}</Typography>}
		</Box>
	);

	if (!overlay) return body;

	return (
		<Box
			sx={{
				position: 'absolute',
				inset: 0,
				zIndex: 1300,
				display: 'grid',
				placeItems: 'center',
				bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.8)'),
				backdropFilter: 'blur(2px)'
			}}
		>
			{body}
		</Box>
	);
}

export default ProcessingState;
