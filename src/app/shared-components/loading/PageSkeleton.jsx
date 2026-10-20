import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SectionSkeleton from './SectionSkeleton';

const tint = (o) => ({ bgcolor: `rgba(234, 88, 12, ${o})`, borderRadius: 1 });

/**
 * Loading state B, for a WHOLE PAGE on first load (a route opening): a heading, a row of figures and a body, in the same frame the page
 * will use. It is what shows while a page's code or first data loads. A page that then loads sections separately should switch to
 * SectionSkeleton for each section.
 *
 * @param {string} title Optional plain words under the heading line, such as "Loading your bookings".
 * @param {'list'|'table'|'cards'|'form'} body The shape of the main area.
 */
function PageSkeleton({ title = 'Loading', subtitle, body = 'list' }) {
	return (
		<Box role="status" aria-busy="true" aria-live="polite" sx={{ width: '100%', minHeight: '60vh', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Skeleton variant="text" animation="wave" width="38%" height={44} sx={tint(0.12)} />
				<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle ?? title}</Typography>
			</Box>
			<SectionSkeleton variant="stats" rows={4} compact />
			<SectionSkeleton variant={body} compact rows={body === 'cards' ? 6 : 6} />
		</Box>
	);
}

export default PageSkeleton;
