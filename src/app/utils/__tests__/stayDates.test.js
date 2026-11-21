import { formatStayDay, stayDayKey } from '../stayDates';

describe('stayDates (a stay shows the same Lagos calendar day on every device)', () => {
	it('names the day the guest picked: local midnight in Lagos is the evening before in UTC', () => {
		expect(formatStayDay('2026-11-25T23:00:00.000Z')).toBe('Thu Nov 26 2026');
		expect(formatStayDay('2026-11-26T23:00:00.000Z')).toBe('Fri Nov 27 2026');
		expect(stayDayKey('2026-11-25T23:00:00.000Z')).toBe('2026-11-26');
	});

	it('does not depend on the viewer\'s own time zone setting', () => {
		const prev = process.env.TZ;
		for (const tz of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
			process.env.TZ = tz;
			expect(formatStayDay('2026-11-25T23:00:00.000Z')).toBe('Thu Nov 26 2026');
		}
		process.env.TZ = prev;
	});

	it('is empty for a missing or unreadable date instead of throwing', () => {
		expect(formatStayDay(undefined)).toBe('');
		expect(formatStayDay('not a date')).toBe('');
		expect(stayDayKey(null)).toBe('');
	});
});
