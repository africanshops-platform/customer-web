import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Typography, Chip } from "@mui/material";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const locationMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

function formatBusinessHours(openPeriod, closePeriod) {
  if (!openPeriod || !closePeriod) return null;
  try {
    const open = new Date(openPeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const close = new Date(closePeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${open} – ${close}`;
  } catch {
    return null;
  }
}

function ImprovedFoodMartMapSingle({ item }) {
  const hasLocation =
    item?.latitude && item?.longitude && !isNaN(item.latitude) && !isNaN(item.longitude);

  const position = hasLocation
    ? [parseFloat(item.latitude), parseFloat(item.longitude)]
    : [9.0765, 7.3986];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-lg">
      {/* Map Header Overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] p-4"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
        }}
      >
        <Chip
          label={item?.title || "Location"}
          sx={{
            backgroundColor: "rgba(234, 88, 12, 0.95)",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.875rem",
            backdropFilter: "blur(10px)",
            maxWidth: "90%",
          }}
        />
      </div>

      <MapContainer
        center={position}
        zoom={hasLocation ? 15 : 6}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          subdomains="abcd"
          maxZoom={16}
        />

        {hasLocation && <FlyToLocation position={position} />}

        {hasLocation && (
          <Marker position={position} icon={locationMarkerIcon}>
            <Popup maxWidth={380} className="custom-foodmart-popup">
              <div className="flex flex-col gap-3 p-3">
                {item?.imageSrc && (
                  <div className="w-full h-48 overflow-hidden rounded-xl">
                    <img
                      src={item.imageSrc}
                      alt={item?.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {item?.foodMartCategory && (
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase rounded-full w-fit"
                      style={{
                        backgroundColor: "#fff7ed",
                        color: "#ea580c",
                        border: "1px solid #fed7aa",
                      }}
                    >
                      🍽️ {item.foodMartCategory}
                    </span>
                  )}

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "#111827",
                      lineHeight: 1.3,
                    }}
                  >
                    {item?.title}
                  </Typography>

                  {item?.description && (
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        color: "#4b5563",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      "{item.description}"
                    </Typography>
                  )}

                  {item?.address && (
                    <Typography sx={{ fontSize: "0.95rem", color: "#6b7280", lineHeight: 1.5 }}>
                      📍 {item.address}
                    </Typography>
                  )}

                  {item?.phoneNumber && (
                    <Typography sx={{ fontSize: "0.95rem", color: "#6b7280" }}>
                      📞 {item.phoneNumber}
                    </Typography>
                  )}

                  {formatBusinessHours(item?.busniessOpenPeriod, item?.busniessClosePeriod) && (
                    <Typography sx={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: 500 }}>
                      🕐 {formatBusinessHours(item.busniessOpenPeriod, item.busniessClosePeriod)}
                    </Typography>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <style jsx global>{`
        .custom-foodmart-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          padding: 0;
          overflow: hidden;
        }
        .custom-foodmart-popup .leaflet-popup-content {
          margin: 0;
          min-width: 320px;
          max-width: 380px;
        }
        .custom-foodmart-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .custom-foodmart-popup .leaflet-popup-close-button {
          font-size: 28px;
          font-weight: bold;
          color: #6b7280;
          padding: 8px 12px;
          transition: all 0.3s ease;
          z-index: 1;
        }
        .custom-foodmart-popup .leaflet-popup-close-button:hover {
          color: #ea580c;
          background-color: rgba(234, 88, 12, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default ImprovedFoodMartMapSingle;
