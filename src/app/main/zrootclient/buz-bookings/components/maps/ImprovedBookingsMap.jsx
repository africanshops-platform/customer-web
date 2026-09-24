import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography, Chip } from "@mui/material";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";

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
 * MapBounds Component
 * Automatically adjusts map view to fit all markers
 */
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

/**
 * ImprovedBookingsMap Component
 * Enhanced map with better UX using Leaflet with custom tile layers
 */
function ImprovedBookingsMap({ items }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Calculate center and bounds from items
  const { center, positions } = useMemo(() => {
    if (!items || items.length === 0) {
      // Default center (Africa - Nigeria Lagos coordinates)
      return {
        center: [6.5244, 3.3792],
        positions: [],
      };
    }

    const validItems = items.filter(
      (item) =>
        item?.latitude && item?.longitude && !isNaN(item.latitude) && !isNaN(item.longitude),
    );

    if (validItems.length === 0) {
      return {
        center: [6.5244, 3.3792],
        positions: [],
      };
    }

    const positions = validItems.map((item) => [
      parseFloat(item.latitude),
      parseFloat(item.longitude),
    ]);

    // Calculate center as average of all positions
    const avgLat = positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length;
    const avgLng = positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length;

    return {
      center: [avgLat, avgLng],
      positions,
    };
  }, [items]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-lg">
      {/* Map Header Overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] p-4"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <Chip
            label={`${
              items?.filter(
                (item) =>
                  item?.latitude &&
                  item?.longitude &&
                  !isNaN(item.latitude) &&
                  !isNaN(item.longitude),
              ).length || 0
            } Properties`}
            sx={{
              backgroundColor: "rgba(234, 88, 12, 0.95)",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.875rem",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={positions.length > 0 ? 10 : 6}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        {/* Custom Tile Layer - Using CartoDB Positron for better aesthetics */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          subdomains="abcd"
          maxZoom={16}
        />

        {/* Alternative tile layers (uncomment to try different styles) */}
        {/*
        // Dark theme
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        // Standard OpenStreetMap
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        */}

        {/* Auto-fit bounds */}
        <MapBounds positions={positions} />

        {/* Markers */}
        {items
          ?.filter(
            (item) =>
              item?.latitude && item?.longitude && !isNaN(item.latitude) && !isNaN(item.longitude),
          )
          .map((item) => (
            <Marker
              key={item?._id || item?.id}
              position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
              icon={customIcon}
              eventHandlers={{
                click: () => setSelectedProperty(item?._id || item?.id),
              }}
            >
              <Popup
                maxWidth={380}
                className="custom-popup"
                onClose={() => setSelectedProperty(null)}
              >
                <div className="flex flex-col gap-4 p-3">
                  {/* Property Image */}
                  {item?.imageSrcs?.[0]?.url && (
                    <div className="w-full h-96 overflow-hidden rounded-xl">
                      <img
                        src={item.imageSrcs[0].url}
                        alt={item?.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        style={{
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  )}

                  {/* Property Details */}
                  <div className="flex flex-col gap-3">
                    <Typography
                      component={NavLinkAdapter}
                      to={`/bookings/listings/${item?.slug}/view`}
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.375rem",
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

                    {item?.address && (
                      <Typography
                        sx={{
                          fontSize: "1.125rem",
                          color: "#6b7280",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        📍 {item.address}
                      </Typography>
                    )}

                    {item?.roomCount && (
                      <Typography
                        sx={{
                          fontSize: "1.125rem",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        🛏️ {item.roomCount} {item.roomCount === 1 ? "Bedroom" : "Bedrooms"}
                      </Typography>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2 p-3 bg-orange-50 rounded-lg">
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.625rem",
                          color: "#ea580c",
                        }}
                      >
                        ₦{formatCurrency(item?.price)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1.125rem",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        /night
                      </Typography>
                    </div>

                    {/* View Details Link */}
                    <Typography
                      component={NavLinkAdapter}
                      to={`/bookings/listings/${item?.slug}/view`}
                      sx={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "#ea580c",
                        textDecoration: "none",
                        marginTop: "8px",
                        padding: "8px 16px",
                        backgroundColor: "#fff7ed",
                        borderRadius: "8px",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#ea580c",
                          color: "white",
                          textDecoration: "none",
                        },
                      }}
                    >
                      View Details →
                    </Typography>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          padding: 0;
          overflow: hidden;
        }

        .custom-popup .leaflet-popup-content {
          margin: 0;
          min-width: 340px;
          max-width: 380px;
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .custom-popup .leaflet-popup-close-button {
          font-size: 28px;
          font-weight: bold;
          color: #6b7280;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }

        .custom-popup .leaflet-popup-close-button:hover {
          color: #ea580c;
          background-color: rgba(234, 88, 12, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default ImprovedBookingsMap;
