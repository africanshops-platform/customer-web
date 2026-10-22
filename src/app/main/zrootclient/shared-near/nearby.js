/**
 * Near-me search helpers shared by every customer-web page that lists places (bookings, real estate, food venues).
 * Mirrors customer-mobile (app/shared/maps/nearbyMap.ts + features/bookings/utils/nearby.ts) so both clients behave the
 * same: default radius 10 km, the same radius choices, the same chip/distance wording, the same grouping of listings at
 * one spot, and free OpenStreetMap Nominatim for typed addresses (no paid map services). Tracker customer-22.
 */

export const DEFAULT_RADIUS_KM = 10;
export const RADIUS_OPTIONS_KM = [5, 10, 25, 50];
/** Abuja, FCT: used only when there is no location permission and no chosen place. */
export const DEFAULT_CENTER = { lat: 9.0765, lng: 7.3986 };

/** "9.05" -> 9.05; "", null, undefined and junk -> null (Number("") is 0, which would silently become a point on the equator). */
export function toCoordinate(value) {
	if (value === null || value === undefined) return null;
	if (typeof value === "string" && value.trim() === "") return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

export function isValidPoint(p) {
	if (!p || typeof p !== "object") return false;
	const { lat, lng } = p;
	return (
		typeof lat === "number" &&
		typeof lng === "number" &&
		Number.isFinite(lat) &&
		Number.isFinite(lng) &&
		lat >= -90 &&
		lat <= 90 &&
		lng >= -180 &&
		lng <= 180
	);
}

/** "₦30,000" -> "₦30k", "₦1,250,000" -> "₦1.3m": short enough for a map chip. */
export function priceChip(price) {
	const n = Number(price);
	if (!Number.isFinite(n) || n <= 0) return "";
	if (n >= 1_000_000) return `₦${(Math.round(n / 100_000) / 10).toString().replace(/\.0$/, "")}m`;
	if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
	return `₦${Math.round(n)}`;
}

export function distanceLabel(km) {
	if (typeof km !== "number" || !Number.isFinite(km)) return "";
	if (km < 1) return "< 1 km away";
	return `${km < 10 ? km.toFixed(1) : Math.round(km)} km away`;
}

/** The centre of a chosen region (country/state/LGA/district) or null when it has no usable centre point. */
export function geoCenter(item) {
	if (!item) return null;
	const lat = toCoordinate(item.latitude);
	const lng = toCoordinate(item.longitude);
	const point = lat !== null && lng !== null ? { lat, lng } : null;
	return point && isValidPoint(point) ? point : null;
}

/** Wider for a state than for a district. */
export function radiusForRegion(level) {
	return { country: 50, state: 50, lga: 25, district: 10 }[level] ?? DEFAULT_RADIUS_KM;
}

/**
 * Map items {id, lat, lng, ...} at the same spot (same coordinates to ~1 m: apartments in one building, seeded test
 * data) would draw on top of each other. They are merged into ONE group {lat, lng, items:[...]} per spot; a lone item is
 * returned as a group of one so callers handle a single shape.
 */
export function groupByLocation(items) {
	const groups = new Map();
	for (const item of items || []) {
		const lat = toCoordinate(item?.latitude ?? item?.lat);
		const lng = toCoordinate(item?.longitude ?? item?.lng);
		if (lat === null || lng === null || !isValidPoint({ lat, lng })) continue;
		const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
		const g = groups.get(key);
		if (g) g.items.push(item);
		else groups.set(key, { lat, lng, items: [item] });
	}
	return Array.from(groups.values());
}

// ── Typed-address search: free OpenStreetMap Nominatim ─────────────────────────────────────────────────────────────
// Usage policy: identify the app, at most 1 request/second, no keystroke-by-keystroke autocomplete - so the UI searches
// on an explicit submit and results are cached per query.
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const placeCache = new Map();

export function buildNominatimUrl(query, limit = 5) {
	const q = encodeURIComponent(String(query || "").trim().slice(0, 200));
	return `${NOMINATIM}?format=jsonv2&addressdetails=0&limit=${limit}&q=${q}`;
}

/** Keeps only results with usable coordinates; the label is shortened to the first three comma-separated parts. */
export function parseNominatimResults(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (const item of raw) {
		const lat = Number(item?.lat);
		const lng = Number(item?.lon);
		const name = item?.display_name;
		if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
		if (typeof name !== "string" || !name.trim()) continue;
		out.push({ label: name.split(",").slice(0, 3).join(",").trim(), lat, lng });
	}
	return out;
}

export async function searchPlaces(query, fetchImpl = fetch) {
	const q = String(query || "").trim();
	if (q.length < 3) return [];
	const key = q.toLowerCase();
	if (placeCache.has(key)) return placeCache.get(key);
	// Browsers set their own User-Agent/Referer, which identifies the site to Nominatim.
	const res = await fetchImpl(buildNominatimUrl(q), { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`Address search failed (${res.status})`);
	const results = parseNominatimResults(await res.json());
	placeCache.set(key, results);
	return results;
}

/** Test hook. */
export function clearPlaceSearchCache() {
	placeCache.clear();
}
