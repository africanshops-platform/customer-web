import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const PIN = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI2VhNTgwYyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
});

const RESTAURANT_PIN = L.divIcon({
  className: "",
  html: '<div style="width:38px;height:38px;border-radius:50%;background:#fff;border:3px solid #ea580c;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 6px rgba(0,0,0,.4)">🍽️</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const NIGERIA_CENTRE = [9.082, 8.6753];

/**
 * A map where the customer places the point their order should be delivered to: tap anywhere, or drag the pin.
 * Controlled — `value` is {lat,lng} or null; `onChange` receives the new point.
 * Built with plain Leaflet (created once, removed on unmount) like the merchant order map, because
 * react-leaflet remounted this map on the first pin and crashed with "Map container is already initialized".
 */
function LocationPickerMap({ value, onChange, restaurant, height = 320 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const restaurantRef = useRef(null);
  const lineRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // create the map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const map = L.map(el, { center: NIGERIA_CENTRE, zoom: 6, zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    map.on("click", (e) => onChangeRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapRef.current = map;
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      restaurantRef.current = null;
      lineRef.current = null;
    };
  }, []);

  // keep the pin in step with `value`
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!value || !Number.isFinite(value.lat) || !Number.isFinite(value.lng)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const latlng = [value.lat, value.lng];
    if (!markerRef.current) {
      const marker = L.marker(latlng, { icon: PIN, draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current?.({ lat: p.lat, lng: p.lng });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(latlng);
    }
    // with a restaurant on the map, frame both ends of the trip; otherwise zoom to the pin
    if (restaurantRef.current) {
      map.flyToBounds(L.latLngBounds(latlng, restaurantRef.current.getLatLng()).pad(0.3), { duration: 0.8, maxZoom: 15 });
    } else {
      map.flyTo(latlng, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // the restaurant's own position, and a line to the delivery pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (restaurantRef.current) {
      restaurantRef.current.remove();
      restaurantRef.current = null;
    }
    if (lineRef.current) {
      lineRef.current.remove();
      lineRef.current = null;
    }
    if (!restaurant || !Number.isFinite(restaurant.lat) || !Number.isFinite(restaurant.lng)) return;
    const rp = [restaurant.lat, restaurant.lng];
    restaurantRef.current = L.marker(rp, { icon: RESTAURANT_PIN, interactive: true })
      .bindTooltip(`${restaurant.name || "Restaurant"}${restaurant.approximate ? " (approximate area)" : ""}`)
      .addTo(map);
    if (value && Number.isFinite(value.lat)) {
      lineRef.current = L.polyline([rp, [value.lat, value.lng]], { color: "#c2410c", weight: 5, opacity: 0.95, dashArray: "4 10", lineCap: "round" }).addTo(map);
      map.flyToBounds(L.latLngBounds(rp, [value.lat, value.lng]).pad(0.3), { duration: 0.8, maxZoom: 15 });
    } else {
      map.flyTo(rp, 13, { duration: 0.8 });
    }
  }, [restaurant?.lat, restaurant?.lng, value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="overflow-hidden rounded-xl" style={{ height, border: "1px solid rgba(229,231,235,1)" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} data-testid="location-picker-map" />
    </div>
  );
}

export default LocationPickerMap;
