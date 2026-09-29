import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import NotesIcon from "@mui/icons-material/Notes";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useGetServiceBooking,
  useGetRepairJobForBooking,
  useCancelServiceBooking,
} from "app/configs/data/server-calls/engineering/useServiceBookingRepo";
import { useGetRegisteredMachine } from "app/configs/data/server-calls/engineering/useMyMachinesRepo";
import useGetEngineeringShop from "app/configs/data/server-calls/engineering/useEngineeringShopRepo";
import EngineeringShopFinderMap from "../components/maps/EngineeringShopFinderMap";

const STATUS_META = {
  REQUESTED: { label: "Requested", bg: "#fff7ed", fg: "#ea580c" },
  CONFIRMED: { label: "Confirmed", bg: "#eff6ff", fg: "#2563eb" },
  IN_PROGRESS: { label: "In Progress", bg: "#f5f3ff", fg: "#7c3aed" },
  COMPLETED: { label: "Completed", bg: "#f0fdf4", fg: "#16a34a" },
  CANCELLED: { label: "Cancelled", bg: "#f9fafb", fg: "#6b7280" },
};

const NON_TERMINAL = ["REQUESTED", "CONFIRMED", "IN_PROGRESS"];

const formatNaira = (kobo) => `₦${((kobo ?? 0) / 100).toLocaleString()}`;

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

function BookingDetailHeader({ booking, shop, onToggleFilters, onToggleMap }) {
  const navigate = useNavigate();
  const meta = STATUS_META[booking.status] || STATUS_META.REQUESTED;

  return (
    <div
      className="w-full text-white py-10 px-6 sm:px-10"
      style={{ background: "linear-gradient(to bottom right, #ea580c, #9a3412)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {onToggleFilters && (
            <IconButton onClick={onToggleFilters} aria-label="toggle booking summary" sx={{ color: "white", mt: -0.5, ml: -1.5 }}>
              <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
            </IconButton>
          )}
          <div>
            <button
              type="button"
              onClick={() => navigate("/engineering/my-bookings")}
              className="flex items-center gap-1 text-orange-100 hover:text-white mb-4 text-sm font-semibold"
            >
              <ArrowBackIcon sx={{ fontSize: "1rem" }} /> Back to my bookings
            </button>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <BuildIcon sx={{ fontSize: "1.75rem" }} />
              <h1 className="text-2xl sm:text-3xl font-black">{shop?.name || "Repair shop"}</h1>
              <Chip label={meta.label} sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }} />
            </div>
          </div>
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

function BookingSummarySidebar({ booking, machine }) {
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
          <BuildIcon sx={{ color: "white", fontSize: "1.75rem" }} />
          <Typography sx={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
            Booking Summary
          </Typography>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="px-3 py-3 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
              Machine
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">{machine?.nickname || "Unnamed machine"}</p>
          </div>

          <div className="px-3 py-3 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
              Service type
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {booking.serviceType?.charAt(0) + booking.serviceType?.slice(1).toLowerCase()}
            </p>
          </div>

          <div className="px-3 py-3 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
              <CalendarMonthIcon sx={{ fontSize: "1rem" }} /> Requested date
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(booking.requestedDate).toLocaleDateString()}</p>
          </div>

          <div className="px-3 py-3 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
              {booking.serviceLocationMode === "ON_SITE" ? <MyLocationIcon sx={{ fontSize: "1rem" }} /> : <StorefrontIcon sx={{ fontSize: "1rem" }} />} Location
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {booking.serviceLocationMode === "ON_SITE" ? "Shop comes to me" : "I bring it to the shop"}
            </p>
            {booking.siteAddress && <p className="text-xs text-gray-500 mt-1">{booking.siteAddress}</p>}
          </div>

          {booking.status === "CANCELLED" && booking.cancellationReason && (
            <div className="px-3 py-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide">
                <CancelOutlinedIcon sx={{ fontSize: "1rem" }} /> Cancelled
              </div>
              <p className="text-sm text-red-700 mt-1">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RepairJobSection({ repairJob }) {
  if (!repairJob) return null;
  const parts = Array.isArray(repairJob.partsUsed) ? repairJob.partsUsed : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <ReceiptLongIcon sx={{ fontSize: "1.15rem", color: "#ea580c" }} /> Service summary &amp; cost
      </h3>

      {repairJob.diagnosisNotes && (
        <p className="text-gray-600 text-sm mb-3"><span className="font-semibold">Diagnosis:</span> {repairJob.diagnosisNotes}</p>
      )}

      {parts.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {parts.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-700">{p.partName} {p.quantity > 1 ? `× ${p.quantity}` : ""}</span>
              <span className="font-semibold text-gray-900">{formatNaira((p.unitCostKobo || 0) * (p.quantity || 1))}</span>
            </div>
          ))}
        </div>
      )}

      {repairJob.laborCostKobo != null && (
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700">Labor</span>
          <span className="font-semibold text-gray-900">{formatNaira(repairJob.laborCostKobo)}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <span className="font-bold text-gray-900">Total</span>
        <span className="font-black text-xl" style={{ color: "#ea580c" }}>{formatNaira(repairJob.totalCostKobo)}</span>
      </div>
    </div>
  );
}

function BookingDetailMapSidebar({ pin, label }) {
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
          {label}
        </Typography>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
        {pin ? (
          <EngineeringShopFinderMap shops={[pin]} userPosition={null} />
        ) : (
          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-gray-400">
            No location set for this booking
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BookingDetailPage — Phase E6d. A customer's own single booking: full
 * summary, the real repair-job cost breakdown once a shop has logged one
 * (COMPLETED bookings only, null until then), and self-cancel for any
 * still-open booking. Same 3-column shell as the rest of the vertical; the
 * right sidebar map shows the shop's location for an AT_SHOP booking, or
 * the real captured breakdown location for an ON_SITE one -- genuinely
 * different data per booking, not decorative.
 */
function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!currentUser?.name) navigate("/sign-in");
  }, [currentUser?.name, navigate]);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const isAuthed = Boolean(currentUser?.name);
  const { data: bookingResp, isLoading, isError } = useGetServiceBooking(isAuthed ? id : undefined);
  const booking = bookingResp?.data;

  const { data: repairJobResp } = useGetRepairJobForBooking(booking?.status === "COMPLETED" ? id : undefined);
  const repairJob = repairJobResp?.data;

  const { data: machineResp } = useGetRegisteredMachine(booking?.machineId);
  const machine = machineResp?.data;

  const { data: shopResp } = useGetEngineeringShop(booking?.shopId);
  const shop = shopResp?.data;

  const { mutate: cancelBooking, isLoading: cancelling } = useCancelServiceBooking();

  if (!isAuthed) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <CircularProgress sx={{ color: "#ea580c" }} />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking not found</h2>
        <button type="button" onClick={() => navigate("/engineering/my-bookings")} className="text-orange-700 font-semibold">
          ← Back to my bookings
        </button>
      </div>
    );
  }

  const canCancel = NON_TERMINAL.includes(booking.status);
  const mapPin =
    booking.serviceLocationMode === "ON_SITE" && booking.siteLatitude != null
      ? { id: "site", name: booking.siteAddress || "Breakdown location", latitude: booking.siteLatitude, longitude: booking.siteLongitude }
      : shop && shop.latitude != null
        ? shop
        : null;

  const confirmCancel = () => {
    cancelBooking(
      { bookingId: booking.id, cancellationReason: cancelReason || "Cancelled by customer" },
      { onSuccess: () => { setCancelOpen(false); setCancelReason(""); } },
    );
  };

  return (
    <>
      <Root
        header={
          <BookingDetailHeader
            booking={booking}
            shop={shop}
            onToggleFilters={isMobile ? () => setLeftSidebarOpen((v) => !v) : undefined}
            onToggleMap={isMobile ? () => setRightSidebarOpen((v) => !v) : undefined}
          />
        }
        content={
          <div className="w-full max-w-2xl mx-auto px-6 sm:px-10 py-10 flex flex-col gap-5">
            {booking.customerNotes && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <NotesIcon sx={{ fontSize: "1.15rem", color: "#ea580c" }} /> Your notes
                </h3>
                <p className="text-gray-600">{booking.customerNotes}</p>
              </div>
            )}

            <RepairJobSection repairJob={repairJob} />

            {!booking.customerNotes && !repairJob && !canCancel && (
              <div className="text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
                <BuildIcon sx={{ fontSize: "2.5rem", color: "#d1d5db" }} />
                <p className="text-gray-500 mt-3">
                  {booking.status === "COMPLETED"
                    ? "This service is complete. The shop didn't log a detailed cost breakdown for it."
                    : "Nothing further to show for this booking yet."}
                </p>
              </div>
            )}

            {canCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setCancelOpen(true)}
                sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, py: 1.25 }}
              >
                Cancel booking
              </Button>
            )}
          </div>
        }
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarOnClose={() => setLeftSidebarOpen(false)}
        leftSidebarContent={<BookingSummarySidebar booking={booking} machine={machine} />}
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={() => setRightSidebarOpen(false)}
        rightSidebarContent={
          <BookingDetailMapSidebar
            pin={mapPin}
            label={booking.serviceLocationMode === "ON_SITE" ? "Breakdown Location" : "Shop Location"}
          />
        }
        scroll="content"
      />

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Cancel this booking?</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-2">
          <TextField
            label="Reason (optional)"
            fullWidth
            multiline
            minRows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}>Keep booking</Button>
          <Button variant="contained" color="error" onClick={confirmCancel} disabled={cancelling}>
            {cancelling ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Cancel booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookingDetailPage;
