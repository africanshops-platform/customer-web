/** Same orange gradient this app already uses on /about, /contact and the
 * landing page — kept as constants so the three careers pages stay visually
 * consistent without repeating the literal gradient string everywhere. */
export const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)';

export const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});

export const STATUS_META = {
	SUBMITTED: { label: 'Submitted', className: 'text-sky-700 bg-sky-100' },
	UNDER_REVIEW: { label: 'Under review', className: 'text-amber-700 bg-amber-100' },
	SHORTLISTED: { label: 'Shortlisted', className: 'text-purple-700 bg-purple-100' },
	REJECTED: { label: 'Not selected', className: 'text-red-700 bg-red-100' },
	SELECTED: { label: 'Selected', className: 'text-green-700 bg-green-100' }
};
