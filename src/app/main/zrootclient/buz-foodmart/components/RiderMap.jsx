import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

const pin = (emoji, from, to) =>
	L.divIcon({
		html: `<div style="width:40px;height:50px;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.4))"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="40" height="50"><defs><linearGradient id="r${emoji.codePointAt(0)}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><path d="M21 0C9.4 0 0 9.4 0 21c0 15.5 21 33 21 33S42 36.5 42 21C42 9.4 32.6 0 21 0z" fill="url(#r${emoji.codePointAt(0)})" stroke="white" stroke-width="2"/><text x="21" y="27" text-anchor="middle" font-size="15" fill="white">${emoji}</text></svg></div>`,
		className: '',
		iconSize: [40, 50],
		iconAnchor: [20, 50]
	});

const HOME_ICON = pin('🏠', '#22c55e', '#15803d');
const RIDER_ICON = L.divIcon({
	html: '<div style="font-size:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45))">🛵</div>',
	className: '',
	iconSize: [34, 34],
	iconAnchor: [17, 17]
});

/** The customer's map: their delivery pin and the rider moving toward it. Created once, removed on unmount. */
export default function RiderMap({ destination, rider, height = 260 }) {
	const elRef = useRef(null);
	const mapRef = useRef(null);
	const homeRef = useRef(null);
	const riderRef = useRef(null);

	useEffect(() => {
		const map = L.map(elRef.current, { center: [9.082, 8.6753], zoom: 6, zoomControl: true, attributionControl: false });
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
		mapRef.current = map;
		setTimeout(() => map.invalidateSize(), 200);

		return () => {
			map.remove();
			mapRef.current = null;
			homeRef.current = null;
			riderRef.current = null;
		};
	}, []);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		if (destination && !homeRef.current) homeRef.current = L.marker([destination.lat, destination.lng], { icon: HOME_ICON }).addTo(map).bindPopup('Your delivery point');
		if (rider) {
			if (!riderRef.current) riderRef.current = L.marker([rider.lat, rider.lng], { icon: RIDER_ICON }).addTo(map).bindPopup('Your rider');
			else riderRef.current.setLatLng([rider.lat, rider.lng]);
		}
		const pts = [destination, rider].filter(Boolean).map((p) => [p.lat, p.lng]);
		if (pts.length > 1) map.flyToBounds(pts, { padding: [48, 48], maxZoom: 16, duration: 0.8 });
		else if (pts.length === 1) map.flyTo(pts[0], 15, { duration: 0.8 });
	}, [destination?.lat, destination?.lng, rider?.lat, rider?.lng]);

	return <div ref={elRef} data-testid="rider-map" style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }} />;
}
