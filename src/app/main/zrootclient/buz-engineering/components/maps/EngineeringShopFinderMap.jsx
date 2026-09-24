import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography, Chip } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { formatDistance } from "../../utils/geo";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Orange drop-pin — repair shop, matching the platform's traditional brand
// orange (same family as Bookings' own map pin).
const shopMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Blue drop-pin — the customer's own location (kept distinct from the
// orange shop pins so the two are never confused on the map).
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
 * location (when known), auto-fitting bounds to all of them.
 *
 * Tile provider note (2026-09-24): this originally reused Bookings'/Real
 * Estate's CARTO Positron tile URL (basemaps.cartocdn.com), but live-testing
 * found CARTO now serves real "API KEY REQUIRED" watermark tiles and
 * intermittent 503s for anonymous/keyless traffic — confirmed via the
 * browser's own network tab, not guessed. This is a real, currently-live,
 * platform-wide regression (every map on this app uses the same CARTO URL),
 * not something specific to this page. Switched this map to Esri's "World
 * Light Gray Base" tiles instead — same clean, light aesthetic, genuinely
 * free with no API key or account required. Worth applying to every other
 * map on this app as a follow-up; out of scope to fix platform-wide here.
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
        zoom={allPositions.length > 0 ? 11 : 6}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        {/* Esri World Light Gray Base — free, no API key. See file-header note. */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
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
            <Popup maxWidth={340} className="engineering-shop-popup">
              <div className="flex flex-col gap-3 p-1">
                {shop.coverImage ? (
                  <div className="w-full h-40 overflow-hidden rounded-xl">
                    <img
                      src={shop.coverImage}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-40 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
                  >
                    <BuildIcon sx={{ fontSize: "2.5rem", color: "#ea580c" }} />
                  </div>
                )}

                <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#111827", lineHeight: 1.3 }}>
                  {shop.name}
                </Typography>

                {shop.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {shop.specialties.map((s) => (
                      <Chip key={s} label={s.replace(/_/g, " ")} size="small" sx={{ backgroundColor: "#fff7ed", color: "#ea580c", fontWeight: 600, fontSize: "0.7rem" }} />
                    ))}
                  </div>
                )}

                {[shop.ward, shop.lga, shop.state].filter(Boolean).length > 0 && (
                  <Typography sx={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    📍 {[shop.ward, shop.lga, shop.state].filter(Boolean).join(", ")}
                  </Typography>
                )}

                {shop.distanceKm != null && (
                  <div className="flex items-baseline gap-1 p-2 rounded-lg" style={{ backgroundColor: "#fff7ed" }}>
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#ea580c" }}>
                      {formatDistance(shop.distanceKm)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#6b7280" }}>away</Typography>
                  </div>
                )}

                <Typography
                  component={NavLinkAdapter}
                  to={`/engineering/shops/${shop.id}`}
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#ea580c",
                    textDecoration: "none",
                    marginTop: "4px",
                    padding: "8px 16px",
                    backgroundColor: "#fff7ed",
                    borderRadius: "8px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: "#ea580c", color: "white" },
                  }}
                >
                  View shop →
                </Typography>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Plain global <style> tag — this app has no styled-jsx transform,
          so the `jsx`/`global` boolean props some other maps in this repo
          copy onto this tag are invalid DOM attributes (confirmed via a
          real React console warning); a bare <style> works identically
          here since the CSS is just injected as plain text either way. */}
      <style>{`
        .engineering-shop-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          padding: 0;
          overflow: hidden;
        }
        .engineering-shop-popup .leaflet-popup-content {
          margin: 0;
          min-width: 300px;
          max-width: 340px;
        }
        .engineering-shop-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .engineering-shop-popup .leaflet-popup-close-button {
          font-size: 24px;
          font-weight: bold;
          color: #6b7280;
          padding: 6px 10px;
          transition: all 0.3s ease;
        }
        .engineering-shop-popup .leaflet-popup-close-button:hover {
          color: #ea580c;
          background-color: rgba(234, 88, 12, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default EngineeringShopFinderMap;
