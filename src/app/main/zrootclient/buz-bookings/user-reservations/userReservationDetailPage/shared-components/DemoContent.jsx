import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircularProgress, Typography, Button, Chip } from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  CalendarToday,
  Payment,
  MeetingRoom,
  ExitToApp,
  ChatBubble,
  Info,
  CreditCard,
  Schedule,
} from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import { differenceInCalendarDays } from "date-fns";
import { useCancelUserReservation } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";
import PropertyChatDialog from "./PropertyChatDialog";

import { formatStayDay } from "src/app/utils/stayDates";
/**
 * DemoContent Component
 * Beautiful reservation detail page with orange gradient branding
 */
function DemoContent(props) {
  const { isLoading, isError, reservation } = props;

  const dayDifference = differenceInCalendarDays(
    new Date(reservation?.startDate),
    new Date(Date.now()),
  );
  const cancelMyReservation = useCancelUserReservation();

  // Persistent chat dialog state
  const [chatOpen, setChatOpen] = useState(false);

  // Load chat state from localStorage on mount
  useEffect(() => {
    const savedChatState = localStorage.getItem("chat_dialog_open");
    if (savedChatState === "true") {
      setChatOpen(true);
    }
  }, []);

  // Save chat state to localStorage whenever it changes
  const handleChatToggle = () => {
    const newState = !chatOpen;
    setChatOpen(newState);
    localStorage.setItem("chat_dialog_open", newState.toString());
  };

  const cancelReservation = (reservationIdPayload) => {
    if (
      window.confirm(
        "Are you certain about this? Once cancelled, this action cannot be reversed unless a new reservation is placed.",
      )
    ) {
      cancelMyReservation.mutate(reservationIdPayload);
    }
  };

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
            Loading reservation details...
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
        <ClienttErrorPage message={"Error occurred while retrieving reservation"} />
      </motion.div>
    );
  }

  // Empty State
  if (!reservation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col flex-1 items-center justify-center h-full p-8"
      >
        <Typography variant="h5" className="font-bold text-gray-800">
          No reservation found!
        </Typography>
      </motion.div>
    );
  }

  return (
    <div className="flex-auto h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Back Button and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            component={NavLinkAdapter}
            to="/bookings/my-reservations"
            startIcon={<ArrowBack />}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              mb: 2,
              "&:hover": {
                color: "#ea580c",
                backgroundColor: "rgba(234, 88, 12, 0.05)",
              },
            }}
          >
            Back to Reservations
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reservation Details</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Chip
              label={`ID: ${reservation?.id}`}
              size="small"
              sx={{
                backgroundColor: "#f3f4f6",
                fontWeight: 600,
              }}
            />
            <Typography variant="body2" className="text-gray-600">
              Placed on {formatStayDay(reservation?.createdAt)}
            </Typography>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6"
        >
          {/* Status Header */}
          <div
            className="p-6"
            style={{
              background: reservation?.isTripFullfiled
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {reservation?.isTripFullfiled ? (
                  <CheckCircle sx={{ fontSize: "2rem", color: "#22c55e" }} />
                ) : (
                  <Schedule sx={{ fontSize: "2rem", color: "#6b7280" }} />
                )}
                <div>
                  <Typography variant="h6" className="font-bold text-gray-900">
                    {reservation?.isTripFullfiled ? "Stay Fulfilled" : "Stay Not Fulfilled"}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Current reservation status
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="caption" className="text-gray-600 block mb-1">
                  Total Amount
                </Typography>
                <Typography
                  variant="h4"
                  className="font-bold"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ₦{formatCurrency(reservation?.totalPrice)}
                </Typography>
              </div>
            </div>
          </div>

          {/* Property Info */}
          {(reservation?.bookingPropertyName || reservation?.bookingPropertyAddress) && (
            <div className="p-6 border-t border-gray-100">
              {reservation?.bookingPropertyName && (
                <Typography variant="h6" className="font-bold text-gray-900 mb-1">
                  {reservation.bookingPropertyName}
                </Typography>
              )}
              {reservation?.bookingPropertyAddress && (
                <Typography variant="body2" className="text-gray-600">
                  {reservation.bookingPropertyAddress}
                </Typography>
              )}
            </div>
          )}

          {/* Stay Period */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <CalendarToday sx={{ fontSize: "1.5rem", color: "#ea580c" }} />
              <Typography variant="h6" className="font-bold text-gray-900">
                Stay Period
              </Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                <div>
                  <Typography variant="caption" className="text-gray-600 block mb-1">
                    Check-in
                  </Typography>
                  <Typography variant="body1" className="font-semibold text-gray-900">
                    {formatStayDay(reservation?.startDate)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                <div>
                  <Typography variant="caption" className="text-gray-600 block mb-1">
                    Check-out
                  </Typography>
                  <Typography variant="body1" className="font-semibold text-gray-900">
                    {formatStayDay(reservation?.endDate)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Section */}
          {!reservation?.isCheckIn && (
            <div className="p-6 border-t border-gray-100">
              {dayDifference > 2 ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => cancelReservation(reservation?._id)}
                  sx={{
                    textTransform: "none",
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      borderColor: "#b91c1c",
                      backgroundColor: "rgba(220, 38, 38, 0.05)",
                    },
                  }}
                >
                  Cancel This Reservation
                </Button>
              ) : (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Info sx={{ color: "#ea580c", mt: 0.5 }} />
                    <div>
                      <Typography variant="body2" className="font-semibold text-gray-900 mb-1">
                        Cancellation Not Available
                      </Typography>
                      <Typography variant="caption" className="text-gray-700">
                        This reservation has exceeded its cancellation period.{" "}
                        <span className="font-bold">Check-in in view</span>
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Payment sx={{ fontSize: "1.5rem", color: "#ea580c" }} />
              <Typography variant="h6" className="font-bold text-gray-900">
                Payment Information
              </Typography>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <CreditCard sx={{ color: "#6b7280" }} />
                <div>
                  <Typography variant="caption" className="text-gray-600 block">
                    Payment Method
                  </Typography>
                  <Typography variant="body2" className="font-semibold text-gray-900">
                    {reservation?.paymentdatas?.paymentMethod || "Not specified"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="flex-1">
                  <Typography variant="caption" className="text-gray-600 block">
                    Total Amount Paid
                  </Typography>
                  <Typography
                    variant="h6"
                    className="font-bold"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ₦{formatCurrency(reservation?.totalPrice)}
                  </Typography>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stay Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <MeetingRoom sx={{ fontSize: "1.5rem", color: "#ea580c" }} />
              <Typography variant="h6" className="font-bold text-gray-900">
                Stay Progress
              </Typography>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MeetingRoom sx={{ color: reservation?.isCheckIn ? "#22c55e" : "#ef4444" }} />
                <div className="flex-1">
                  <Typography variant="caption" className="text-gray-600 block">
                    Check-in Status
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-semibold"
                    sx={{
                      color: reservation?.isCheckIn ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {reservation?.isCheckIn ? "Checked In" : "Check-in Pending"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <ExitToApp sx={{ color: reservation?.isCheckOut ? "#22c55e" : "#ef4444" }} />
                <div className="flex-1">
                  <Typography variant="caption" className="text-gray-600 block">
                    Check-out Status
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-semibold"
                    sx={{
                      color: reservation?.isCheckOut ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {reservation?.isCheckOut ? "Checked Out" : "Check-out Pending"}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
              <Typography variant="caption" className="text-orange-700 leading-relaxed block">
                <strong>Refund Policy:</strong> Reservations are eligible for refund if cancelled
                prior to 48 hours before check-in. View our full{" "}
                <span className="underline cursor-pointer font-semibold">
                  Cancellation & Refund Policy
                </span>
                .
              </Typography>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          variant="contained"
          startIcon={<ChatBubble />}
          onClick={handleChatToggle}
          sx={{
            textTransform: "none",
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            px: 4,
            py: 1.5,
            borderRadius: "9999px",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(234, 88, 12, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              boxShadow: "0 15px 40px rgba(234, 88, 12, 0.5)",
              transform: "scale(1.05)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Chat with us
        </Button>
      </motion.div>

      {/* Property Chat Dialog */}
      <PropertyChatDialog open={chatOpen} onClose={handleChatToggle} reservation={reservation} />
    </div>
  );
}

export default DemoContent;
