import { motion, AnimatePresence } from "framer-motion";
import SealedDetailDrawer, { ngn, shortDate as sd } from "app/shared-components/sealed/SealedDetailDrawer";
import { useState } from "react";
import { CircularProgress, Typography, Button } from "@mui/material";
import { CheckCircle, Cancel, CalendarToday, EventAvailable, Refresh } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import { useRequestRefundForUserCancelledReservation } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";

/**
 * DemoContent Component
 * Beautiful and professional reservation listings with orange gradient branding
 */
function DemoContent(props) {
  const { isLoading, isError, reservations, cancelledReservations, sealedReservations } = props;
  const [activeTab, setActiveTab] = useState("active");
  const [selectedSealed, setSelectedSealed] = useState(null);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-auto h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <CircularProgress size={60} thickness={4} sx={{ color: "#ea580c" }} />
          <Typography
            variant="h6"
            className="font-semibold"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Loading your reservations...
          </Typography>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retrieving reservations"} />
      </motion.div>
    );
  }

  // Empty State
  if (!reservations || (reservations.length === 0 && cancelledReservations?.length === 0 && !sealedReservations?.length)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col flex-1 items-center justify-center h-full p-8"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)",
          }}
        >
          <CalendarToday sx={{ fontSize: "2.5rem", color: "#ea580c" }} />
        </div>
        <Typography variant="h5" className="font-bold text-gray-800 mb-2">
          No Reservations Yet
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 text-center max-w-md">
          Start exploring our beautiful properties and create your first reservation
        </Typography>
        <Button
          variant="contained"
          component={NavLinkAdapter}
          to="/bookings/listings"
          sx={{
            textTransform: "none",
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            px: 4,
            py: 1.5,
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
            },
          }}
        >
          Browse Properties
        </Button>
      </motion.div>
    );
  }

  const activeReservations = reservations || [];
  const cancelledList = cancelledReservations || [];
  const sealedList = sealedReservations || [];

  return (
    <div className="flex-auto h-full overflow-hidden flex flex-col">
      <div className="p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
          <p className="text-gray-600">Manage your bookings and track your stays</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "active"
                ? "text-white shadow-lg"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
            style={
              activeTab === "active"
                ? {
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  }
                : {}
            }
          >
            <div className="flex items-center gap-2">
              <EventAvailable sx={{ fontSize: "1.25rem" }} />
              <span>Active Reservations</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {activeReservations.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "cancelled"
                ? "text-white shadow-lg"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
            style={
              activeTab === "cancelled"
                ? {
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  }
                : {}
            }
          >
            <div className="flex items-center gap-2">
              <Cancel sx={{ fontSize: "1.25rem" }} />
              <span>Cancelled</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {cancelledList.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "history" ? "text-white shadow-lg" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
            style={activeTab === "history" ? { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" } : {}}
          >
            <div className="flex items-center gap-2">
              <EventAvailable sx={{ fontSize: "1.25rem" }} />
              <span>History</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">{sealedList.length}</span>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8">
        <AnimatePresence mode="wait">
          {activeTab === "active" && <ActiveReservationsList reservations={activeReservations} />}
          {activeTab === "cancelled" && (
            <CancelledReservationsList cancelledReservations={cancelledList} />
          )}
          {activeTab === "history" && (
            <div className="space-y-3" data-testid="reservation-history">
              {sealedList.length === 0 ? (
                <p className="text-gray-600 text-center py-16">
                  Finished stays appear here once the host has been paid out.
                </p>
              ) : (
                sealedList.map((row) => {
                  const r = row.sealedBookedReservation || {};
                  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
                  return (
                    <div
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSealed(row)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedSealed(row)}
                      className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{r.paymentdatas?.bookingName || "Reservation"}</p>
                        <p className="text-sm text-gray-500">
                          {fmt(r.startDate)} – {fmt(r.endDate)}
                          {r.totalPrice != null ? ` · ₦${Number(r.totalPrice).toLocaleString("en-NG")}` : ""}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}
                      >
                        Completed · Settled
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </AnimatePresence>
        <SealedDetailDrawer
          open={Boolean(selectedSealed)}
          onClose={() => setSelectedSealed(null)}
          detail={
            selectedSealed
              ? (() => {
                  const r = selectedSealed.sealedBookedReservation || {};
                  return {
                    title: r.paymentdatas?.bookingName || "Reservation",
                    subtitle: `${sd(r.startDate)} – ${sd(r.endDate)}`,
                    headline: { label: "You paid", value: r.totalPrice != null ? ngn(r.totalPrice) : "" },
                    timeline: [
                      { label: "Booked and paid", date: sd(r.PaidAt || r.createdAt) },
                      { label: "Checked in", date: sd(r.checkedInAt) },
                      { label: "Checked out", date: sd(r.checkedOutAt) },
                    ],
                    sections: [
                      {
                        title: "Your stay",
                        rows: [
                          { label: "Check-in", value: sd(r.startDate) },
                          { label: "Check-out", value: sd(r.endDate) },
                          { label: "Address", value: r.paymentdatas?.bookingAddress },
                        ],
                      },
                      {
                        title: "Payment",
                        rows: [
                          { label: "Method", value: r.paymentdatas?.paymentMethod },
                          { label: "Reference", value: r.paymentResult?.reference },
                          { label: "Tax", value: r.taxPrice ? ngn(r.taxPrice) : null },
                          { label: "Total", value: r.totalPrice != null ? ngn(r.totalPrice) : null, strong: true },
                        ],
                      },
                    ],
                    note: "A finished stay. This record is read-only.",
                  };
                })()
              : null
          }
        />
      </div>
    </div>
  );
}

/**
 * Active Reservations List Component
 */
function ActiveReservationsList({ reservations }) {
  if (reservations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Typography variant="h6" className="text-gray-600">
          No active reservations
        </Typography>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-4"
    >
      {reservations.map((reservation, index) => (
        <motion.div
          key={reservation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Section - Details */}
              <div className="flex-1">
                {/* Status Badge */}
                <div className="mb-4">
                  {reservation.isPaid ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                      <CheckCircle sx={{ fontSize: "1rem" }} />
                      Confirmed
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                      <Cancel sx={{ fontSize: "1rem" }} />
                      Payment Pending
                    </div>
                  )}
                </div>

                {/* Property Info */}
                {reservation.bookingPropertyName && (
                  <div className="mb-4">
                    <p className="text-base font-semibold text-gray-900">{reservation.bookingPropertyName}</p>
                    {reservation.bookingPropertyAddress && (
                      <p className="text-sm text-gray-500">{reservation.bookingPropertyAddress}</p>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Total Price</span>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{formatCurrency(reservation.totalPrice)}
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarToday sx={{ fontSize: "1rem", color: "#ea580c" }} />
                    <span className="text-sm font-medium">Check-in:</span>
                    <span className="text-sm">
                      {new Date(reservation.startDate).toDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarToday sx={{ fontSize: "1rem", color: "#ea580c" }} />
                    <span className="text-sm font-medium">Check-out:</span>
                    <span className="text-sm">{new Date(reservation.endDate).toDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex flex-col justify-center gap-3 md:min-w-[180px]">
                {reservation.isPaid ? (
                  <Button
                    variant="contained"
                    component={NavLinkAdapter}
                    to={`/bookings/${reservation.id}/reservation-detail`}
                    sx={{
                      textTransform: "none",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                        boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                      },
                    }}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    component={NavLinkAdapter}
                    to={`/bookings/reservation/review/${reservation.id}`}
                    sx={{
                      textTransform: "none",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                        boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                      },
                    }}
                  >
                    Complete Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Cancelled Reservations List Component
 */
function CancelledReservationsList({ cancelledReservations }) {
  const requestReservation = useRequestRefundForUserCancelledReservation();

  const requestRefund = (cancelledReservationId) => {
    if (window.confirm("Are you sure you want to request a refund?")) {
      requestReservation.mutate(cancelledReservationId);
    }
  };

  if (cancelledReservations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Typography variant="h6" className="text-gray-600">
          No cancelled reservations
        </Typography>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-4"
    >
      {cancelledReservations.map((item, index) => {
        const reservation = item.cancelledBookedReservation;
        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-red-100"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Section - Details */}
                <div className="flex-1">
                  {/* Cancelled Badge */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                      <Cancel sx={{ fontSize: "1rem" }} />
                      Cancelled
                    </div>
                  </div>

                  {/* Property Info */}
                  {reservation?.bookingPropertyName && (
                    <div className="mb-4">
                      <p className="text-base font-semibold text-gray-900">{reservation.bookingPropertyName}</p>
                      {reservation?.bookingPropertyAddress && (
                        <p className="text-sm text-gray-500">{reservation.bookingPropertyAddress}</p>
                      )}
                    </div>
                  )}

                  {/* Transaction ID */}
                  {reservation?.paymentResult?.transaction && (
                    <p className="text-sm text-gray-600 mb-2 font-mono">
                      Transaction: {reservation.paymentResult.transaction}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Booking Fee</span>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{formatCurrency(reservation?.totalPrice)}
                    </p>
                  </div>

                  {/* Payment Status */}
                  <div className="mb-4">
                    {reservation?.isPaid ? (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                        Was Paid
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                        Was Not Paid
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarToday sx={{ fontSize: "1rem", color: "#ef4444" }} />
                      <span className="text-sm font-medium">Check-in:</span>
                      <span className="text-sm">
                        {new Date(reservation?.startDate).toDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarToday sx={{ fontSize: "1rem", color: "#ef4444" }} />
                      <span className="text-sm font-medium">Check-out:</span>
                      <span className="text-sm">
                        {new Date(reservation?.endDate).toDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col justify-center gap-3 md:min-w-[200px]">
                  {reservation?.isPaid && !item.isRefundRequested && (
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => requestRefund(item._id)}
                      sx={{
                        textTransform: "none",
                        borderColor: "#ea580c",
                        color: "#ea580c",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#c2410c",
                          backgroundColor: "rgba(234, 88, 12, 0.05)",
                        },
                      }}
                    >
                      Request Refund
                    </Button>
                  )}

                  {reservation?.isPaid && item.isRefundRequested && (
                    <div className="px-4 py-3 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-sm text-orange-700 font-semibold text-center">
                        Refund Approval Pending
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default DemoContent;
