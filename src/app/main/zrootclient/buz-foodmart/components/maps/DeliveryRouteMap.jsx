import { useEffect, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Typography, CircularProgress, Chip } from "@mui/material";
import { AccessTime, LocalShipping, LocationOn, MyLocation } from "@mui/icons-material";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Orange drop-pin — restaurant location
const restaurantMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Blue drop-pin — confirmed user location
const userMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iIzI1NjNFQiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
});

// Gray drop-pin — estimated/placeholder user location
const placeholderMarkerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iIzZCNzI4MCIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [26, 40],
  iconAnchor: [13, 40],
  popupAnchor: [0, -40],
});

// Abuja city center — ultimate fallback when restaurant has no coords either
const ABUJA = [9.0765, 7.3986];

// ~3km south offset in degrees latitude
const PLACEHOLDER_LAT_OFFSET = 0.027;

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [positions, map]);
  return null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcDeliveryFee(km) {
  // ₦500 base + ₦80/km, rounded to nearest ₦50
  return Math.round((500 + km * 80) / 50) * 50;
}

/**
 * DeliveryRouteMap
 * Shows the restaurant pin, the user's location pin, and a dashed polyline.
 * When geolocation is unavailable, a placeholder pin is derived ~3km south
 * of the restaurant so the route always renders — clearly labelled "Estimated".
 */
function DeliveryRouteMap({ restaurant }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setIsPlaceholder(true);
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocLoading(false);
      },
      () => {
        setIsPlaceholder(true);
        setLocLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const hasRestaurantLoc =
    restaurant?.latitude &&
    restaurant?.longitude &&
    !isNaN(restaurant.latitude) &&
    !isNaN(restaurant.longitude);

  const restaurantPos = hasRestaurantLoc
    ? [parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]
    : null;

  // Derive placeholder: ~3km south of restaurant, else Abuja
  const placeholderPos = useMemo(() => {
    if (restaurantPos) return [restaurantPos[0] - PLACEHOLDER_LAT_OFFSET, restaurantPos[1]];
    return ABUJA;
  }, [restaurantPos]);

  const effectiveUserPos = userLocation ?? (isPlaceholder ? placeholderPos : null);

  const routeStats = useMemo(() => {
    if (!restaurantPos || !effectiveUserPos) return null;
    const km = haversineKm(
      restaurantPos[0],
      restaurantPos[1],
      effectiveUserPos[0],
      effectiveUserPos[1],
    );
    const minutes = Math.round((km / 30) * 60) + 10;
    return {
      distanceLabel: km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`,
      minutes,
      fee: calcDeliveryFee(km).toLocaleString(),
    };
  }, [restaurantPos, effectiveUserPos]);

  const routePositions = restaurantPos && effectiveUserPos ? [restaurantPos, effectiveUserPos] : [];
  const mapCenter = restaurantPos ?? ABUJA;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 200 }}>

      {/* Geolocation loading overlay */}
      {locLoading && (
        <div className="absolute inset-0 z-[1001] flex flex-col items-center justify-center bg-orange-50/90 rounded-xl gap-2">
          <CircularProgress size={28} sx={{ color: "#ea580c" }} />
          <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 600 }}>
            Locating you…
          </Typography>
        </div>
      )}

      {/* Estimated-location badge — shown when using placeholder */}
      {isPlaceholder && !locLoading && (
        <div className="absolute top-3 left-3 z-[1000]">
          <Chip
            icon={<MyLocation sx={{ fontSize: "0.875rem" }} />}
            label="Estimated location · Enable GPS for accuracy"
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.92)",
              color: "#6b7280",
              fontSize: "0.68rem",
              fontWeight: 600,
              backdropFilter: "blur(8px)",
              border: "1px solid #e5e7eb",
              "& .MuiChip-icon": { color: "#6b7280" },
            }}
          />
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={restaurantPos ? 13 : 6}
        scrollWheelZoom={false}
        zoomControl={false}
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

        {routePositions.length >= 2 && <FitBounds positions={routePositions} />}

        {/* Restaurant marker */}
        {restaurantPos && (
          <Marker position={restaurantPos} icon={restaurantMarkerIcon}>
            <Popup>
              <strong>{restaurant?.title || "Restaurant"}</strong>
              {restaurant?.address && (
                <>
                  <br />
                  <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>{restaurant.address}</span>
                </>
              )}
            </Popup>
          </Marker>
        )}

        {/* User / placeholder marker */}
        {effectiveUserPos && (
          <Marker
            position={effectiveUserPos}
            icon={isPlaceholder ? placeholderMarkerIcon : userMarkerIcon}
          >
            <Popup>
              {isPlaceholder ? (
                <>
                  <strong>Estimated Location</strong>
                  <br />
                  <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    Enable GPS or save your address for an accurate delivery quote
                  </span>
                </>
              ) : (
                <strong>Your location</strong>
              )}
            </Popup>
          </Marker>
        )}

        {/* Dashed route polyline */}
        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: isPlaceholder ? "#9ca3af" : "#ea580c",
              weight: 3,
              dashArray: "8 8",
              opacity: isPlaceholder ? 0.6 : 0.85,
            }}
          />
        )}
      </MapContainer>

      {/* Stats bar — shown when both points are known */}
      {routeStats && !locLoading && (
        <div
          className="absolute bottom-0 left-0 right-0 z-[1000] flex justify-around items-center px-3 py-2"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-1">
            <LocationOn sx={{ color: "#ea580c", fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827" }}>
              {isPlaceholder ? "~" : ""}{routeStats.distanceLabel}
            </Typography>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1">
            <AccessTime sx={{ color: "#ea580c", fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827" }}>
              {isPlaceholder ? "~" : ""}~{routeStats.minutes} min
            </Typography>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1">
            <LocalShipping sx={{ color: "#ea580c", fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827" }}>
              {isPlaceholder ? "~" : ""}₦{routeStats.fee}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryRouteMap;
