import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const PIN = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI2VhNTgwYyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
});

const NIGERIA_CENTRE = [9.082, 8.6753];

function Recenter({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [point?.lat, point?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function ClickToPin({ onChange }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/**
 * A map where the customer places the point their order should be delivered to: tap anywhere, or drag the pin.
 * Controlled — `value` is {lat,lng} or null; `onChange` receives the new point.
 */
function LocationPickerMap({ value, onChange, height = 320 }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ height, border: "1px solid rgba(229,231,235,1)" }} data-testid="location-picker-map">
      <MapContainer
        center={value ? [value.lat, value.lng] : NIGERIA_CENTRE}
        zoom={value ? 16 : 6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter point={value} />
        <ClickToPin onChange={onChange} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={PIN}
            draggable
            eventHandlers={{ dragend: (e) => onChange({ lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng }) }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LocationPickerMap;
