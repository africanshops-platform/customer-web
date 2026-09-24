import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chip, CircularProgress, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GarageIcon from "@mui/icons-material/Garage";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import useGetEngineeringShop from "app/configs/data/server-calls/engineering/useEngineeringShopRepo";
import EngineeringShopFinderMap from "../components/maps/EngineeringShopFinderMap";
import BookServiceDialog from "../booking/BookServiceDialog";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

function ShopDetailHeader({ shop, onToggleMap }) {
  const navigate = useNavigate();
  const locationLine = [shop.ward, shop.lga, shop.state, shop.country].filter(Boolean).join(", ");

  return (
    <div
      className="relative text-white overflow-hidden w-full"
      style={
        shop.coverImage
          ? { backgroundImage: `url(${shop.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: "linear-gradient(to bottom right, #ea580c, #9a3412)" }
      }
    >
      {shop.coverImage && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom right, rgba(234,88,12,0.88), rgba(154,52,18,0.88))" }}
        />
      )}
      {!shop.coverImage && (
        <BuildIcon sx={{ position: "absolute", right: -20, bottom: -30, fontSize: "12rem", color: "rgba(255,255,255,0.08)" }} />
      )}

      <div className="relative py-10 px-6 sm:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/engineering/find-shops")}
              className="flex items-center gap-1 text-orange-100 hover:text-white mb-4 text-sm font-semibold"
            >
              <ArrowBackIcon sx={{ fontSize: "1rem" }} /> Back to shop finder
            </button>
            <div className="flex items-center gap-3 mb-2">
              <BuildIcon sx={{ fontSize: "1.75rem" }} />
              <h1 className="text-2xl sm:text-3xl font-black">{shop.name}</h1>
            </div>
            {locationLine && (
              <p className="text-orange-100 flex items-center gap-1.5 mt-1">
                <LocationOnIcon sx={{ fontSize: "1.05rem" }} />
                {locationLine}
              </p>
            )}
            {shop.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {shop.specialties.map((s) => (
                  <Chip
                    key={s}
                    label={s.replace(/_/g, " ")}
                    sx={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 600, backdropFilter: "blur(6px)" }}
                  />
                ))}
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
    </div>
  );
}

function ShopDetailContent({ shop, onBookService }) {
  return (
    <div className="w-full max-w-2xl px-6 sm:px-10 py-8 flex flex-col gap-5">
      {shop.description && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <InfoOutlinedIcon sx={{ fontSize: "1.15rem", color: "#ea580c" }} /> About this shop
          </h3>
          <p className="text-gray-600">{shop.description}</p>
        </div>
      )}

      {shop.bays != null && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <GarageIcon sx={{ fontSize: "1.15rem", color: "#ea580c" }} /> Service bays
          </h3>
          <p className="text-2xl font-black" style={{ color: "#ea580c" }}>{shop.bays}</p>
        </div>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<CalendarMonthIcon />}
        onClick={onBookService}
        sx={{
          backgroundColor: "#ea580c",
          fontWeight: 700,
          fontSize: "1.05rem",
          py: 1.75,
          borderRadius: "12px",
          textTransform: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#c2410c",
            transform: "translateY(-2px)",
            boxShadow: "0 10px 20px rgba(234, 88, 12, 0.3)",
          },
        }}
      >
        Book a Service
      </Button>
    </div>
  );
}

/**
 * ShopDetailMapSidebar — same full-screen-height, gradient-header sidebar
 * shell as ShopFinderMapSidebar (and Bookings' own DemoSidebarRight),
 * scoped to this one shop's pin instead of the whole directory.
 */
function ShopDetailMapSidebar({ shop }) {
  const hasCoords = shop.latitude != null && shop.longitude != null;

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
          Shop Location
        </Typography>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
        {hasCoords ? (
          <EngineeringShopFinderMap shops={[shop]} userPosition={null} />
        ) : (
          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-gray-400">
            Location not set for this shop yet
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}>
          {shop.name}
        </Typography>
      </div>
    </div>
  );
}

/**
 * ShopDetailPage — real shop info reached from the map/list finder
 * (Phase E6b). Registering a machine and booking a service against this
 * shop happens via BookServiceDialog (Phase E6c) — browsing stays public,
 * the booking action itself is auth-gated (same "public browse, gated
 * interact" pattern used across the rest of this app). Redesigned
 * 2026-09-24 onto the same FusePageSimpleWithMargin shell as
 * ShopFinderPage/Bookings, so this page's layout is genuinely consistent
 * with the rest of the app, not a one-off grid.
 */
function ShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: shopResp, isLoading, isError } = useGetEngineeringShop(id);
  const shop = shopResp?.data;

  useEffect(() => {
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleBookService = () => {
    if (!currentUser?.name) {
      navigate("/sign-in");
      return;
    }
    setBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <CircularProgress sx={{ color: "#ea580c" }} />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop not found</h2>
        <p className="text-gray-500 mb-6">This repair shop may have been removed.</p>
        <button
          type="button"
          onClick={() => navigate("/engineering/find-shops")}
          className="text-orange-700 font-semibold"
        >
          ← Back to shop finder
        </button>
      </div>
    );
  }

  return (
    <>
      <Root
        header={<ShopDetailHeader shop={shop} onToggleMap={isMobile ? () => setRightSidebarOpen((v) => !v) : undefined} />}
        content={<ShopDetailContent shop={shop} onBookService={handleBookService} />}
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={() => setRightSidebarOpen(false)}
        rightSidebarContent={<ShopDetailMapSidebar shop={shop} />}
        scroll="content"
      />

      <BookServiceDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        shopId={shop.id}
        shopName={shop.name}
      />
    </>
  );
}

export default ShopDetailPage;
