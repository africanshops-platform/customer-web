import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useUserLocation from "./useUserLocation";
import { DEFAULT_RADIUS_KM } from "./nearby";

/**
 * Near-me state for a customer-web listing page (tracker customer-22), shared by bookings, real estate and food venues.
 *
 * near = null (off: the page's ordinary list) or { point, label, source: "me" | "place" }. While on, `nearParams`
 * ({ lat, lng, radiusKm }) are merged into the page's own list query, so every other filter and the pagination keep working.
 * `onReset()` is called whenever the search point or radius changes so the page can go back to its first page.
 *
 * Auto-start (founder 2026-10-13: the map and list open on the visitor's own location, like the mobile Nearby screen): on
 * mount it asks the browser for the position once and switches near-me on when it is granted. It stays off when location is
 * denied/unavailable, and once the visitor turns it off it stays off for the rest of the browser session.
 */
export const NEAR_ME_OFF_KEY = "nearMe:off";

function readOffFlag() {
	try {
		return window.sessionStorage.getItem(NEAR_ME_OFF_KEY) === "1";
	} catch {
		return false;
	}
}

function writeOffFlag(off) {
	try {
		if (off) window.sessionStorage.setItem(NEAR_ME_OFF_KEY, "1");
		else window.sessionStorage.removeItem(NEAR_ME_OFF_KEY);
	} catch {
		// storage blocked (private mode): near-me still works, it just will not remember the choice
	}
}

export default function useNearMe(onReset, { autoStart = true } = {}) {
	const gps = useUserLocation(false);
	const [near, setNear] = useState(null);
	const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

	const useMyLocation = useCallback(async () => {
		const point = await gps.refresh();
		if (point) {
			writeOffFlag(false);
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
		writeOffFlag(true);
		setNear(null);
		onReset?.();
	}, [onReset]);

	const started = useRef(false);
	useEffect(() => {
		if (!autoStart || started.current) return;
		started.current = true;
		if (readOffFlag()) return;
		useMyLocation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoStart]);

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
