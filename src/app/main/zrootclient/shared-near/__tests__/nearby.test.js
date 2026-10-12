import {
	DEFAULT_RADIUS_KM,
	RADIUS_OPTIONS_KM,
	buildNominatimUrl,
	clearPlaceSearchCache,
	distanceLabel,
	geoCenter,
	groupByLocation,
	isValidPoint,
	parseNominatimResults,
	priceChip,
	radiusForRegion,
	searchPlaces,
	toCoordinate
} from "../nearby";

describe("toCoordinate", () => {
	it("never turns an empty value into 0", () => {
		expect(toCoordinate("")).toBeNull();
		expect(toCoordinate("  ")).toBeNull();
		expect(toCoordinate(null)).toBeNull();
		expect(toCoordinate(undefined)).toBeNull();
		expect(toCoordinate("abc")).toBeNull();
	});
	it("parses real values including 0", () => {
		expect(toCoordinate("9.05")).toBe(9.05);
		expect(toCoordinate(7)).toBe(7);
		expect(toCoordinate("0")).toBe(0);
	});
});

describe("isValidPoint", () => {
	it("accepts in-range numbers only", () => {
		expect(isValidPoint({ lat: 9, lng: 7 })).toBe(true);
		expect(isValidPoint({ lat: 91, lng: 7 })).toBe(false);
		expect(isValidPoint({ lat: "9", lng: 7 })).toBe(false);
		expect(isValidPoint(null)).toBe(false);
	});
});

describe("priceChip", () => {
	it("shortens prices for a map chip", () => {
		expect(priceChip(30000)).toBe("₦30k");
		expect(priceChip(115000)).toBe("₦115k");
		expect(priceChip(1250000)).toBe("₦1.3m");
		expect(priceChip(2000000)).toBe("₦2m");
		expect(priceChip(850)).toBe("₦850");
	});
	it("is empty for missing or non-positive prices", () => {
		expect(priceChip(undefined)).toBe("");
		expect(priceChip(0)).toBe("");
		expect(priceChip("abc")).toBe("");
	});
});

describe("distanceLabel", () => {
	it("formats distances", () => {
		expect(distanceLabel(0.4)).toBe("< 1 km away");
		expect(distanceLabel(2.46)).toBe("2.5 km away");
		expect(distanceLabel(15.5)).toBe("16 km away");
		expect(distanceLabel(undefined)).toBe("");
		expect(distanceLabel(NaN)).toBe("");
	});
});

describe("geoCenter / radiusForRegion", () => {
	it("parses string centres and rejects junk", () => {
		expect(geoCenter({ latitude: "9.0578", longitude: "7.4950" })).toEqual({ lat: 9.0578, lng: 7.495 });
		expect(geoCenter({ latitude: "", longitude: "7" })).toBeNull();
		expect(geoCenter({ latitude: "99", longitude: "7" })).toBeNull();
		expect(geoCenter(null)).toBeNull();
	});
	it("first radius is 10 km and is one of the offered choices", () => {
		expect(DEFAULT_RADIUS_KM).toBe(10);
		expect(RADIUS_OPTIONS_KM).toContain(DEFAULT_RADIUS_KM);
	});
	it("regions get a sensible radius", () => {
		expect(radiusForRegion("district")).toBe(10);
		expect(radiusForRegion("state")).toBeGreaterThan(radiusForRegion("lga"));
		expect(radiusForRegion("nonsense")).toBe(DEFAULT_RADIUS_KM);
	});
});

describe("groupByLocation", () => {
	const it1 = (id, lat, lng) => ({ id, latitude: lat, longitude: lng });
	it("returns lone items as groups of one", () => {
		const out = groupByLocation([it1("a", "9.1", "7.4"), it1("b", "9.2", "7.5")]);
		expect(out).toHaveLength(2);
		expect(out[0].items).toHaveLength(1);
	});
	it("merges items at the same spot", () => {
		const out = groupByLocation([it1("a", "9.0765", "7.3986"), it1("b", 9.0765, 7.3986), it1("c", "9.0765", "7.3986"), it1("far", "6.5", "3.3")]);
		expect(out).toHaveLength(2);
		expect(out[0].items.map((x) => x.id)).toEqual(["a", "b", "c"]);
	});
	it("treats points within about a metre as the same spot", () => {
		expect(groupByLocation([it1("a", "9.076500", "7.398600"), it1("b", "9.076501", "7.398601")])).toHaveLength(1);
	});
	it("skips items with no usable coordinates and tolerates junk input", () => {
		expect(groupByLocation([it1("a", "", ""), it1("b", "abc", "7"), it1("c", "95", "7"), null, undefined])).toEqual([]);
		expect(groupByLocation(undefined)).toEqual([]);
	});
});

describe("Nominatim", () => {
	beforeEach(() => clearPlaceSearchCache());
	const ok = (body) => jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body });

	it("encodes the query and bounds a runaway one", () => {
		const url = buildNominatimUrl("Wuse 2, Abuja & more", 3);
		expect(url).toContain("q=Wuse%202%2C%20Abuja%20%26%20more");
		expect(url).toContain("limit=3");
		expect(buildNominatimUrl("x".repeat(1000)).length).toBeLessThan(400);
	});
	it("maps results and shortens the label; drops junk", () => {
		expect(parseNominatimResults([{ lat: "9.07", lon: "7.47", display_name: "Wuse 2, Abuja, FCT, Nigeria" }])).toEqual([
			{ label: "Wuse 2, Abuja, FCT", lat: 9.07, lng: 7.47 }
		]);
		expect(parseNominatimResults([{ lat: "x", lon: "1", display_name: "a" }, { lat: "1", lon: "1" }])).toEqual([]);
		expect(parseNominatimResults(null)).toEqual([]);
	});
	it("ignores queries shorter than 3 characters without calling the network", async () => {
		const f = ok([]);
		expect(await searchPlaces("ab", f)).toEqual([]);
		expect(f).not.toHaveBeenCalled();
	});
	it("caches by query (case-insensitive)", async () => {
		const f = ok([{ lat: "9", lon: "7", display_name: "A, B" }]);
		await searchPlaces("Wuse Abuja", f);
		await searchPlaces("  wuse abuja ", f);
		expect(f).toHaveBeenCalledTimes(1);
	});
	it("throws on an error response", async () => {
		const f = jest.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
		await expect(searchPlaces("Wuse Abuja", f)).rejects.toThrow("429");
	});
});
