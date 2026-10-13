import { useCallback, useEffect, useRef, useState } from "react";

/** A browser fix can hang (permission prompt ignored, indoors, desktop without GPS): stop waiting after this long. */
const FIX_TIMEOUT_MS = 8000;

/**
 * The visitor's current position for near-me search (tracker customer-22), same contract as customer-mobile's
 * useUserLocation. status: "idle" | "locating" | "granted" | "denied" | "unavailable". Never throws.
 * `autoRequest=false` leaves the permission prompt until `refresh()` is called (e.g. from a "Near me" button), so a page
 * can stay quiet until the visitor opts in.
 */
export default function useUserLocation(autoRequest = false) {
	const [status, setStatus] = useState("idle");
	const [position, setPosition] = useState(null);
	const mounted = useRef(true);

	const refresh = useCallback(
		() =>
			new Promise((resolve) => {
				if (typeof navigator === "undefined" || !navigator.geolocation) {
					if (mounted.current) setStatus("unavailable");
					resolve(null);
					return;
				}
				setStatus("locating");
				navigator.geolocation.getCurrentPosition(
					(pos) => {
						const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
						if (mounted.current) {
							setPosition(point);
							setStatus("granted");
						}
						resolve(point);
					},
					(err) => {
						// code 1 = the visitor said no; anything else = we could not get a fix
						if (mounted.current) setStatus(err?.code === 1 ? "denied" : "unavailable");
						resolve(null);
					},
					{ enableHighAccuracy: false, timeout: FIX_TIMEOUT_MS, maximumAge: 60_000 }
				);
			}),
		[]
	);

	useEffect(() => {
		mounted.current = true;
		if (autoRequest) refresh();
		return () => {
			mounted.current = false;
		};
	}, [autoRequest, refresh]);

	return { status, position, refresh };
}
