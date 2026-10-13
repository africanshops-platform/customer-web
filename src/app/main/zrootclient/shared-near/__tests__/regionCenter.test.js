import { pickRegionCenter } from "../regionCenter";

const lists = {
	districts: [{ id: "d1", name: "Garki", latitude: "9.1758", longitude: "7.1808" }],
	lgas: [{ id: "l1", name: "Abuja Municipal", latitude: "9.0578", longitude: "7.4950" }],
	states: [{ id: "s1", name: "FCT", latitude: "8.8940", longitude: "7.1860" }],
	countries: [{ id: "c1", name: "Nigeria", latitude: "9.0820", longitude: "8.6753" }]
};

describe("pickRegionCenter", () => {
	it("prefers the most specific chosen region", () => {
		expect(pickRegionCenter({ district: "d1", lga: "l1", state: "s1", country: "c1" }, lists)).toEqual({
			point: { lat: 9.1758, lng: 7.1808 },
			level: "district",
			label: "Garki"
		});
		expect(pickRegionCenter({ lga: "l1", state: "s1", country: "c1" }, lists).level).toBe("lga");
		expect(pickRegionCenter({ state: "s1", country: "c1" }, lists).level).toBe("state");
		expect(pickRegionCenter({ country: "c1" }, lists).level).toBe("country");
	});
	it("falls back to the next level when a region has no usable centre", () => {
		const broken = { ...lists, districts: [{ id: "d1", name: "Garki", latitude: "", longitude: "" }] };
		expect(pickRegionCenter({ district: "d1", lga: "l1" }, broken).level).toBe("lga");
	});
	it("is null when nothing is chosen or nothing has a centre", () => {
		expect(pickRegionCenter({}, lists)).toBeNull();
		expect(pickRegionCenter({ state: "s1" }, { states: [{ id: "s1", name: "x", latitude: "", longitude: "" }] })).toBeNull();
		expect(pickRegionCenter({ state: "nope" }, lists)).toBeNull();
		expect(pickRegionCenter({ state: "s1" })).toBeNull();
	});
});
