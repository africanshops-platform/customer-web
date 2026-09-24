import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AppsIcon from "@mui/icons-material/Apps";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import useGetEngineeringShops from "app/configs/data/server-calls/engineering/useEngineeringShopsRepo";
import EngineeringShopFinderMap from "../components/maps/EngineeringShopFinderMap";
import { haversineKm, formatDistance } from "../utils/geo";

const ABUJA = [9.0765, 7.3986];

const SPECIALTIES = [
  { value: null, label: "All specialties", icon: AppsIcon },
  { value: "AUTOMOBILE", label: "Automobile", icon: DirectionsCarIcon },
  { value: "GENERATOR", label: "Generator", icon: ElectricBoltIcon },
  { value: "DIESEL_HEAVY_EQUIPMENT", label: "Diesel & Heavy Equipment", icon: LocalShippingIcon },
];

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

/**
 * ShopCard — richer, image-led card matching Bookings' own BookingCard
 * visual bar: real cover image (or a tasteful branded-illustration
 * fallback when a shop hasn't set one — never a bare gray box), a floating
 * distance badge, specialty chips, and a bold orange CTA with hover lift.
 */
function ShopCard({ shop, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative h-[180px] overflow-hidden">
        {shop.coverImage ? (
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
          >
            <BuildIcon sx={{ fontSize: "3rem", color: "#ea580c", opacity: 0.7 }} />
          </div>
        )}

        {shop.distanceKm != null && (
          <Chip
            label={`${formatDistance(shop.distanceKm)} away`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(255,255,255,0.95)",
              color: "#ea580c",
              fontWeight: 700,
              backdropFilter: "blur(6px)",
            }}
          />
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827", lineHeight: 1.35 }}>
          {shop.name}
        </Typography>

        {[shop.ward, shop.lga, shop.state].filter(Boolean).length > 0 && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1.5">
            <LocationOnIcon sx={{ fontSize: "0.95rem" }} />
            {[shop.ward, shop.lga, shop.state].filter(Boolean).join(", ")}
          </p>
        )}

        {shop.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {shop.specialties.map((s) => (
              <Chip key={s} label={s.replace(/_/g, " ")} size="small" sx={{ backgroundColor: "#fff7ed", color: "#ea580c", fontSize: "0.7rem", fontWeight: 600 }} />
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div
            className="w-full flex items-center justify-center gap-1.5 font-bold text-sm rounded-xl py-2.5 transition-all"
            style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}
          >
            View shop <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
          </div>
        </div>
      </div>
    </button>
  );
}

function ShopFinderHeader({ isPlaceholderLocation, locLoading, onToggleFilters, onToggleMap }) {
  return (
    <div
      className="w-full text-white py-10 px-6 sm:px-10"
      style={{ background: "linear-gradient(to bottom right, #ea580c, #9a3412)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {onToggleFilters && (
              <IconButton onClick={onToggleFilters} aria-label="toggle filters" sx={{ color: "white", ml: -1.5 }}>
                <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
              </IconButton>
            )}
            <BuildIcon sx={{ fontSize: "2rem" }} />
            <h1 className="text-2xl sm:text-3xl font-black">Find a Repair Shop Near You</h1>
          </div>
          <p className="text-orange-100 text-base max-w-2xl">
            Cars, generators, or heavy diesel equipment — find a nearby engineering shop, register
            your machine, and book a service.
          </p>
          {isPlaceholderLocation && !locLoading && (
            <div className="mt-3">
              <Chip
                icon={<MyLocationIcon sx={{ fontSize: "0.9rem" }} />}
                label="Showing shops around Abuja — enable location for results near you"
                size="small"
                sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", "& .MuiChip-icon": { color: "white" } }}
              />
            </div>
          )}
        </div>

        {onToggleMap && (
          <IconButton onClick={onToggleMap} aria-label="toggle map" sx={{ color: "white", flexShrink: 0 }}>
            <FuseSvgIcon>heroicons-outline:map</FuseSvgIcon>
          </IconButton>
        )}
      </div>
    </div>
  );
}

/**
 * ShopFinderFilterSidebar — the left column, mirroring Bookings' own
 * DemoSidebar/FilterList visual language exactly: h-screen wrapper, white
 * card with an orange gradient "Filter" header bar, options listed
 * vertically rather than as a horizontal chip row.
 */
function ShopFinderFilterSidebar({ selectedSpecialty, onSelectSpecialty }) {
  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{ background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)" }}
    >
      <div
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff5f0 50%, #ffedd5 100%)" }}
      >
        <div
          className="flex items-center gap-3 p-4"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
          }}
        >
          <FilterListIcon sx={{ color: "white", fontSize: "1.75rem" }} />
          <Typography sx={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
            Filter Shops
          </Typography>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", px: 1, pb: 0.5 }}>
            Specialty
          </Typography>
          {SPECIALTIES.map((opt) => {
            const Icon = opt.icon;
            const active = selectedSpecialty === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onSelectSpecialty(opt.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-semibold text-sm transition-all"
                style={{
                  backgroundColor: active ? "#ea580c" : "white",
                  color: active ? "white" : "#374151",
                  border: active ? "1px solid #ea580c" : "1px solid #e5e7eb",
                }}
              >
                <Icon sx={{ fontSize: "1.1rem" }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ShopFinderContent({ isLoading, isError, shops, onSelectShop }) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <CircularProgress sx={{ color: "#ea580c" }} />
      </div>
    );
  }

  if (isError) {
    return <p className="w-full text-center text-gray-500 py-24">Couldn&apos;t load repair shops right now. Please try again.</p>;
  }

  if (shops.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center py-24 px-6 text-center rounded-2xl"
        style={{ background: "linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)" }}
      >
        <DirectionsCarFilledIcon sx={{ fontSize: "3.5rem", color: "#fdba74" }} />
        <h2 className="text-lg font-bold text-gray-900 mt-4">No repair shops match that filter yet</h2>
        <p className="text-gray-500 mt-1 max-w-sm">Try a different specialty, or check back soon as more shops join the platform.</p>
      </div>
    );
  }

  return (
    <div className="w-full grid sm:grid-cols-2 gap-5 px-6 sm:px-10 py-8">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} onClick={() => onSelectShop(shop.id)} />
      ))}
    </div>
  );
}

/**
 * ShopFinderMapSidebar — mirrors Bookings' own DemoSidebarRight exactly
 * (h-screen wrapper, gradient header, flex-1 rounded map, footer strip),
 * orange-branded instead of blue, so the map genuinely takes the full
 * screen height the same way it does on the Bookings page.
 */
function ShopFinderMapSidebar({ shops, userPosition, isPlaceholderLocation, onSelectShop }) {
  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)" }}
    >
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
        }}
      >
        <MapOutlinedIcon sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
          Repair Shop Locations
        </Typography>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
        <EngineeringShopFinderMap
          shops={shops}
          userPosition={userPosition}
          isPlaceholderLocation={isPlaceholderLocation}
          onSelectShop={onSelectShop}
        />
      </div>

      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}>
          Click on a pin to view that shop&apos;s details
        </Typography>
      </div>
    </div>
  );
}

/**
 * ShopFinderPage — the top-level entry point into the Engineering Services
 * vertical (Phase E6b, redesigned 2026-09-24 onto Bookings' own 3-column
 * page shell: a real left FusePageSimpleSidebar for filters, the shop-card
 * grid as the center content — scrolling independently in its own column
 * via scroll="content" — and a real right FusePageSimpleSidebar holding
 * the map at genuine full screen height. Not a hand-rolled grid; the exact
 * same FusePageSimpleWithMargin shell Bookings/Real Estate already use.
 */
function ShopFinderPage() {
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [userPosition, setUserPosition] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [isPlaceholderLocation, setIsPlaceholderLocation] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

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

  const handleSelectShop = (id) => navigate(`/engineering/shops/${id}`);

  return (
    <Root
      header={
        <ShopFinderHeader
          isPlaceholderLocation={isPlaceholderLocation}
          locLoading={locLoading}
          onToggleFilters={isMobile ? () => setLeftSidebarOpen((v) => !v) : undefined}
          onToggleMap={isMobile ? () => setRightSidebarOpen((v) => !v) : undefined}
        />
      }
      content={
        <ShopFinderContent
          isLoading={isLoading || locLoading}
          isError={isError}
          shops={shops}
          onSelectShop={handleSelectShop}
        />
      }
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => setLeftSidebarOpen(false)}
      leftSidebarContent={
        <ShopFinderFilterSidebar selectedSpecialty={selectedSpecialty} onSelectSpecialty={setSelectedSpecialty} />
      }
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarContent={
        <ShopFinderMapSidebar
          shops={shops}
          userPosition={effectiveUserPosition}
          isPlaceholderLocation={isPlaceholderLocation}
          onSelectShop={handleSelectShop}
        />
      }
      scroll="content"
    />
  );
}

export default ShopFinderPage;
