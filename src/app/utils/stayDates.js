/**
 * Booking dates are stored as the instant of local midnight in Lagos (check-in "26 Nov" is 2026-11-25T23:00:00Z). A screen must therefore name the
 * calendar day in Lagos, not the day of the UTC string (that is one day early) and not the day on the viewer's own device clock (that moves with
 * their time zone). Every booking screen formats through here so the same stay shows the same dates everywhere.
 */
export const STAY_TIME_ZONE = 'Africa/Lagos';

const parts = (iso) => {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	const out = {};
	new Intl.DateTimeFormat('en-GB', { timeZone: STAY_TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
		.formatToParts(d)
		.forEach((p) => {
			out[p.type] = p.value;
		});
	return out;
};

/** "Thu Nov 26 2026" for a stored booking date, in Lagos time. Empty string when there is no usable date. */
export function formatStayDay(iso) {
	const p = parts(iso);
	return p ? `${p.weekday} ${p.month} ${p.day} ${p.year}` : '';
}

/** "2026-11-26": the Lagos calendar day of a stored booking date (for comparing or sending a day). */
export function stayDayKey(iso) {
	const p = parts(iso);
	if (!p) return '';
	const month = String(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(p.month) + 1).padStart(2, '0');
	return `${p.year}-${month}-${String(p.day).padStart(2, '0')}`;
}
