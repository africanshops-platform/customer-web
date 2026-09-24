import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import FilterListIcon from "@mui/icons-material/FilterList";
import UpcomingOutlinedIcon from "@mui/icons-material/UpcomingOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useGetMyServiceBookings } from "app/configs/data/server-calls/engineering/useServiceBookingRepo";
import { useGetMyRegisteredMachines } from "app/configs/data/server-calls/engineering/useMyMachinesRepo";
import useGetEngineeringShops from "app/configs/data/server-calls/engineering/useEngineeringShopsRepo";

const STATUS_META = {
  REQUESTED: { label: "Requested", bg: "#fff7ed", fg: "#ea580c" },
  CONFIRMED: { label: "Confirmed", bg: "#eff6ff", fg: "#2563eb" },
  IN_PROGRESS: { label: "In Progress", bg: "#f5f3ff", fg: "#7c3aed" },
  COMPLETED: { label: "Completed", bg: "#f0fdf4", fg: "#16a34a" },
  CANCELLED: { label: "Cancelled", bg: "#f9fafb", fg: "#6b7280" },
};

const FILTERS = [
  { value: null, label: "All bookings" },
  { value: "REQUESTED", label: "Requested" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const NON_TERMINAL = ["REQUESTED", "CONFIRMED", "IN_PROGRESS"];

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

function BookingCard({ booking, shop, machine, onClick }) {
  const meta = STATUS_META[booking.status] || STATUS_META.REQUESTED;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>
            {shop?.name || "Repair shop"}
          </Typography>
          <p className="text-sm text-gray-500 mt-0.5">{machine?.nickname || "Unnamed machine"}</p>
        </div>
        <Chip label={meta.label} size="small" sx={{ backgroundColor: meta.bg, color: meta.fg, fontWeight: 700, flexShrink: 0 }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          label={booking.serviceType?.charAt(0) + booking.serviceType?.slice(1).toLowerCase()}
          size="small"
          sx={{ backgroundColor: "#f9fafb", color: "#374151", fontSize: "0.7rem" }}
        />
        <Chip
          icon={booking.serviceLocationMode === "ON_SITE" ? <MyLocationIcon sx={{ fontSize: "0.85rem !important" }} /> : <StorefrontIcon sx={{ fontSize: "0.85rem !important" }} />}
          label={booking.serviceLocationMode === "ON_SITE" ? "Shop comes to me" : "At the shop"}
          size="small"
          sx={{ backgroundColor: "#f9fafb", color: "#374151", fontSize: "0.7rem" }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <CalendarMonthIcon sx={{ fontSize: "0.95rem" }} />
          {new Date(booking.requestedDate).toLocaleDateString()}
        </p>
        <span className="flex items-center gap-1 font-bold text-sm" style={{ color: "#ea580c" }}>
          View details <ArrowForwardIcon sx={{ fontSize: "0.9rem" }} />
        </span>
      </div>
    </button>
  );
}

function MyBookingsHeader({ onToggleFilters, onToggleUpcoming }) {
  return (
    <div
      className="w-full text-white py-10 px-6 sm:px-10"
      style={{ background: "linear-gradient(to bottom right, #ea580c, #9a3412)" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {onToggleFilters && (
            <IconButton onClick={onToggleFilters} aria-label="toggle filters" sx={{ color: "white", ml: -1.5 }}>
              <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
            </IconButton>
          )}
          <BuildIcon sx={{ fontSize: "1.75rem" }} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Bookings</h1>
            <p className="text-orange-100 text-sm mt-1">Every service you've requested, past and upcoming</p>
          </div>
        </div>
        {onToggleUpcoming && (
          <IconButton onClick={onToggleUpcoming} aria-label="toggle upcoming" sx={{ color: "white" }}>
            <UpcomingOutlinedIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function MyBookingsFilterSidebar({ selectedStatus, onSelectStatus, counts }) {
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
            Filter Bookings
          </Typography>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", px: 1, pb: 0.5 }}>
            Status
          </Typography>
          {FILTERS.map((opt) => {
            const active = selectedStatus === opt.value;
            const count = opt.value ? counts[opt.value] || 0 : counts.__all || 0;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onSelectStatus(opt.value)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-sm transition-all"
                style={{
                  backgroundColor: active ? "#ea580c" : "white",
                  color: active ? "white" : "#374151",
                  border: active ? "1px solid #ea580c" : "1px solid #e5e7eb",
                }}
              >
                {opt.label}
                <span
                  className="text-xs font-bold rounded-full px-2 py-0.5"
                  style={{ backgroundColor: active ? "rgba(255,255,255,0.25)" : "#f3f4f6", color: active ? "white" : "#6b7280" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MyBookingsUpcomingSidebar({ bookings, shopsById, machinesById }) {
  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => NON_TERMINAL.includes(b.status))
        .sort((a, b) => new Date(a.requestedDate) - new Date(b.requestedDate)),
    [bookings],
  );

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
        <UpcomingOutlinedIcon sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
          Upcoming
        </Typography>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-white overflow-y-auto">
        {upcoming.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <EventBusyIcon sx={{ fontSize: "3rem", color: "#fdba74" }} />
            <p className="font-bold text-gray-900 mt-3">Nothing upcoming</p>
            <p className="text-sm text-gray-500 mt-1">Bookings you request will show up here until a shop completes them.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.map((b) => {
              const meta = STATUS_META[b.status] || STATUS_META.REQUESTED;
              return (
                <div key={b.id} className="p-4">
                  <p className="font-bold text-gray-900 text-sm">{shopsById[b.shopId]?.name || "Repair shop"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{machinesById[b.machineId]?.nickname || "Unnamed machine"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip label={meta.label} size="small" sx={{ backgroundColor: meta.bg, color: meta.fg, fontWeight: 700, fontSize: "0.65rem" }} />
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarMonthIcon sx={{ fontSize: "0.85rem" }} />
                      {new Date(b.requestedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MyBookingsPage — "My Bookings" hub (Phase E6d). Every real booking the
 * customer has made across every shop, filterable by status, with a real
 * "Upcoming" sidebar (bookings still in a non-terminal state, soonest
 * first). Same FusePageSimpleWithMargin 3-column shell as the rest of the
 * Engineering vertical (ShopFinderPage/MyMachinesPage) for layout
 * consistency. Shop names and machine nicknames aren't embedded in the raw
 * booking rows, so this cross-references the same public shop directory
 * (useGetEngineeringShops) and the customer's own machines
 * (useGetMyRegisteredMachines) already used elsewhere in this vertical,
 * rather than firing one request per booking.
 */
function MyBookingsPage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (!currentUser?.name) navigate("/sign-in");
  }, [currentUser?.name, navigate]);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const isAuthed = Boolean(currentUser?.name);
  const { data: bookingsResp, isLoading, isError } = useGetMyServiceBookings(isAuthed);
  const allBookings = bookingsResp?.data ?? [];

  const { data: machinesResp } = useGetMyRegisteredMachines(isAuthed);
  const machines = machinesResp?.data ?? [];
  const machinesById = useMemo(() => Object.fromEntries(machines.map((m) => [m.id, m])), [machines]);

  const { data: shopsResp } = useGetEngineeringShops();
  const shops = shopsResp?.data ?? [];
  const shopsById = useMemo(() => Object.fromEntries(shops.map((s) => [s.id, s])), [shops]);

  const counts = useMemo(() => {
    const c = { __all: allBookings.length };
    allBookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [allBookings]);

  const bookings = useMemo(
    () =>
      (selectedStatus ? allBookings.filter((b) => b.status === selectedStatus) : allBookings)
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [allBookings, selectedStatus],
  );

  if (!isAuthed) return null;

  return (
    <Root
      header={
        <MyBookingsHeader
          onToggleFilters={isMobile ? () => setLeftSidebarOpen((v) => !v) : undefined}
          onToggleUpcoming={isMobile ? () => setRightSidebarOpen((v) => !v) : undefined}
        />
      }
      content={
        <div className="w-full px-6 sm:px-10 py-8">
          {isLoading && (
            <div className="flex justify-center py-24">
              <CircularProgress sx={{ color: "#ea580c" }} />
            </div>
          )}

          {isError && (
            <p className="text-center text-gray-500 py-24">Couldn't load your bookings. Please try again.</p>
          )}

          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-center py-24 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
              <DirectionsCarFilledIcon sx={{ fontSize: "3rem", color: "#d1d5db" }} />
              <h2 className="text-lg font-bold text-gray-900 mt-3">
                {allBookings.length === 0 ? "No bookings yet" : "No bookings match that filter"}
              </h2>
              <p className="text-gray-500 mt-1 mb-6">
                {allBookings.length === 0
                  ? "Find a repair shop and book a service to see it here."
                  : "Try a different status filter."}
              </p>
              {allBookings.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/engineering/find-shops")}
                  className="font-bold text-sm px-5 py-2.5 rounded-xl text-white"
                  style={{ backgroundColor: "#ea580c" }}
                >
                  Find a repair shop
                </button>
              )}
            </div>
          )}

          {bookings.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  shop={shopsById[b.shopId]}
                  machine={machinesById[b.machineId]}
                  onClick={() => navigate(`/engineering/my-bookings/${b.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      }
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => setLeftSidebarOpen(false)}
      leftSidebarContent={
        <MyBookingsFilterSidebar selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} counts={counts} />
      }
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarContent={
        <MyBookingsUpcomingSidebar bookings={allBookings} shopsById={shopsById} machinesById={machinesById} />
      }
      scroll="content"
    />
  );
}

export default MyBookingsPage;
