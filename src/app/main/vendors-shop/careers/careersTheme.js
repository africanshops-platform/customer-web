// Re-exported from the shared theme file so every existing careers import
// of these two keeps working unchanged — STATUS_META below is the only
// thing genuinely specific to careers.
export { ORANGE_GRADIENT, fadeUp } from 'src/app/shared-components/africanShopsTheme';

export const STATUS_META = {
	SUBMITTED: { label: 'Submitted', className: 'text-sky-700 bg-sky-100' },
	UNDER_REVIEW: { label: 'Under review', className: 'text-amber-700 bg-amber-100' },
	SHORTLISTED: { label: 'Shortlisted', className: 'text-purple-700 bg-purple-100' },
	REJECTED: { label: 'Not selected', className: 'text-red-700 bg-red-100' },
	SELECTED: { label: 'Selected', className: 'text-green-700 bg-green-100' }
};
