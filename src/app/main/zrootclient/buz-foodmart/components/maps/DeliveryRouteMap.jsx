import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Typography } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

/**
 * The platform's standard map (the merchant food-order detail map): plain Leaflet created once and removed on
 * unmount, OpenStreetMap tiles, compact attribution, the orange restaurant pin, a green home pin for the customer's
 * delivery point, an animated fly-to.
 *
 * It only ever draws REAL points: the restaurant's pin and, when given, the customer's own pinned delivery point.
 * It never guesses the viewer's position and never shows an estimated fee or time (the real fee is quoted at checkout
 * from the restaurant to the customer's exact point).
 */

const RESTAURANT_ICON = L.divIcon({
  html: `
    <div style="width:42px;height:54px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4))">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="42" height="54">
        <defs><linearGradient id="rtg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/><stop offset="100%" style="stop-color:#dc2626"/>
        </linearGradient></defs>
        <path d="M21 0C9.4 0 0 9.4 0 21c0 15.5 21 33 21 33S42 36.5 42 21C42 9.4 32.6 0 21 0z" fill="url(#rtg)" stroke="white" stroke-width="2"/>
        <circle cx="21" cy="21" r="13" fill="rgba(255,255,255,0.2)"/>
        <text x="21" y="27" text-anchor="middle" font-size="15" fill="white">🍽️</text>
      </svg>
    </div>`,
  className: "",
  iconSize: [42, 54],
  iconAnchor: [21, 54],
  popupAnchor: [0, -56],
});

const HOME_ICON = L.divIcon({
  html: `
    <div style="width:42px;height:54px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4))">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="42" height="54">
        <defs><linearGradient id="hmg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e"/><stop offset="100%" style="stop-color:#15803d"/>
        </linearGradient></defs>
        <path d="M21 0C9.4 0 0 9.4 0 21c0 15.5 21 33 21 33S42 36.5 42 21C42 9.4 32.6 0 21 0z" fill="url(#hmg)" stroke="white" stroke-width="2"/>
        <circle cx="21" cy="21" r="13" fill="rgba(255,255,255,0.2)"/>
        <text x="21" y="27" text-anchor="middle" font-size="15" fill="white">🏠</text>
      </svg>
    </div>`,
  className: "",
  iconSize: [42, 54],
  iconAnchor: [21, 54],
  popupAnchor: [0, -56],
});

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const toPoint = (lat, lng) => {
  const a = Number(lat);
  const b = Number(lng);
  return lat != null && lng != null && Number.isFinite(a) && Number.isFinite(b) && !(a === 0 && b === 0) ? [a, b] : null;
};

function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param restaurant   the restaurant record ({ title, address, latitude, longitude })
 * @param destination  optional { lat, lng } of the customer's own pinned delivery point
 */
function DeliveryRouteMap({ restaurant, destination }) {
  const containerRef = useRef(null);
  // Created once; the points are re-applied when they change without rebuilding the map.
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const restaurantPos = toPoint(restaurant?.latitude, restaurant?.longitude);
  const destPos = toPoint(destination?.lat, destination?.lng);
  const apartKm = restaurantPos && destPos ? haversineKm(restaurantPos, destPos) : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const map = L.map(el, { center: [9.082, 8.6753], zoom: 6, zoomControl: true, attributionControl: false, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const pts = [];

    if (restaurantPos) {
      L.marker(restaurantPos, { icon: RESTAURANT_ICON })
        .bindPopup(
          `<div style="min-width:170px;font-family:system-ui,sans-serif;padding:4px 2px">
             <div style="font-weight:700;font-size:13px;color:#ea580c">🍽️ ${esc(restaurant?.title || "Restaurant")}</div>
             ${restaurant?.address ? `<div style="font-size:12px;color:#4b5563;margin-top:3px">${esc(restaurant.address)}</div>` : ""}
           </div>`,
          { maxWidth: 240 },
        )
        .addTo(layer);
      pts.push(restaurantPos);
    }
    if (destPos) {
      L.marker(destPos, { icon: HOME_ICON })
        .bindPopup(
          `<div style="min-width:150px;font-family:system-ui,sans-serif;padding:4px 2px">
             <div style="font-weight:700;font-size:13px;color:#15803d">🏠 Your delivery point</div>
           </div>`,
          { maxWidth: 220 },
        )
        .addTo(layer);
      pts.push(destPos);
    }
    if (pts.length === 2) {
      L.polyline(pts, { color: "#ea580c", weight: 3, dashArray: "8 8", opacity: 0.85 }).addTo(layer);
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 16, animate: false });
    } else if (pts.length === 1) {
      map.flyTo(pts[0], 15, { animate: true, duration: 1.4 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantPos?.[0], restaurantPos?.[1], destPos?.[0], destPos?.[1], restaurant?.title, restaurant?.address]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 200 }} data-testid="delivery-route-map" />
      <div
        className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-center gap-1 px-3 py-2"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
      >
        <LocationOn sx={{ color: "#ea580c", fontSize: 15 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827" }}>
          {apartKm != null
            ? `About ${apartKm < 1 ? `${Math.round(apartKm * 1000)} m` : `${apartKm.toFixed(1)} km`} from the restaurant`
            : "Your delivery fee is measured from here to your delivery point at checkout"}
        </Typography>
      </div>
    </div>
  );
}

export default DeliveryRouteMap;
