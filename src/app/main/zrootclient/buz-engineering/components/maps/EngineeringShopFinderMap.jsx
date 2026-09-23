import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography, Chip } from "@mui/material";
import { formatDistance } from "../../utils/geo";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Teal drop-pin — repair shop (distinct from real estate's orange / booking's
// blue, so the engineering vertical reads as its own product area on sight).
const shopMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iIzBmNzY2ZSIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Blue drop-pin — the customer's own location.
const userMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iIzI1NjNFQiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
});

const NIGERIA_CENTER = [9.0765, 7.3986]; // Abuja — used only when nothing else is known yet

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
 * EngineeringShopFinderMap
 * Plots every repair shop with real coordinates plus the customer's own
 * location (when known), auto-fitting bounds to all of them — composes the
 * same two proven patterns already in this app: ImprovedRealEstateMap's
 * multi-pin bounds-fit and DeliveryRouteMap's user-location marker.
 */
function EngineeringShopFinderMap({ shops, userPosition, isPlaceholderLocation, selectedShopId, onSelectShop }) {
  const validShops = useMemo(
    () =>
      (shops || []).filter(
        (shop) => shop?.latitude != null && shop?.longitude != null && !Number.isNaN(shop.latitude) && !Number.isNaN(shop.longitude),
      ),
    [shops],
  );

  const shopPositions = useMemo(
    () => validShops.map((shop) => [parseFloat(shop.latitude), parseFloat(shop.longitude)]),
    [validShops],
  );

  const allPositions = userPosition ? [...shopPositions, userPosition] : shopPositions;

  const center = useMemo(() => {
    if (userPosition) return userPosition;
    if (shopPositions.length > 0) return shopPositions[0];
    return NIGERIA_CENTER;
  }, [userPosition, shopPositions]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-lg">
      <div
        className="absolute top-0 left-0 right-0 z-[1000] p-4"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)" }}
      >
        <Chip
          label={`${validShops.length} repair shop${validShops.length === 1 ? "" : "s"}`}
          sx={{
            backgroundColor: "rgba(15, 118, 110, 0.95)",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.875rem",
            backdropFilter: "blur(10px)",
          }}
        />
      </div>

      <MapContainer
        center={center}
        zoom={allPositions.length > 0 ? 11 : 6}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <MapBounds positions={allPositions} />

        {userPosition && (
          <Marker position={userPosition} icon={userMarkerIcon}>
            <Popup>
              <strong>{isPlaceholderLocation ? "Estimated location" : "Your location"}</strong>
            </Popup>
          </Marker>
        )}

        {validShops.map((shop) => (
          <Marker
            key={shop.id}
            position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
            icon={shopMarkerIcon}
            eventHandlers={{ click: () => onSelectShop?.(shop.id) }}
          >
            <Popup maxWidth={320} className="engineering-shop-popup">
              <div className="flex flex-col gap-2 p-1">
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>{shop.name}</Typography>

                {shop.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {shop.specialties.map((s) => (
                      <Chip key={s} label={s.replace(/_/g, " ")} size="small" sx={{ backgroundColor: "#f0fdfa", color: "#0f766e", fontWeight: 600, fontSize: "0.7rem" }} />
                    ))}
                  </div>
                )}

                {[shop.ward, shop.lga, shop.state].filter(Boolean).length > 0 && (
                  <Typography sx={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    {[shop.ward, shop.lga, shop.state].filter(Boolean).join(", ")}
                  </Typography>
                )}

                {shop.distanceKm != null && (
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f766e" }}>
                    {formatDistance(shop.distanceKm)} away
                  </Typography>
                )}

                <Typography
                  component={NavLinkAdapter}
                  to={`/engineering/shops/${shop.id}`}
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#0f766e",
                    textDecoration: "none",
                    marginTop: "4px",
                    padding: "6px 14px",
                    backgroundColor: "#f0fdfa",
                    borderRadius: "8px",
                    textAlign: "center",
                    "&:hover": { backgroundColor: "#0f766e", color: "white" },
                  }}
                >
                  View shop →
                </Typography>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default EngineeringShopFinderMap;
