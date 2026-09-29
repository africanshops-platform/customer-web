import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import FuseLoading from "@fuse/core/FuseLoading";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useGetUserSingleTrip } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";
import { useParams } from "react-router";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
import { formatDateUtil } from "src/app/main/vendors-shop/PosUtils";
import PaymentSuccessful from "./PaymentSuccessful";

const container = {
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
const item = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

/**
 * The Payment success page.
 */
function ReviewReservationPaymentSucces() {
  const user = useAppSelector(selectUser);

  const routeParams = useParams();
  const { reservationId } = routeParams;
  if (!reservationId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No reservation to process here!
        </Typography>
      </motion.div>
    );
  }

  const { data: successPaidReservation, isLoading, isError } = useGetUserSingleTrip(reservationId);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          Error loading reservation details
        </Typography>
      </motion.div>
    );
  }

  // Determine payment status immediately
  const isPaid = successPaidReservation?.data?.reservation?.isPaid;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: isPaid
          ? "linear-gradient(135deg, #fef3e2 0%, #fed7aa 50%, #fdba74 100%)"
          : "linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)",
      }}
    >
      {isPaid ? (
        <PaymentSuccessful
          userName={user?.name}
          reservationId={successPaidReservation?.data?.reservation?.id}
          checkInDate={formatDateUtil(successPaidReservation?.data?.reservation?.startDate)}
          checkOutDate={formatDateUtil(successPaidReservation?.data?.reservation?.endDate)}
          propertyName={successPaidReservation?.data?.reservation?.listing?.title}
        />
      ) : (
        <motion.div
          className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ minHeight: "70vh" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="max-w-lg mx-auto md:mx-0 md:pl-8">
                {/* Error Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full p-3"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)",
                      }}
                    >
                      <svg
                        className="w-12 h-12 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                      Payment Unsuccessful
                    </h1>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-gray-600 mb-2 text-lg">
                    We're sorry,{" "}
                    <span className="font-semibold text-gray-800">{user?.name || "Guest"}</span>!
                  </p>
                  <p className="text-gray-600 mb-6">
                    An error occurred while processing your payment. This could be due to
                    insufficient funds, network issues, or payment gateway errors.
                  </p>
                </motion.div>

                {/* What Happened Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-xl mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
                    border: "2px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-600"
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
                    What you can do:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Check your card balance and ensure you have sufficient funds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Verify your card details and billing information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Try a different payment method or card</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Contact your bank if the issue persists</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Reservation Still Pending */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 rounded-xl mb-6"
                  style={{
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Your reservation is still pending
                      </p>
                      <p className="text-xs text-gray-600">
                        Don't worry! Your selected property is still held for you. Complete the
                        payment within 1 hour to confirm your booking.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    variant="contained"
                    component={NavLinkAdapter}
                    to={`/bookings/reservation/review/${reservationId}`}
                    sx={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      textTransform: "none",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                        boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                      },
                    }}
                  >
                    Try Payment Again
                  </Button>
                  <Button
                    variant="outlined"
                    component={NavLinkAdapter}
                    to="/bookings/listings"
                    sx={{
                      textTransform: "none",
                      borderColor: "#d1d5db",
                      color: "#374151",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#9ca3af",
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    Browse More Properties
                  </Button>
                </motion.div>

                {/* Support Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 p-3 rounded-lg bg-gray-50"
                >
                  <p className="text-sm text-gray-600">
                    Need help?{" "}
                    <a
                      href="mailto:support@africanshops.com"
                      className="font-semibold hover:underline"
                      style={{ color: "#ea580c" }}
                    >
                      Contact our support team
                    </a>
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Right Illustration Section */}
            <div
              className="md:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(254, 226, 226, 0.5) 0%, rgba(252, 165, 165, 0.3) 100%)",
              }}
            >
              {/* Floating Error Icons */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  >
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="relative z-10 w-full flex items-center justify-center"
              >
                {/* Payment Error Illustration */}
                <svg
                  className="w-full max-w-md h-auto"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Credit Card with X */}
                  <rect
                    x="80"
                    y="150"
                    width="240"
                    height="150"
                    rx="12"
                    fill="#fee2e2"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />
                  <rect x="80" y="180" width="240" height="30" fill="#dc2626" opacity="0.3" />

                  {/* Big X Mark */}
                  <motion.g
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  >
                    <circle cx="200" cy="225" r="50" fill="#dc2626" />
                    <path
                      d="M180 205 L220 245 M220 205 L180 245"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </motion.g>
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ReviewReservationPaymentSucces;
