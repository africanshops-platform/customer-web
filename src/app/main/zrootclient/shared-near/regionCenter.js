import { geoCenter } from "./nearby";

/**
 * The most specific chosen region (district > LGA > state > country) that has a usable centre point, as
 * { point, level, label }, or null. The listing pages' filter lists report it so near-me can recentre on the region.
 */
export function pickRegionCenter({ district, lga, state, country }, { districts = [], lgas = [], states = [], countries = [] } = {}) {
	const picks = [
		["district", districts.find((d) => d.id === district)],
		["lga", lgas.find((l) => l.id === lga)],
		["state", states.find((s) => s.id === state)],
		["country", countries.find((c) => c.id === country)]
	];
	for (const [level, item] of picks) {
		const point = geoCenter(item);
		if (item && point) return { point, level, label: item.name };
	}
	return null;
}
