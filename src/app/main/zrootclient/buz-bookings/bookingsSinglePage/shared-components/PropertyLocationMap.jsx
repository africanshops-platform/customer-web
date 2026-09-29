import { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Typography, Chip } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom orange marker icon
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

/**
 * PropertyLocationMap Component
 * Displays a single property location on a map
 */
function PropertyLocationMap({ coordinates, propertyName, propertyAddress }) {
  // Default to Lagos, Nigeria if no coordinates provided
  const defaultCoordinates = [6.5244, 3.3792];

  const position = useMemo(() => {
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      const [lat, lng] = coordinates;
      if (!isNaN(lat) && !isNaN(lng)) {
        return [parseFloat(lat), parseFloat(lng)];
      }
    }
    return defaultCoordinates;
  }, [coordinates]);

  return (
    <div className="h-full rounded-2xl overflow-hidden shadow-lg relative">
      {/* Map Header Overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] p-3"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      >
        <Chip
          icon={<LocationOn sx={{ color: "white !important" }} />}
          label="Property Location"
          sx={{
            backgroundColor: "rgba(234, 88, 12, 0.95)",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.875rem",
            backdropFilter: "blur(10px)",
          }}
        />
      </div>

      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={true}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        {/* Custom Tile Layer - Esri light-gray canvas (base + reference), no API key required */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        {/* Esri splits the light canvas into a base fill layer and a separate
            roads/borders/labels overlay -- CARTO's light_all bundled both into
            one tile. Added for parity/clarity (founder feedback 2026-09-24). */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* Property Marker */}
        <Marker position={position} icon={customIcon}>
          <Popup className="custom-popup">
            <div className="p-2">
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                {propertyName || "Property Location"}
              </Typography>
              {propertyAddress && (
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: "#6b7280",
                  }}
                >
                  📍 {propertyAddress}
                </Typography>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

export default PropertyLocationMap;
