import { useState } from "react";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import FuseLoading from "@fuse/core/FuseLoading";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useParams } from "react-router";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
import { formatCurrency, formatDateUtil } from "src/app/main/vendors-shop/PosUtils";
import { CheckCircle, DeliveryDining } from "@mui/icons-material";
import {
  useCreateTableReservation,
  useEligibleTablesForOrder,
  useGetAuthUserFoodOrdersAndItems,
} from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";

// Confetti colours — warm food-brand palette
const CONFETTI_COLORS = [
  "bg-orange-500",
  "bg-orange-600",
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-400",
  "bg-yellow-600",
  "bg-red-400",
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/**
 * Offer to reserve a table, shown only when this order's spend meets a
 * currently-available table's minimum spend at its venue. Silent (renders
 * nothing) when nothing qualifies -- this is a bonus, not an error state.
 * No extra payment step: the qualifying money already moved through this
 * order's own checkout.
 */
function TableReservationOffer({ orderId }) {
  const { data, isLoading } = useEligibleTablesForOrder(orderId);
  const tables = data?.data?.tables ?? [];
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [arrivalAt, setArrivalAt] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reserved, setReserved] = useState(null);
  const createReservation = useCreateTableReservation();

  if (isLoading || tables.length === 0) return null;

  if (reserved) {
    return (
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl mb-6"
        style={{ background: "rgba(34,197,94,0.08)", border: "2px solid rgba(34,197,94,0.25)" }}
      >
        <p className="text-sm font-semibold text-gray-800 mb-1">Table reserved!</p>
        <p className="text-xs text-gray-600">
          {reserved.table?.name || "Your table"} is booked for{" "}
          {new Date(reserved.scheduledArrivalAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.
        </p>
      </motion.div>
    );
  }

  function handleReserve() {
    if (!selectedTableId || !arrivalAt) return;
    createReservation.mutate(
      {
        tableId: selectedTableId,
        triggeringOrderId: orderId,
        scheduledArrivalAt: new Date(arrivalAt).toISOString(),
        partySize: Number(partySize) || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res?.data?.success) setReserved(res.data.reservation);
        },
      }
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-5 mb-6"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(79,70,229,0.04) 100%)",
        border: "2px solid rgba(124,58,237,0.2)",
      }}
    >
      <h3 className="font-semibold text-gray-800 mb-1">🎉 Your order unlocked a table reservation!</h3>
      <p className="text-xs text-gray-600 mb-3">Pick a table and your arrival time — no extra payment needed.</p>

      <div className="flex flex-col gap-2 mb-3">
        {tables.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTableId(t.id)}
            className="text-left p-3 rounded-lg border transition-colors"
            style={{
              borderColor: selectedTableId === t.id ? "#7c3aed" : "#e5e7eb",
              background: selectedTableId === t.id ? "rgba(124,58,237,0.06)" : "transparent",
            }}
          >
            <span className="font-medium text-sm text-gray-800">{t.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {t.section?.name ?? "No section"} · Seats {t.capacity} · Min ₦{formatCurrency(t.minimumSpend)}
            </span>
          </button>
        ))}
      </div>

      {selectedTableId && (
        <div className="flex flex-col gap-2">
          <input
            type="datetime-local"
            value={arrivalAt}
            onChange={(e) => setArrivalAt(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              placeholder="Guests"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
            />
            <input
              type="text"
              placeholder="Your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <Button
            variant="contained"
            disabled={!arrivalAt || createReservation.isLoading}
            onClick={handleReserve}
            sx={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { background: "linear-gradient(135deg, #6d28d9 0%, #3b0764 100%)" },
            }}
          >
            {createReservation.isLoading ? "Reserving…" : "Reserve this table"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Success state — full-screen celebration with food order details
 */
function FoodOrderSuccess({ userName, orderId, orderDate, totalAmount, itemCount, userEmail, foodMartName }) {
  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ minHeight: "70vh" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Raining confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(50)].map((_, i) => {
            const shapes = ["rounded-full", "rounded-sm", "rounded"];
            const shape = shapes[i % shapes.length];
            const sizes = ["w-4 h-4", "w-5 h-5", "w-6 h-6"];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            return (
              <motion.div
                key={i}
                className={`absolute ${size} ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} ${shape} shadow-lg`}
                style={{ left: `${Math.random() * 100}%`, opacity: 0.8 }}
                initial={{ y: -50, rotate: 0, scale: 0.8 }}
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
          {/* ── LEFT: Content ── */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-lg mx-auto md:mx-0 md:pl-8">

              {/* Success heading */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="rounded-full p-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)",
                    }}
                  >
                    <CheckCircle sx={{ fontSize: "2.5rem", color: "#ea580c" }} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Order Confirmed!</h1>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="text-gray-600 mb-2 text-lg">
                  Your food order is in — thanks for choosing{" "}
                  <span className="font-semibold text-orange-600">Africanshops</span>
                  {userName ? `, ${userName}` : ""}!
                </p>
                <p className="text-gray-600 mb-6">
                  {foodMartName
                    ? `${foodMartName} has received your order and the kitchen is getting to work.`
                    : "The restaurant has received your order and the kitchen is getting to work."}{" "}
                  Sit tight — your meal is on its way!
                </p>
              </motion.div>

              {/* Order progress tracker */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {[
                    { label: "Order placed", icon: <CheckCircle sx={{ fontSize: "1.25rem", color: "white" }} /> },
                    { label: "Kitchen confirmed", icon: <CheckCircle sx={{ fontSize: "1.25rem", color: "white" }} /> },
                    { label: "On its way", icon: <DeliveryDining sx={{ fontSize: "1.25rem", color: "white" }} /> },
                  ].map((step, idx, arr) => (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                          style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                        >
                          {step.icon}
                        </div>
                        <span className="text-xs text-gray-600 text-center">{step.label}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          className="flex-1 h-1 mx-2 mb-5"
                          style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Order summary card */}
              {(orderId || orderDate || totalAmount || itemCount) && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg p-5 mb-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.05) 100%)",
                    border: "2px solid rgba(249,115,22,0.2)",
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DeliveryDining sx={{ fontSize: "1.25rem", color: "#ea580c" }} />
                    Order Summary
                  </h3>
                  {orderId && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Order ID:</span> #{orderId}
                    </p>
                  )}
                  {orderDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Placed:</span> {orderDate}
                    </p>
                  )}
                  {itemCount > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Items:</span> {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  )}
                  {totalAmount > 0 && (
                    <p className="text-sm text-gray-700 font-semibold">
                      <span className="font-medium">Total Paid:</span> ₦{totalAmount?.toLocaleString()}
                    </p>
                  )}
                </motion.div>
              )}

              {orderId && <TableReservationOffer orderId={orderId} />}

              {/* Email notice */}
              {userEmail && (
                <motion.div
                  variants={itemVariants}
                  className="p-4 rounded-xl mb-6"
                  style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Confirmation sent</p>
                      <p className="text-xs text-gray-600">
                        An invoice and order receipt has been sent to{" "}
                        <span className="font-medium">{userEmail}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="contained"
                  component={NavLinkAdapter}
                  to="/foodmarts/user/food-orders"
                  sx={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": {
                      background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                      boxShadow: "0 8px 20px rgba(234,88,12,0.4)",
                    },
                  }}
                >
                  View My Orders
                </Button>
                <Button
                  variant="outlined"
                  component={NavLinkAdapter}
                  to="/foodmarts/listings"
                  sx={{
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: "#374151",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                  }}
                >
                  Browse Restaurants
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

          {/* ── RIGHT: Illustration ── */}
          <div
            className="md:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(254,243,226,0.8) 0%, rgba(253,186,116,0.5) 100%)",
            }}
          >
            {/* Background confetti */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} rounded-sm opacity-60`}
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                  animate={{ y: [0, -20, 0], rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative z-10 w-full flex items-center justify-center"
            >
              {/* Food delivery illustration */}
              <svg className="w-full max-w-md h-auto drop-shadow-2xl" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Plate */}
                <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}>
                  <ellipse cx="200" cy="300" rx="120" ry="18" fill="#fed7aa" opacity="0.5" />
                  <ellipse cx="200" cy="270" rx="110" ry="110" fill="#fff7ed" stroke="#ea580c" strokeWidth="3" />
                  <ellipse cx="200" cy="270" rx="90" ry="90" fill="#fef3e2" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" />
                  {/* Steam lines */}
                  {[160, 200, 240].map((x, i) => (
                    <motion.path
                      key={i}
                      d={`M${x} 170 Q${x + 10} 155 ${x} 140 Q${x - 10} 125 ${x} 110`}
                      stroke="#fdba74"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -6, 0] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </motion.g>

                {/* Checkmark circle */}
                <motion.g
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  <circle cx="200" cy="270" r="55" fill="#ea580c" />
                  <motion.path
                    d="M175 270 L193 288 L228 253"
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

                {/* Sparkles */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 8;
                  const x = 200 + Math.cos(angle) * 110;
                  const y = 270 + Math.sin(angle) * 95;
                  return (
                    <motion.g
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ delay: 1.3 + i * 0.1, duration: 1, repeat: Infinity, repeatDelay: 1 }}
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

/**
 * Failed payment state
 */
function FoodOrderFailed({ userName }) {
  return (
    <motion.div
      className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      style={{ minHeight: "70vh" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Left */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-lg mx-auto md:mx-0 md:pl-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-3" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(185,28,28,0.1) 100%)" }}>
                  <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Payment Unsuccessful</h1>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="text-gray-600 mb-2 text-lg">
                We're sorry, <span className="font-semibold text-gray-800">{userName || "Guest"}</span>!
              </p>
              <p className="text-gray-600 mb-6">
                We couldn't process your payment for this food order. This could be due to insufficient funds, network issues, or a payment gateway error.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="p-4 rounded-xl mb-6"
              style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.05) 100%)", border: "2px solid rgba(239,68,68,0.2)" }}
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What you can do:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Check your card balance and ensure you have sufficient funds",
                  "Verify your card details and billing information",
                  "Try a different payment method or card",
                  "Contact your bank if the issue persists",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="p-4 rounded-xl mb-6"
              style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Your cart is still saved</p>
                  <p className="text-xs text-gray-600">Your food items are waiting — head back to checkout and try again.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="contained"
                component={NavLinkAdapter}
                to="/foodmarts/review-food-cart"
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  textTransform: "none", px: 4, py: 1.5, fontWeight: 600,
                  "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 8px 20px rgba(234,88,12,0.4)" },
                }}
              >
                Try Payment Again
              </Button>
              <Button
                variant="outlined"
                component={NavLinkAdapter}
                to="/foodmarts/listings"
                sx={{
                  textTransform: "none", borderColor: "#d1d5db", color: "#374151", px: 4, py: 1.5, fontWeight: 600,
                  "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                }}
              >
                Browse Restaurants
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-6 p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a href="mailto:support@africanshops.com" className="font-semibold hover:underline" style={{ color: "#ea580c" }}>
                  Contact our support team
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right — error illustration */}
        <div
          className="md:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(254,226,226,0.5) 0%, rgba(252,165,165,0.3) 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
              >
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            <svg className="w-full max-w-md h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Plate */}
              <ellipse cx="200" cy="270" rx="110" ry="110" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
              <ellipse cx="200" cy="270" rx="90" ry="90" fill="#fecaca" opacity="0.4" />
              {/* Big X */}
              <motion.g initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.7, type: "spring", stiffness: 200 }}>
                <circle cx="200" cy="270" r="50" fill="#dc2626" />
                <path d="M180 250 L220 290 M220 250 L180 290" stroke="white" strokeWidth="8" strokeLinecap="round" />
              </motion.g>
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * FoodmartOrderPaymenSucces — payment result page for food orders.
 * Fetches the actual food order by orderId from route params and renders
 * the appropriate success or failure state.
 */
function FoodmartOrderPaymenSucces() {
  const user = useAppSelector(selectUser);
  const { orderId } = useParams();

  const { data: orderData, isLoading, isError } = useGetAuthUserFoodOrdersAndItems(orderId);
  // The backend returns the order under `rcs_order` (see
  // user-foodorder.service.ts's getOrderByIdByUser) -- not `foodOrder`/`order`.
  const foodOrder = orderData?.data?.rcs_order;

  if (!orderId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-screen"
      >
        <Typography color="text.secondary" variant="h5">No food order to process here!</Typography>
      </motion.div>
    );
  }

  if (isLoading) return <FuseLoading />;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-screen"
      >
        <Typography color="text.secondary" variant="h5">Error loading order details</Typography>
      </motion.div>
    );
  }

  const isPaid = foodOrder?.isPaid ?? true;

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
        <FoodOrderSuccess
          userName={user?.name}
          orderId={foodOrder?.id || orderId}
          orderDate={foodOrder?.createdAt ? formatDateUtil(foodOrder.createdAt) : null}
          totalAmount={foodOrder?.totalPrice ?? null}
          itemCount={foodOrder?.foodOrderItems?.length ?? null}
          userEmail={user?.email}
          foodMartName={null}
        />
      ) : (
        <FoodOrderFailed userName={user?.name} />
      )}
    </div>
  );
}

export default FoodmartOrderPaymenSucces;
