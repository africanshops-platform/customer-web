import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chip, CircularProgress } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import useGetEngineeringShops from "app/configs/data/server-calls/engineering/useEngineeringShopsRepo";
import EngineeringShopFinderMap from "../components/maps/EngineeringShopFinderMap";
import { haversineKm, formatDistance } from "../utils/geo";

const ABUJA = [9.0765, 7.3986];

function ShopCard({ shop, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-teal-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>
          {[shop.ward, shop.lga, shop.state].filter(Boolean).length > 0 && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <LocationOnIcon sx={{ fontSize: "0.95rem" }} />
              {[shop.ward, shop.lga, shop.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        {shop.distanceKm != null && (
          <Chip
            label={`${formatDistance(shop.distanceKm)} away`}
            size="small"
            sx={{ backgroundColor: "#f0fdfa", color: "#0f766e", fontWeight: 700 }}
          />
        )}
      </div>

      {shop.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {shop.specialties.map((s) => (
            <Chip key={s} label={s.replace(/_/g, " ")} size="small" sx={{ backgroundColor: "#f9fafb", color: "#374151", fontSize: "0.7rem" }} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 text-teal-700 font-semibold text-sm">
        View shop <ArrowForwardIcon sx={{ fontSize: "0.95rem" }} />
      </div>
    </button>
  );
}

/**
 * ShopFinderPage — the new top-level entry point into the Engineering
 * Services vertical (Phase E6b). Captures the customer's location (browser
 * geolocation, same pattern as buz-foodmart's DeliveryRouteMap), fetches the
 * public shop directory, sorts by real distance, and lets the customer pick
 * a shop to view / eventually book with.
 */
function ShopFinderPage() {
  const navigate = useNavigate();
  const [userPosition, setUserPosition] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [isPlaceholderLocation, setIsPlaceholderLocation] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setIsPlaceholderLocation(true);
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocLoading(false);
      },
      () => {
        setIsPlaceholderLocation(true);
        setLocLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const effectiveUserPosition = userPosition ?? (isPlaceholderLocation ? ABUJA : null);

  const { data: shopsResp, isLoading, isError } = useGetEngineeringShops(selectedSpecialty);
  const rawShops = shopsResp?.data || [];

  const shops = useMemo(() => {
    const withDistance = rawShops.map((shop) => {
      const hasCoords = shop.latitude != null && shop.longitude != null;
      const distanceKm =
        hasCoords && effectiveUserPosition
          ? haversineKm(effectiveUserPosition[0], effectiveUserPosition[1], shop.latitude, shop.longitude)
          : null;
      return { ...shop, distanceKm };
    });

    return withDistance.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [rawShops, effectiveUserPosition]);

  const specialties = [
    { value: null, label: "All specialties" },
    { value: "AUTOMOBILE", label: "Automobile" },
    { value: "GENERATOR", label: "Generator" },
    { value: "DIESEL_HEAVY_EQUIPMENT", label: "Diesel & Heavy Equipment" },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header — inline gradient: this project's Tailwind build has no base
          reset for --tw-gradient-*-position, so bg-gradient-to-* utilities
          silently no-op (confirmed platform-wide, not new to this page). */}
      <div
        className="text-white py-14 px-6 md:px-12"
        style={{ background: "linear-gradient(to bottom right, #0f766e, #134e4a)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BuildIcon sx={{ fontSize: "2rem" }} />
            <h1 className="text-3xl md:text-4xl font-black">Find a Repair Shop Near You</h1>
          </div>
          <p className="text-teal-100 text-lg max-w-2xl">
            Cars, generators, or heavy diesel equipment — find a nearby engineering shop, register your
            machine, and book a service.
          </p>
          {isPlaceholderLocation && !locLoading && (
            <div className="mt-4">
              <Chip
                icon={<MyLocationIcon sx={{ fontSize: "0.9rem" }} />}
                label="Showing shops around Abuja — enable location for results near you"
                size="small"
                sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", "& .MuiChip-icon": { color: "white" } }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Specialty filter */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-6 flex flex-wrap gap-2">
        {specialties.map((opt) => (
          <Chip
            key={opt.label}
            label={opt.label}
            onClick={() => setSelectedSpecialty(opt.value)}
            sx={{
              backgroundColor: selectedSpecialty === opt.value ? "#0f766e" : "white",
              color: selectedSpecialty === opt.value ? "white" : "#374151",
              border: "1px solid #e5e7eb",
              fontWeight: 600,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* List + Map */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {(isLoading || locLoading) && (
            <div className="flex items-center justify-center py-16">
              <CircularProgress sx={{ color: "#0f766e" }} />
            </div>
          )}

          {isError && !isLoading && (
            <p className="text-center text-gray-500 py-16">Couldn&apos;t load repair shops right now. Please try again.</p>
          )}

          {!isLoading && !locLoading && !isError && shops.length === 0 && (
            <p className="text-center text-gray-500 py-16">No repair shops match that filter yet.</p>
          )}

          {!isLoading &&
            !locLoading &&
            shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onClick={() => navigate(`/engineering/shops/${shop.id}`)} />
            ))}
        </div>

        <div className="order-1 lg:order-2 h-[420px] lg:h-[640px] lg:sticky lg:top-6">
          <EngineeringShopFinderMap
            shops={shops}
            userPosition={effectiveUserPosition}
            isPlaceholderLocation={isPlaceholderLocation}
            onSelectShop={(id) => navigate(`/engineering/shops/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default ShopFinderPage;
