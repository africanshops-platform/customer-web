import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { DeliveryCodeSuccessCard } from "../components/DeliveryCodeCard";

/**
 * PaymentSuccessful Component for Marketplace
 * Displays a beautiful success message with celebration animation
 */
function PaymentSuccessful({
  userName = "Guest",
  orderId,
  orderDate,
  totalAmount,
  itemCount,
  userEmail,
  deliveryCode = null,
}) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const confettiColors = [
    "bg-orange-500",
    "bg-orange-600",
    "bg-yellow-500",
    "bg-amber-500",
    "bg-orange-400",
    "bg-yellow-600",
    "bg-orange-700",
  ];

  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ minHeight: "70vh" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Confetti Background - Raining Celebration Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(50)].map((_, i) => {
            const shapes = ["rounded-full", "rounded-sm", "rounded"];
            const shape = shapes[i % shapes.length];
            const size =
              Math.random() > 0.5 ? "w-4 h-4" : Math.random() > 0.3 ? "w-5 h-5" : "w-6 h-6";

            return (
              <motion.div
                key={i}
                className={`absolute ${size} ${confettiColors[i % confettiColors.length]} ${shape} shadow-lg`}
                style={{
                  left: `${Math.random() * 100}%`,
                  opacity: 0.8,
                }}
                initial={{
                  y: -50,
                  rotate: 0,
                  scale: 0.8,
                }}
                animate={{
                  y: "110vh",
                  rotate: [0, 180, 360, 540],
                  scale: [0.8, 1, 0.9, 1],
                  x: [0, Math.random() * 50 - 25, 0],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row h-full relative z-10">
          {/* Left Content Section */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {/* Add container with consistent padding for text alignment */}
            <div className="max-w-lg mx-auto md:mx-0 md:pl-8">
              <motion.div variants={itemVariants}>
                {/* Success Icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="rounded-full p-3"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
                    }}
                  >
                    <CheckCircle sx={{ fontSize: "2.5rem", color: "#ea580c" }} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    Payment Successful!
                  </h1>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="text-gray-600 mb-2 text-lg">
                  Thank you for shopping with{" "}
                  <span className="font-semibold text-orange-600">Africanshops</span>, {userName}!
                </p>
                <p className="text-gray-600 mb-6">
                  Your order has been confirmed and is being processed. We're excited to deliver
                  your items to you soon!
                </p>
              </motion.div>

              {/* Progress Indicator */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      }}
                    >
                      <CheckCircle sx={{ fontSize: "1.25rem", color: "white" }} />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Order placed</span>
                  </div>
                  <div
                    className="flex-1 h-1 mx-2"
                    style={{
                      background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)",
                    }}
                  ></div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      }}
                    >
                      <CheckCircle sx={{ fontSize: "1.25rem", color: "white" }} />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Payment received</span>
                  </div>
                  <div
                    className="flex-1 h-1 mx-2"
                    style={{
                      background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)",
                    }}
                  ></div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      }}
                    >
                      <ShoppingBag sx={{ fontSize: "1.25rem", color: "white" }} />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Order confirmed</span>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary */}
              {(orderId || orderDate || totalAmount > 0 || itemCount > 0) && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg p-5 mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                    border: "2px solid rgba(249, 115, 22, 0.2)",
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShoppingBag sx={{ fontSize: "1.25rem", color: "#ea580c" }} />
                    Order Summary
                  </h3>
                  {orderId && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Order ID:</span> #{orderId}
                    </p>
                  )}
                  {orderDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Order Date:</span> {orderDate}
                    </p>
                  )}
                  {itemCount > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Items:</span> {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  )}
                  {totalAmount > 0 && (
                    <p className="text-sm text-gray-700 font-semibold">
                      <span className="font-medium">Total Amount:</span> ₦{Number(totalAmount).toLocaleString("en-NG")}
                    </p>
                  )}
                </motion.div>
              )}

              {/* The delivery code — shown once; the customer presents it to the delivery person */}
              <motion.div variants={itemVariants}>
                <DeliveryCodeSuccessCard
                  code={deliveryCode}
                  orderViewPath={`/marketplace/user/orders/${orderId}/view-order`}
                />
              </motion.div>

              {/* Email Confirmation Notice */}
              {userEmail && (
                <motion.div
                  variants={itemVariants}
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Order confirmation sent
                      </p>
                      <p className="text-xs text-gray-600">
                        An email receipt and invoice has been sent to{" "}
                        <span className="font-medium">{userEmail}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="contained"
                  component={NavLinkAdapter}
                  to="/marketplace/user/orders"
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
                  View My Orders
                </Button>
                <Button
                  variant="outlined"
                  component={NavLinkAdapter}
                  to="/marketplace/shop"
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
                  Continue Shopping
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6">
                <p className="text-sm text-gray-500">
                  Warm Regards,
                  <br />
                  <span className="font-semibold text-gray-700">The Africanshops Team</span>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Illustration Section */}
          <div
            className="md:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(254, 243, 226, 0.8) 0%, rgba(253, 186, 116, 0.5) 100%)",
            }}
          >
            {/* Background Confetti */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 ${confettiColors[i % confettiColors.length]} rounded-sm opacity-60`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative z-10 w-full flex items-center justify-center"
            >
              {/* Shopping Success Illustration */}
              <svg
                className="w-full max-w-md h-auto drop-shadow-2xl"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Shopping bag */}
                <motion.g
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <path
                    d="M120 160 L120 320 C120 330 125 340 135 340 L265 340 C275 340 280 330 280 320 L280 160"
                    fill="#fed7aa"
                    stroke="#ea580c"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M100 160 L300 160 L290 180 L110 180 Z"
                    fill="#fdba74"
                    stroke="#ea580c"
                    strokeWidth="4"
                  />
                  {/* Bag handles */}
                  <path
                    d="M150 160 C150 120 170 100 200 100 C230 100 250 120 250 160"
                    stroke="#ea580c"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </motion.g>

                {/* Success checkmark circle */}
                <motion.g
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  <circle cx="200" cy="240" r="60" fill="#ea580c" />
                  <motion.path
                    d="M170 240 L190 260 L230 220"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  />
                </motion.g>

                {/* Sparkles around the bag */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 8;
                  const x = 200 + Math.cos(angle) * 120;
                  const y = 240 + Math.sin(angle) * 100;
                  return (
                    <motion.g
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{
                        delay: 1.3 + i * 0.1,
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <path
                        d={`M${x} ${y} L${x + 8} ${y} M${x + 4} ${y - 4} L${x + 4} ${y + 4}`}
                        stroke="#f97316"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  );
                })}
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentSuccessful;
