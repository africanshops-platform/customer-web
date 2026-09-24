import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography, Chip } from "@mui/material";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const restaurantMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

function MapBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [positions, map]);
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

function ImprovedFoodMartMap({ items }) {
  const [selectedMart, setSelectedMart] = useState(null);

  const { center, positions } = useMemo(() => {
    if (!items || items.length === 0) {
      return { center: [9.0765, 7.3986], positions: [] };
    }
    const validItems = items.filter(
      (item) =>
        item?.latitude && item?.longitude && !isNaN(item.latitude) && !isNaN(item.longitude),
    );
    if (validItems.length === 0) {
      return { center: [9.0765, 7.3986], positions: [] };
    }
    const positions = validItems.map((item) => [
      parseFloat(item.latitude),
      parseFloat(item.longitude),
    ]);
    const avgLat = positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length;
    const avgLng = positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length;
    return { center: [avgLat, avgLng], positions };
  }, [items]);

  const visibleCount = items?.filter(
    (item) =>
      item?.latitude && item?.longitude && !isNaN(item.latitude) && !isNaN(item.longitude),
  ).length || 0;

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
          label={`${visibleCount} ${visibleCount === 1 ? "Restaurant" : "Restaurants"} on map`}
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
        center={center}
        zoom={positions.length > 0 ? 10 : 6}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
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

        <MapBounds positions={positions} />

        {items
          ?.filter(
            (item) =>
              item?.latitude &&
              item?.longitude &&
              !isNaN(item.latitude) &&
              !isNaN(item.longitude),
          )
          .map((item) => (
            <Marker
              key={item?._id || item?.id}
              position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
              icon={restaurantMarkerIcon}
              eventHandlers={{
                click: () => setSelectedMart(item?._id || item?.id),
              }}
            >
              <Popup
                maxWidth={380}
                className="custom-foodmart-popup"
                onClose={() => setSelectedMart(null)}
              >
                <div className="flex flex-col gap-3 p-3">
                  {/* Restaurant Image */}
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
                    {/* Category Badge */}
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

                    {/* Title */}
                    <Typography
                      component={NavLinkAdapter}
                      to={`/foodmarts/${item?.slug}/visit-mart/${item?.slug}`}
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#111827",
                        textDecoration: "none",
                        lineHeight: 1.3,
                        "&:hover": {
                          color: "#ea580c",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {item?.title}
                    </Typography>

                    {/* Description */}
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

                    {/* Address */}
                    {item?.address && (
                      <Typography sx={{ fontSize: "0.95rem", color: "#6b7280", lineHeight: 1.5 }}>
                        📍 {item.address}
                      </Typography>
                    )}

                    {/* Phone */}
                    {item?.phoneNumber && (
                      <Typography sx={{ fontSize: "0.95rem", color: "#6b7280" }}>
                        📞 {item.phoneNumber}
                      </Typography>
                    )}

                    {/* Hours */}
                    {formatBusinessHours(item?.busniessOpenPeriod, item?.busniessClosePeriod) && (
                      <Typography sx={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: 500 }}>
                        🕐{" "}
                        {formatBusinessHours(item.busniessOpenPeriod, item.busniessClosePeriod)}
                      </Typography>
                    )}

                    {/* CTA */}
                    <Typography
                      component={NavLinkAdapter}
                      to={`/foodmarts/${item?.slug}/visit-mart/${item?.slug}`}
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#ea580c",
                        textDecoration: "none",
                        marginTop: "6px",
                        padding: "8px 16px",
                        backgroundColor: "#fff7ed",
                        borderRadius: "8px",
                        textAlign: "center",
                        display: "block",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#ea580c",
                          color: "white",
                          textDecoration: "none",
                        },
                      }}
                    >
                      Visit Restaurant →
                    </Typography>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
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

export default ImprovedFoodMartMap;
