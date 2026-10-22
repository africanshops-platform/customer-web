/**
 * Helpers for the customer's live delivery map (merchant-32 L4b). Mirrors the partner run screen's helpers and
 * customer-mobile's features/food/utils/deliveryLive.ts (which carries the unit tests): keep them in step.
 */

export const ROAD_FACTOR = 1.3; // the same factor the delivery fee uses
export const AVERAGE_SPEED_KMH = 25;

/** A real map point or null: never 0,0, never out of range, never half a pair. */
export function toPoint(lat, lng) {
	if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
	const la = Number(lat);
	const lo = Number(lng);
	const ok = Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180 && !(la === 0 && lo === 0);

	return ok ? { lat: la, lng: lo } : null;
}

export function haversineKm(a, b) {
	const rad = (d) => (d * Math.PI) / 180;
	const dLat = rad(b.lat - a.lat);
	const dLng = rad(b.lng - a.lng);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;

	return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "about 7 min away" from the rider to the customer, or null when either point is missing. */
export function riderEtaLabel(rider, destination) {
	const a = toPoint(rider?.lat, rider?.lng);
	const b = toPoint(destination?.lat, destination?.lng);
	if (!a || !b) return null;
	const km = haversineKm(a, b) * ROAD_FACTOR;
	if (km < 0.15) return 'just around the corner';
	const minutes = Math.max(1, Math.round((km / AVERAGE_SPEED_KMH) * 60));

	return `about ${minutes} min away · ${km.toFixed(1)} km`;
}

/** The `tel:` link for the rider: only a dialable number (7-15 digits, optional +), else null so no button shows. */
export function riderTelUrl(phone) {
	if (typeof phone !== 'string') return null;
	const cleaned = phone.replace(/[\s().-]/g, '');

	return /^\+?\d{7,15}$/.test(cleaned) ? `tel:${cleaned}` : null;
}
