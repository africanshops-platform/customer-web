import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ProcessingState from './ProcessingState';
import SectionSkeleton from './SectionSkeleton';

const tint = (o) => ({ bgcolor: `rgba(234, 88, 12, ${o})`, borderRadius: 1 });

/**
 * Loading state B, for a WHOLE PAGE on first load (a route opening): the page's frame as a faded skeleton, with a centrepiece on top.
 *
 * centerpiece="spiral" (default, the one to use most): the branded spiral, the same one ProcessingState uses.
 * centerpiece="box": the small boxed "Loading..." badge with a ring. Use it for profile and settings pages.
 *
 * @param {string} title What is loading, for example "Loading your dashboard".
 * @param {string} subtitle Optional second line.
 * @param {'spiral'|'box'} centerpiece
 * @param {'list'|'table'|'cards'|'form'} body The shape of the main area behind the centrepiece.
 */
function PageSkeleton({ title = 'Loading', subtitle, centerpiece = 'spiral', body = 'list' }) {
	return (
		<Box
			role="status"
			aria-busy="true"
			aria-live="polite"
			sx={{ position: 'relative', width: '100%', minHeight: '60vh', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}
		>
			<Box sx={{ opacity: 0.45, display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Skeleton variant="text" animation="wave" width="38%" height={44} sx={tint(0.12)} />
					<Skeleton variant="text" animation="wave" width="55%" height={22} sx={tint(0.08)} />
				</Box>
				<SectionSkeleton variant="stats" rows={4} compact />
				<SectionSkeleton variant={body} compact rows={6} />
			</Box>
			<Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
				{centerpiece === 'box' ? (
					<Box
						data-testid="page-box"
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 1,
							px: 4,
							py: 3,
							borderRadius: 3,
							bgcolor: 'background.paper',
							border: 1,
							borderColor: 'divider',
							boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
						}}
					>
						<CircularProgress size={44} thickness={3.5} sx={{ color: '#ea580c' }} />
						<Typography sx={{ fontWeight: 700, color: '#ea580c' }}>{title}</Typography>
						{subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
					</Box>
				) : (
					<ProcessingState title={title} subtitle={subtitle ?? ''} />
				)}
			</Box>
		</Box>
	);
}

export default PageSkeleton;
