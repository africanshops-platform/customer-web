import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

const pulse = keyframes`
	0%, 100% { transform: scale(1); }
	50% { transform: scale(0.92); }
`;

const tint = (opacity) => ({ bgcolor: `rgba(234, 88, 12, ${opacity})`, borderRadius: 1 });

function Line({ w = '100%', h = 14, o = 0.1 }) {
	return <Skeleton variant="text" animation="wave" width={w} height={h} sx={tint(o)} />;
}

const SHAPES = {
	// stat cards (loading state C): a round icon and label, a big figure, and a small chart block, like the real widget
	stats: ({ rows }) => (
		<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1.5 }}>
			{Array.from({ length: rows }).map((_, i) => (
				<Box key={i} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<Skeleton variant="circular" animation="wave" width={34} height={34} sx={tint(0.12)} />
						<Box sx={{ flex: 1 }}>
							<Line w="70%" h={12} />
						</Box>
					</Box>
					<Line w="55%" h={30} o={0.14} />
					<Skeleton variant="rounded" animation="wave" height={44} sx={tint(0.08)} />
				</Box>
			))}
		</Box>
	),
	// a table: a header and rows with the same columns as the real one
	table: ({ rows, columns }) => (
		<Box>
			<Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
				{Array.from({ length: columns }).map((_, c) => <Line key={c} w="60%" h={12} o={0.14} />)}
			</Box>
			{Array.from({ length: rows }).map((_, r) => (
				<Box key={r} sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
					{Array.from({ length: columns }).map((__, c) => <Line key={c} w={c === 0 ? '80%' : '55%'} />)}
				</Box>
			))}
		</Box>
	),
	// a list of rows with an avatar, such as people, orders or messages
	list: ({ rows }) => (
		<Box>
			{Array.from({ length: rows }).map((_, i) => (
				<Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
					<Skeleton variant="circular" animation="wave" width={36} height={36} sx={tint(0.12)} />
					<Box sx={{ flex: 1 }}>
						<Line w="45%" h={14} o={0.12} />
						<Line w="70%" h={11} o={0.07} />
					</Box>
				</Box>
			))}
		</Box>
	),
	// a form: labels and fields
	form: ({ rows }) => (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			{Array.from({ length: rows }).map((_, i) => (
				<Box key={i}>
					<Line w="25%" h={11} />
					<Skeleton variant="rounded" animation="wave" height={40} sx={tint(0.08)} />
				</Box>
			))}
		</Box>
	),
	// cards with an image, such as products or listings
	cards: ({ rows }) => (
		<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
			{Array.from({ length: rows }).map((_, i) => (
				<Box key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
					<Skeleton variant="rectangular" animation="wave" height={110} sx={tint(0.1)} />
					<Box sx={{ p: 1.25 }}>
						<Line w="80%" h={14} o={0.12} />
						<Line w="45%" h={12} />
					</Box>
				</Box>
			))}
		</Box>
	)
};

/**
 * Loading state D, for a SECTION or component that is waiting for its own data. The grey shape copies the layout the data will take,
 * so nothing jumps when it arrives, and a small brand mark with a plain label says what is loading.
 * Pick the variant that matches the component: stats (stat cards, loading state C), table, list, form or cards.
 *
 * @param {string} label What is loading, for example "Loading reservations".
 * @param {'stats'|'table'|'list'|'form'|'cards'} variant
 * @param {number} rows How many rows or cards to suggest.
 * @param {number} columns Table only.
 * @param {boolean} compact Hide the heading line (for a small widget).
 */
function SectionSkeleton({ label = 'Loading', variant = 'list', rows, columns = 4, compact = false }) {
	const Shape = SHAPES[variant] ?? SHAPES.list;
	const count = rows ?? { stats: 4, table: 5, list: 4, form: 4, cards: 4 }[variant] ?? 4;

	return (
		<Box role="status" aria-busy="true" aria-live="polite" sx={{ width: '100%', p: 2 }}>
			{!compact && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
					<Box
						sx={{
							width: 26,
							height: 26,
							borderRadius: '50%',
							bgcolor: '#fff',
							display: 'grid',
							placeItems: 'center',
							boxShadow: '0 1px 6px rgba(0,0,0,0.16)',
							animation: `${pulse} 2s ease-in-out infinite`,
							'@media (prefers-reduced-motion: reduce)': { animation: 'none' }
						}}
					>
						<img src="/assets/images/afslogo/aflogo.png" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />
					</Box>
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
				</Box>
			)}
			<Shape rows={count} columns={columns} />
		</Box>
	);
}

export default SectionSkeleton;
