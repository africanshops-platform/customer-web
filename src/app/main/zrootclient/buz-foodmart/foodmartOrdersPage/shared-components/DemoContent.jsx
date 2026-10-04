import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import FoodOrderCard from "../../components/FoodOrderCard";

function isCancelledOrder(o) {
  const s = o?.status?.toLowerCase();
  return o?.isCancelled === true || o?.kitchenStage === "DECLINED" || s === "cancelled" || s === "refunded" || s === "failed";
}

function isUnpaidOrder(o) {
  return !o?.isPaid && !isCancelledOrder(o);
}

function LoadingState() {
  return (
    <div className="flex-auto flex items-center justify-center min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-4xl mx-auto"
      >
        {/* Spinning rings */}
        <motion.div
          className="relative w-40 h-40 mx-auto mb-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", opacity: 0.2 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", opacity: 0.4 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <div
            className="absolute inset-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
          >
            <span style={{ fontSize: "1.8rem" }}>🍽️</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Fetching Your Food Orders</h3>
          <p className="text-lg text-gray-600 mb-7">Please wait while we pull in your order history…</p>
          <div className="flex items-center justify-center gap-3">
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

        {/* Skeleton cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-14 space-y-5 max-w-2xl mx-auto"
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
                <div className="w-24 h-24 rounded-xl flex-shrink-0" style={{ background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)" }} />
                <div className="flex-1 space-y-3.5">
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

function DemoContent({ isLoading, isError, userCreatedOrders, completedOrders = [] }) {
  const [activeTab, setActiveTab] = useState("active");

  const activeOrders    = useMemo(() => userCreatedOrders?.filter((o) => !isCancelledOrder(o)) || [], [userCreatedOrders]);
  const cancelledOrders = useMemo(() => userCreatedOrders?.filter(isCancelledOrder) || [], [userCreatedOrders]);
  const unpaidOrders    = useMemo(() => userCreatedOrders?.filter(isUnpaidOrder) || [], [userCreatedOrders]);

  const displayedOrders = useMemo(() => {
    if (activeTab === "active")    return activeOrders.filter((o) => o?.isPaid);
    if (activeTab === "unpaid")    return unpaidOrders;
    if (activeTab === "cancelled") return cancelledOrders;
    if (activeTab === "completed") return completedOrders || [];
    return [];
  }, [activeTab, activeOrders, unpaidOrders, cancelledOrders, completedOrders]);

  if (isLoading) return <LoadingState />;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <ClienttErrorPage message="Error occurred while retrieving your food orders" />
      </motion.div>
    );
  }

  if (!(userCreatedOrders?.length > 0) && !(completedOrders?.length > 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <div className="text-center max-w-lg">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-8 mx-auto w-fit"
          >
            🍽️
          </motion.div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-4">
            No Food Orders Yet
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-8 text-lg leading-relaxed">
            You haven't placed any food orders yet. Discover restaurants, clubs and spots near you and place your first order!
          </Typography>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/foodmarts/listings")}
            className="px-10 py-4 rounded-xl font-bold text-white text-base transition-all"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 4px 18px rgba(234,88,12,0.4)",
            }}
          >
            Browse Restaurants &amp; Spots
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const tabs = [
    { key: "active",    label: "Confirmed",       count: activeOrders.filter((o) => o?.isPaid).length },
    { key: "unpaid",    label: "Pending Payment",  count: unpaidOrders.length },
    { key: "completed", label: "Completed",        count: completedOrders?.length || 0 },
    { key: "cancelled", label: "Cancelled",        count: cancelledOrders.length },
  ];

  return (
    <div className="flex-auto px-4 sm:px-8 md:px-12 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header + stats ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-7">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Food Orders</h1>
              <p className="text-base sm:text-lg text-gray-600">
                Track and manage all your restaurant &amp; food orders
              </p>
            </div>

            {/* Stats chips */}
            <div className="flex flex-wrap gap-3">
              <div
                className="px-5 py-4 rounded-xl text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.05) 100%)",
                  border: "1px solid rgba(234,88,12,0.2)",
                }}
              >
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{userCreatedOrders?.length || 0}</p>
                <p className="text-sm text-gray-600 font-semibold mt-0.5">Total Orders</p>
              </div>
              <div
                className="px-5 py-4 rounded-xl text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(22,163,74,0.05) 100%)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{activeOrders.filter((o) => o?.isPaid).length}</p>
                <p className="text-sm text-gray-600 font-semibold mt-0.5">Confirmed</p>
              </div>
              {unpaidOrders.length > 0 && (
                <div
                  className="px-5 py-4 rounded-xl text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.05) 100%)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-red-500">{unpaidOrders.length}</p>
                  <p className="text-sm text-gray-600 font-semibold mt-0.5">Unpaid</p>
                </div>
              )}
            </div>
          </div>

          {/* Unpaid nudge banner */}
          {unpaidOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 px-6 py-5 rounded-2xl flex items-center gap-5"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(220,38,38,0.04) 100%)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: "1.9rem", flexShrink: 0 }}
              >
                ⚠️
              </motion.span>
              <div className="flex-1">
                <p className="text-base font-bold text-red-700">
                  You have {unpaidOrders.length} unpaid food {unpaidOrders.length === 1 ? "order" : "orders"}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Complete payment before items expire or the restaurant cancels your booking.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab("unpaid")}
                className="text-sm font-bold px-5 py-2.5 rounded-lg text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
              >
                View Unpaid
              </motion.button>
            </motion.div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-6 py-3.5 font-semibold text-base transition-all relative whitespace-nowrap ${
                  activeTab === tab.key ? "text-orange-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  <span
                    className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                      activeTab === tab.key ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="foodOrderTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Orders list ── */}
        <AnimatePresence mode="wait">
          {displayedOrders.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 sm:space-y-7"
            >
              {displayedOrders.map((order, index) => (
                <motion.div
                  key={order?.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{ border: "1px solid rgba(229,231,235,1)" }}
                >
                  <FoodOrderCard orderData={order} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-empty`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 px-4"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl"
                style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(234,88,12,0.05) 100%)" }}
              >
                {activeTab === "cancelled" ? "🚫" : activeTab === "unpaid" ? "⏳" : activeTab === "completed" ? "✅" : "🍽️"}
              </div>
              <Typography variant="h5" className="font-bold text-gray-800 mb-3 text-center">
                {activeTab === "active"    && "No Confirmed Orders"}
                {activeTab === "unpaid"    && "No Pending Payments"}
                {activeTab === "cancelled" && "No Cancelled Orders"}
                {activeTab === "completed" && "No Completed Orders Yet"}
              </Typography>
              <Typography variant="body1" className="text-gray-600 text-center max-w-sm leading-relaxed">
                {activeTab === "active"    && "You don't have any confirmed food orders yet. Browse restaurants and place an order!"}
                {activeTab === "unpaid"    && "All your food orders are paid — great job!"}
                {activeTab === "cancelled" && "You have no cancelled food orders."}
                {activeTab === "completed" && "Orders appear here once they are delivered and settled with the restaurant."}
              </Typography>
              {activeTab === "active" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/foodmarts/listings")}
                  className="mt-8 px-9 py-4 rounded-xl font-bold text-white text-base"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    boxShadow: "0 4px 18px rgba(234,88,12,0.38)",
                  }}
                >
                  Browse Restaurants &amp; Spots
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DemoContent;
