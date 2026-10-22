import { haversineKm, riderEtaLabel, riderTelUrl, toPoint } from '../deliveryLive';

describe('toPoint', () => {
	it('accepts a real point, rejects 0,0 / out of range / half a pair / junk', () => {
		expect(toPoint(9.07, 7.39)).toEqual({ lat: 9.07, lng: 7.39 });
		expect(toPoint('9.07', '7.39')).toEqual({ lat: 9.07, lng: 7.39 });
		for (const [a, b] of [[0, 0], [91, 0], [0, 181], [9, undefined], [null, null], ['x', 'y']]) expect(toPoint(a, b)).toBeNull();
	});
});

describe('riderEtaLabel', () => {
	const home = { lat: 9.0765, lng: 7.3986 };

	it('estimates minutes from the road distance at 25 km/h', () => {
		const rider = { lat: 9.1065, lng: 7.3986 }; // ~3.3 km straight, ~4.3 km by road
		expect(haversineKm(rider, home)).toBeCloseTo(3.34, 1);
		expect(riderEtaLabel(rider, home)).toBe('about 10 min away · 4.3 km');
	});

	it('says "just around the corner" when very close', () => {
		expect(riderEtaLabel({ lat: 9.0766, lng: 7.3986 }, home)).toBe('just around the corner');
	});

	it('is null without both points', () => {
		expect(riderEtaLabel(null, home)).toBeNull();
		expect(riderEtaLabel({ lat: 9.1, lng: 7.4 }, null)).toBeNull();
		expect(riderEtaLabel({ lat: 0, lng: 0 }, home)).toBeNull();
	});
});

describe('riderTelUrl', () => {
	it('builds a tel link from a dialable number, stripping formatting', () => {
		expect(riderTelUrl('0803 000 1111')).toBe('tel:08030001111');
		expect(riderTelUrl('+234 (803) 000-1111')).toBe('tel:+2348030001111');
	});
	it('shows no call button for anything else', () => {
		for (const v of [null, undefined, '', 'abc', '123', '<script>', 5]) expect(riderTelUrl(v)).toBeNull();
	});
});
