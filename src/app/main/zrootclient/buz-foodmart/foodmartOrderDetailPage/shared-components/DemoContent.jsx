import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { CheckCircle, RestaurantMenu, DeliveryDining } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import RaiseDisputeDialog from "src/app/main/zrootclient/buz-disputes/RaiseDisputeDialog";

const FOOD_STEPS = [
  { key: "ordered",    label: "Order Received",    icon: <CheckCircle sx={{ fontSize: "1.15rem" }} /> },
  { key: "preparing",  label: "Kitchen Preparing", icon: <RestaurantMenu sx={{ fontSize: "1.15rem" }} /> },
  { key: "on_the_way", label: "On the Way",        icon: <DeliveryDining sx={{ fontSize: "1.15rem" }} /> },
  { key: "delivered",  label: "Delivered",         icon: <CheckCircle sx={{ fontSize: "1.15rem" }} /> },
];

function resolveActiveStep(orderData) {
  if (!orderData?.isPaid) return -1;
  if (orderData?.isDelivered) return 3;
  if (orderData?.isShipped)   return 2;
  if (orderData?.isPacked)    return 1;
  return 0;
}

function getStatusBadge(orderData) {
  const s = orderData?.status?.toLowerCase();
  if (s === "cancelled" || s === "refunded")
    return { label: "Cancelled",  color: "#dc2626", bgColor: "rgba(239,68,68,0.1)",    borderColor: "rgba(239,68,68,0.3)"    };
  if (orderData?.isDelivered || s === "delivered" || s === "completed")
    return { label: "Delivered",  color: "#16a34a", bgColor: "rgba(34,197,94,0.1)",    borderColor: "rgba(34,197,94,0.3)"    };
  if (orderData?.isShipped)
    return { label: "On the Way", color: "#7c3aed", bgColor: "rgba(124,58,237,0.1)",   borderColor: "rgba(124,58,237,0.3)"   };
  if (orderData?.isPacked)
    return { label: "Packed",     color: "#ea580c", bgColor: "rgba(249,115,22,0.1)",   borderColor: "rgba(249,115,22,0.3)"   };
  if (orderData?.isPaid)
    return { label: "Confirmed",  color: "#ea580c", bgColor: "rgba(249,115,22,0.1)",   borderColor: "rgba(249,115,22,0.3)"   };
  return   { label: "Unpaid",     color: "#dc2626", bgColor: "rgba(239,68,68,0.08)",   borderColor: "rgba(239,68,68,0.3)"    };
}

/* ─────────────────────────────────────────────────────────
   ChatWidget — slide-up panel pinned to bottom-right corner
   ───────────────────────────────────────────────────────── */
function ChatWidget({ restaurantName, orderRef }) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "restaurant",
      text: `Hi there! 👋 Thanks for your order${orderRef ? ` #${orderRef}` : ""}. How can we help you today?`,
      time: new Date(),
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text, time: new Date() }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "restaurant",
          text: "Got it! Our team will attend to this shortly. Thank you for reaching out. 🍽️",
          time: new Date(),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* Slide-up chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 rounded-2xl overflow-hidden flex flex-col"
            style={{
              width: "clamp(360px, 92vw, 480px)",
              height: "clamp(500px, 70vh, 680px)",
              border: "1px solid rgba(229,231,235,1)",
              background: "white",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(234,88,12,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center gap-4 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.22)", boxShadow: "0 0 0 3px rgba(255,255,255,0.15)" }}
              >
                <RestaurantMenu sx={{ color: "white", fontSize: "1.5rem" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base leading-tight truncate">
                  {restaurantName || "Restaurant"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-green-300"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-orange-100 text-sm">Online · usually responds in minutes</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.12, backgroundColor: "rgba(255,255,255,0.18)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Order context strip */}
            {orderRef && (
              <div
                className="px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0"
                style={{ background: "rgba(249,115,22,0.06)", borderBottom: "1px solid rgba(249,115,22,0.15)" }}
              >
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ea580c" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-orange-700 font-semibold">Chatting about Order #{orderRef}</p>
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
              style={{ background: "#f9fafb", minHeight: 0 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} items-end gap-2.5`}
                >
                  {msg.from === "restaurant" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 2px 8px rgba(234,88,12,0.3)" }}
                    >
                      <RestaurantMenu sx={{ color: "white", fontSize: "0.85rem" }} />
                    </div>
                  )}
                  <div className="max-w-[76%]">
                    <div
                      className="px-5 py-3 text-sm leading-relaxed"
                      style={
                        msg.from === "user"
                          ? {
                              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                              color: "white",
                              borderRadius: "18px 18px 4px 18px",
                              boxShadow: "0 3px 12px rgba(234,88,12,0.28)",
                            }
                          : {
                              background: "white",
                              color: "#374151",
                              border: "1px solid rgba(229,231,235,1)",
                              borderRadius: "18px 18px 18px 4px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            }
                      }
                    >
                      {msg.text}
                    </div>
                    <p
                      className="text-xs text-gray-400 mt-1.5 px-1"
                      style={{ textAlign: msg.from === "user" ? "right" : "left" }}
                    >
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
              style={{ background: "white", borderTop: "1px solid rgba(229,231,235,1)" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message to the restaurant…"
                className="flex-1 text-sm text-gray-800 rounded-xl px-5 py-3 outline-none"
                style={{
                  background: "#f9fafb",
                  border: "1px solid rgba(229,231,235,1)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f97316";
                  e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(229,231,235,1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                    : "rgba(229,231,235,1)",
                  boxShadow: input.trim() ? "0 4px 14px rgba(234,88,12,0.4)" : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={input.trim() ? "white" : "#9ca3af"}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button — wide pill when closed, compact X when open */}
      <AnimatePresence mode="wait">
        {open ? (
          <motion.button
            key="close-fab"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            className="w-14 h-14 rounded-full text-white flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 6px 24px rgba(234,88,12,0.45)",
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            key="open-fab"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex items-center gap-4 text-white rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 10px 32px rgba(234,88,12,0.52)",
              padding: "16px 28px 16px 20px",
            }}
          >
            {/* Icon container */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.22)" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            {/* Label */}
            <div className="text-left">
              <p className="font-bold text-base leading-tight">Chat with Restaurant</p>
              <div className="flex items-center gap-1.5 mt-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-300"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-orange-100 text-xs font-medium">Online now</p>
              </div>
            </div>

            {/* Green badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center"
              style={{ border: "2.5px solid white", boxShadow: "0 2px 8px rgba(34,197,94,0.5)" }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-green-300"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Content ─── */
function DemoContent({ isLoading, isError, orderData, orderId }) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId]     = useState(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

  const handleCancelOpen  = (id) => { setSelectedItemId(id); setCancelDialogOpen(true); };
  const handleCancelClose = ()  => { setCancelDialogOpen(false); setSelectedItemId(null); };
  const handleRefundOpen  = (id) => { setSelectedItemId(id); setRefundDialogOpen(true); };
  const handleRefundClose = ()  => { setRefundDialogOpen(false); setSelectedItemId(null); };

  const confirmCancel = () => {
    if (selectedItemId) {
      // TODO: wire useCancelFoodOrderItem(selectedItemId)
    }
    handleCancelClose();
  };
  const confirmRefund = () => {
    if (selectedItemId) {
      // TODO: wire useRequestFoodOrderRefund(selectedItemId)
    }
    handleRefundClose();
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex-auto flex items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center w-full max-w-4xl mx-auto"
        >
          <motion.div
            className="relative w-36 h-36 mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", opacity: 0.18 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.18, 0.4, 0.18] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", opacity: 0.38 }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.38, 0.6, 0.38] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <div
              className="absolute inset-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
            >
              <span style={{ fontSize: "1.6rem" }}>🍽️</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Loading Order Details</h3>
            <p className="text-lg text-gray-600 mb-6">Fetching your food order…</p>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                  animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 space-y-4 max-w-2xl mx-auto"
          >
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="bg-white rounded-2xl p-7 shadow-md"
                style={{ border: "1px solid rgba(229,231,235,1)" }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: item * 0.2 }}
              >
                <div className="flex gap-5">
                  <div
                    className="w-24 h-24 rounded-xl flex-shrink-0"
                    style={{ background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)" }}
                  />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-5 rounded" style={{ width: "60%", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)" }} />
                    <div className="h-4 rounded" style={{ width: "40%", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)" }} />
                    <div className="h-4 rounded" style={{ width: "30%", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)" }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Error ── */
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <ClienttErrorPage message="Error occurred while retrieving this food order" />
      </motion.div>
    );
  }

  /* ── Not found ── */
  if (!orderData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <div className="text-center max-w-md">
          <div
            className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(234,88,12,0.05) 100%)" }}
          >
            <span style={{ fontSize: "3.5rem" }}>🍽️</span>
          </div>
          <Typography variant="h5" className="font-bold text-gray-800 mb-3">Order Not Found</Typography>
          <Typography className="text-gray-600 mb-6">
            We couldn't find the food order you're looking for.
          </Typography>
          <NavLinkAdapter to="/foodmarts/user/food-orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-3 rounded-xl font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
              }}
            >
              View All Orders
            </motion.button>
          </NavLinkAdapter>
        </div>
      </motion.div>
    );
  }

  const statusBadge     = getStatusBadge(orderData);
  const activeStep      = resolveActiveStep(orderData);
  const restaurantName  = orderData?.foodMart?.title || orderData?.rcsVendor?.title || "Restaurant";
  const reference       = orderData?.paymentResult?.reference || orderData?.id?.slice(0, 12);
  const totalPrice      = orderData?.grandTotal ?? orderData?.totalPrice ?? 0;
  const isCancelled     = ["cancelled", "refunded"].includes(orderData?.status?.toLowerCase());
  const dateStr         = orderData?.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="flex-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <NavLinkAdapter to="/foodmarts/user/food-orders">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-5 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Food Orders
            </motion.button>
          </NavLinkAdapter>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Food Order Details</h1>
              <p className="text-sm sm:text-base text-gray-500">{restaurantName}</p>
            </div>
            <div
              className="px-5 py-2.5 rounded-xl font-bold text-center text-sm"
              style={{
                background: statusBadge.bgColor,
                border: `2px solid ${statusBadge.borderColor}`,
                color: statusBadge.color,
              }}
            >
              {statusBadge.label}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Placed on: {dateStr}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Ref: #{reference}
            </div>
            <div className="flex items-center gap-2 font-bold text-orange-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Total: ₦{formatCurrency(totalPrice)}
            </div>
          </div>
        </motion.div>

        {/* Delivery progress tracker */}
        {orderData?.isPaid && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-6"
            style={{ border: "1px solid rgba(229,231,235,1)" }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Progress</h2>
            <div className="flex items-center justify-between">
              {FOOD_STEPS.map((step, idx) => {
                const done    = idx <= activeStep;
                const current = idx === activeStep;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <motion.div
                        animate={current ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1.5, repeat: current ? Infinity : 0 }}
                        className="w-11 h-11 rounded-full flex items-center justify-center mb-2 shadow-sm"
                        style={{
                          background: done
                            ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                            : "rgba(229,231,235,1)",
                          color: done ? "white" : "#9ca3af",
                        }}
                      >
                        {step.icon}
                      </motion.div>
                      <span
                        className="text-xs font-semibold text-center leading-tight"
                        style={{ color: done ? "#ea580c" : "#9ca3af", maxWidth: "72px" }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < FOOD_STEPS.length - 1 && (
                      <div
                        className="flex-1 h-1.5 mx-2 mb-6 rounded-full"
                        style={{
                          background: idx < activeStep
                            ? "linear-gradient(90deg, #f97316 0%, #ea580c 100%)"
                            : "rgba(229,231,235,1)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderData?.foodOrderItems?.map((item, index) => {
              const isItemDelivered = item?.orderId?.isDelivered;
              const isItemShipped   = item?.orderId?.isShipped;
              const isItemCancelled = item?.isCanceled;

              return (
                <motion.div
                  key={item?._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                  style={{ border: "1px solid rgba(229,231,235,1)" }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Food image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        {item?.image ? (
                          <img
                            src={item.image}
                            alt={item?.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div
                            className="w-full h-full rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
                          >
                            <span style={{ fontSize: "2.5rem" }}>🍽️</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item?.name}</h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500">Price: </span>
                            <span className="font-bold text-gray-900">₦{formatCurrency(item?.price)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Qty: </span>
                            <span className="font-bold text-gray-900">{item?.quantity}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Total: </span>
                            <span className="font-bold text-orange-600">₦{formatCurrency(item?.price * item?.quantity)}</span>
                          </div>
                        </div>

                        {/* Item status pill */}
                        <div className="flex flex-wrap gap-2">
                          {isItemDelivered && (
                            <span
                              className="px-4 py-1.5 rounded-lg font-semibold text-sm"
                              style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)" }}
                            >
                              ✓ Fulfilled
                            </span>
                          )}
                          {!isItemDelivered && !isItemCancelled && (
                            <span
                              className="px-4 py-1.5 rounded-lg font-semibold text-sm"
                              style={{ background: "rgba(249,115,22,0.1)", color: "#ea580c", border: "1px solid rgba(249,115,22,0.3)" }}
                            >
                              {isItemShipped ? "On the Way" : "Processing"}
                            </span>
                          )}
                          {isItemCancelled && (
                            <span
                              className="px-4 py-1.5 rounded-lg font-semibold text-sm"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" }}
                            >
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!isItemCancelled && !isItemShipped && !isItemDelivered && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelOpen(item?._id)}
                          className="px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#dc2626",
                            border: "2px solid rgba(239,68,68,0.3)",
                          }}
                        >
                          Cancel Item
                        </motion.button>
                      )}
                      {isItemCancelled && !item?.isRefundRequested && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRefundOpen(item?._id)}
                          className="px-6 py-2 rounded-xl font-semibold text-sm text-white transition-all"
                          style={{
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            boxShadow: "0 2px 8px rgba(234,88,12,0.3)",
                          }}
                        >
                          Request Refund
                        </motion.button>
                      )}
                      {/* Order-level flag, not isItemDelivered — matches
                          what the backend actually checks for dispute
                          eligibility (the parent order's isDelivered). */}
                      {orderData?.isDelivered && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDisputeDialogOpen(true)}
                          className="px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                          style={{
                            background: "white",
                            color: "#dc2626",
                            border: "1px solid rgba(220,38,38,0.4)",
                          }}
                        >
                          Report an issue
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <RaiseDisputeDialog
          open={disputeDialogOpen}
          onClose={() => setDisputeDialogOpen(false)}
          orderId={orderId}
          orderType="FOOD"
        />

        {/* Payment Info + Order Progress grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6"
            style={{ border: "1px solid rgba(229,231,235,1)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Payment Information</h3>
            </div>
            <div className="space-y-3">
              {orderData?.paymentResult?.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">{orderData.paymentResult.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${orderData?.isPaid ? "text-green-600" : "text-red-500"}`}>
                  {orderData?.isPaid ? "✓ Paid" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2" style={{ borderTop: "1px solid rgba(229,231,235,1)" }}>
                <span className="text-gray-700 font-semibold">Total Amount:</span>
                <span className="font-bold text-orange-600 text-base">₦{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </motion.div>

          {/* Order Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6"
            style={{ border: "1px solid rgba(229,231,235,1)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Order Progress</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: "isPacked",    label: "Kitchen Packaged", done: orderData?.isPacked    },
                { key: "isShipped",   label: "On the Way",       done: orderData?.isShipped   },
                { key: "isDelivered", label: "Delivered",        done: orderData?.isDelivered },
              ].map(({ key, label, done }) => (
                <div key={key} className="flex items-center justify-between text-sm py-1.5">
                  <span className="text-gray-600">{label}:</span>
                  <span className={`font-semibold ${done ? "text-green-600" : "text-gray-400"}`}>
                    {done ? "✓ Done" : "Pending…"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              color: "white",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold text-xl">Cancel Food Item?</span>
          </DialogTitle>
          <DialogContent sx={{ padding: "32px 24px" }}>
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              Are you sure you want to cancel this item?
            </Typography>
            <Typography variant="body1" className="text-gray-700 leading-relaxed mb-4">
              Once cancelled, the restaurant will stop preparing this item. This action cannot be undone.
            </Typography>
            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(239,68,68,0.07)", border: "2px solid rgba(239,68,68,0.2)" }}
            >
              <Typography variant="body2" className="text-gray-700">
                <strong>Note:</strong> You may request a refund after cancellation if payment was made.
              </Typography>
            </div>
          </DialogContent>
          <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
            <Button
              onClick={handleCancelClose}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#9ca3af",
                color: "#6b7280",
                "&:hover": { borderColor: "#6b7280", backgroundColor: "#f3f4f6" },
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 24px",
              }}
            >
              Keep Item
            </Button>
            <Button
              onClick={confirmCancel}
              variant="contained"
              fullWidth
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                "&:hover": { background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)", boxShadow: "0 8px 20px rgba(220,38,38,0.4)" },
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 24px",
              }}
            >
              Yes, Cancel Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Refund Request Dialog */}
        <Dialog
          open={refundDialogOpen}
          onClose={handleRefundClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "white",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-xl">Request Refund</span>
          </DialogTitle>
          <DialogContent sx={{ padding: "32px 24px" }}>
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              Request a refund for this item?
            </Typography>
            <Typography variant="body1" className="text-gray-700 leading-relaxed mb-4">
              Your refund request will be reviewed by our team. Once approved, the funds will be returned to your wallet.
            </Typography>
            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(249,115,22,0.07)", border: "2px solid rgba(249,115,22,0.2)" }}
            >
              <Typography variant="body2" className="text-gray-700">
                <strong>Note:</strong> Refunds typically take 3–5 business days to process after approval.
              </Typography>
            </div>
          </DialogContent>
          <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
            <Button
              onClick={handleRefundClose}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#9ca3af",
                color: "#6b7280",
                "&:hover": { borderColor: "#6b7280", backgroundColor: "#f3f4f6" },
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 24px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRefund}
              variant="contained"
              fullWidth
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 8px 20px rgba(234,88,12,0.4)" },
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 24px",
              }}
            >
              Submit Refund Request
            </Button>
          </DialogActions>
        </Dialog>

        <ChatWidget restaurantName={restaurantName} orderRef={reference} />

      </div>
    </div>
  );
}

export default DemoContent;
