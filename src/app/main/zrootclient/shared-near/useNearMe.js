import { useCallback, useMemo, useState } from "react";
import useUserLocation from "./useUserLocation";
import { DEFAULT_RADIUS_KM } from "./nearby";

/**
 * Near-me state for a customer-web listing page (tracker customer-22), shared by bookings, real estate and food venues.
 *
 * near = null (off: the page's ordinary list) or { point, label, source: "me" | "place" }. While on, `nearParams`
 * ({ lat, lng, radiusKm }) are merged into the page's own list query, so every other filter and the pagination keep working.
 * `onReset()` is called whenever the search point or radius changes so the page can go back to its first page.
 */
export default function useNearMe(onReset) {
	const gps = useUserLocation(false);
	const [near, setNear] = useState(null);
	const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

	const useMyLocation = useCallback(async () => {
		const point = await gps.refresh();
		if (point) {
			setNear({ point, label: "your location", source: "me" });
			setRadiusKm(DEFAULT_RADIUS_KM);
			onReset?.();
		}
	}, [gps, onReset]);

	const pickPlace = useCallback(
		({ point, label, radiusKm: km }) => {
			setNear({ point, label, source: "place" });
			setRadiusKm(km);
			onReset?.();
		},
		[onReset]
	);

	const changeRadius = useCallback(
		(km) => {
			setRadiusKm(km);
			onReset?.();
		},
		[onReset]
	);

	const clear = useCallback(() => {
		setNear(null);
		onReset?.();
	}, [onReset]);

	/** From the filter list: a chosen Country / State / LGA / District recentres near-me (only while it is on). */
	const applyRegion = useCallback((region) => {
		if (!region) return;
		setNear((prev) => {
			if (!prev) return prev;
			if (prev.source === "place" && prev.label === region.label && prev.point.lat === region.point.lat) return prev;
			return { point: region.point, label: region.label, source: "place" };
		});
	}, []);

	const nearParams = useMemo(
		() => (near ? { lat: near.point.lat, lng: near.point.lng, radiusKm } : null),
		[near, radiusKm]
	);

	return { near, radiusKm, gps, useMyLocation, pickPlace, changeRadius, clear, applyRegion, nearParams };
}
