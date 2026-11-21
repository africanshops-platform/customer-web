import { formatStayDay } from "src/app/utils/stayDates";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import { CircularProgress } from "@mui/material";

/**
 * PlacedReservation Component
 * Displays the reservation details with booking fee, check-in/out dates, payment and cancel buttons
 */
function PlacedReservation({ reservation, onPayClick, onCancelClick, isCancelling }) {
  const bookingFee = reservation?.totalPrice || 0;
  // Booking dates are Lagos-midnight instants: format them in Lagos time (the first 10 characters of the UTC string are the day BEFORE).
  const checkInDate = reservation?.startDate || "";
  const checkOutDate = reservation?.endDate || "";
  const isPaid = reservation?.isPaid || false;

  // Format dates for display
  // const formatDateUtil = (dateString) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   const months = [
  //     "Jan",
  //     "Feb",
  //     "Mar",
  //     "Apr",
  //     "May",
  //     "Jun",
  //     "Jul",
  //     "Aug",
  //     "Sep",
  //     "Oct",
  //     "Nov",
  //     "Dec",
  //   ];

  //   const dayName = days[date.getDay()];
  //   const monthName = months[date.getMonth()];
  //   const day = date.getDate();
  //   const year = date.getFullYear();

  //   return `${dayName} ${monthName} ${day} ${year}`;
  // };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
      style={{
        border: "2px solid rgba(234, 88, 12, 0.1)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Placed Reservation</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Reservation #{reservation?.id?.slice(-8) || "N/A"}
              </p>
            </div>
          </div>

          {/* Reservation Status Badge */}
          {!isPaid && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              UNCONFIRMED
            </span>
          )}
          {isPaid && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              CONFIRMED
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Booking Fee Section */}
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)",
            border: "1px solid rgba(234, 88, 12, 0.15)",
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Total Booking Fee:</span>
            <div className="text-right">
              <div
                className="text-xl sm:text-2xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ₦ {formatCurrency(bookingFee)}
              </div>
              {!isPaid && (
                <button
                  onClick={onPayClick}
                  className="text-xs sm:text-sm font-bold uppercase mt-1 hover:underline transition-all"
                  style={{ color: "#ea580c" }}
                >
                  → Complete Payment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Check-In and Check-Out Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div
            className="p-3 sm:p-4 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-semibold text-gray-600">Check In</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-800">
              {formatStayDay(checkInDate)}
            </p>
          </div>

          <div
            className="p-3 sm:p-4 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-semibold text-gray-600">Check Out</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-800">
              {formatStayDay(checkOutDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isPaid && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onPayClick}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all hover:shadow-lg text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Complete Payment
              </div>
            </button>

            <button
              onClick={onCancelClick}
              disabled={isCancelling}
              className="py-3 px-6 rounded-xl font-bold transition-all text-sm sm:text-base"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                color: "#dc2626",
              }}
            >
              {isCancelling ? (
                <div className="flex items-center justify-center gap-2">
                  <CircularProgress size={16} sx={{ color: "#dc2626" }} />
                  Cancelling...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel Reservation
                </div>
              )}
            </button>
          </div>
        )}

        {/* Info Message */}
        {!isPaid && (
          <div
            className="p-3 rounded-lg flex items-start gap-3"
            style={{
              background: "rgba(59, 130, 246, 0.05)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Important:</strong> Unpaid reservations will be automatically cancelled after
              1 hour. Complete your payment to secure your booking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacedReservation;
