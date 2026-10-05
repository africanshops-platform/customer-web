import Typography from '@mui/material/Typography';
import usePlatformStats from 'src/app/configs/data/server-calls/platformstats/usePlatformStats';

const LABELS = { customers: 'Customers', merchants: 'Merchants', products: 'Products' };

/**
 * Renders the real platform figures. `keys` picks which ones to show. Figures that are null/0 are hidden,
 * and the whole strip is hidden when none remain.
 */
function PlatformStatsStrip({ keys = ['customers', 'merchants', 'products'], className = '', valueSx, labelSx }) {
	const { data } = usePlatformStats();
	const stats = keys
		.map((k) => ({ label: LABELS[k], value: data?.[k] }))
		.filter((s) => Number.isInteger(s.value) && s.value > 0);

	if (!stats.length) return null;

	return (
		<div className={className}>
			{stats.map((s) => (
				<div
					key={s.label}
					className="text-center"
				>
					<Typography sx={valueSx}>{s.value.toLocaleString('en-NG')}</Typography>
					<Typography sx={labelSx}>{s.label}</Typography>
				</div>
			))}
		</div>
	);
}

export default PlatformStatsStrip;
