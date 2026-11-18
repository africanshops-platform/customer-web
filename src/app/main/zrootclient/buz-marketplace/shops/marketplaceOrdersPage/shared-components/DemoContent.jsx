import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import OrderCard from "../../components/OrderCard";

/**
 * Marketplace Orders Content - Production Ready
 */
function DemoContent(props) {
  const { isLoading, isError, userCreatedOrders, sealedItems } = props;
  const [activeTab, setActiveTab] = useState("active");

  // Filter orders based on status
  const activeOrders =
    userCreatedOrders?.filter(
      (order) =>
        order?.status !== "cancelled" && order?.status !== "refunded" && order?.status !== "failed",
    ) || [];

  const cancelledOrders =
    userCreatedOrders?.filter(
      (order) =>
        order?.status === "cancelled" || order?.status === "refunded" || order?.status === "failed",
    ) || [];

  const historyItems = sealedItems || [];
  const displayedOrders = activeTab === "active" ? activeOrders : cancelledOrders;

  if (isLoading) {
    return (
      <div className="flex-auto flex items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center w-full max-w-4xl mx-auto"
        >
          {/* Animated Logo/Icon */}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-8"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                opacity: 0.2,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Middle Ring */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                opacity: 0.4,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Inner Circle with Icon */}
            <div
              className="absolute inset-8 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Your Orders</h3>
            <p className="text-gray-600 mb-6">Please wait while we fetch your order history...</p>

            {/* Animated Dots */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Skeleton Cards Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 space-y-4 max-w-2xl mx-auto"
          >
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="bg-white rounded-2xl p-6 shadow-md"
                style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item * 0.2,
                }}
              >
                <div className="flex gap-4">
                  {/* Skeleton Image */}
                  <div
                    className="w-20 h-20 rounded-xl"
                    style={{
                      background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                    }}
                  />

                  {/* Skeleton Content */}
                  <div className="flex-1 space-y-3">
                    <div
                      className="h-4 rounded"
                      style={{
                        width: "60%",
                        background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                      }}
                    />
                    <div
                      className="h-3 rounded"
                      style={{
                        width: "40%",
                        background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                      }}
                    />
                    <div
                      className="h-3 rounded"
                      style={{
                        width: "30%",
                        background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <ClienttErrorPage message={"Error occurred while retrieving your orders"} />
      </motion.div>
    );
  }

  if (!(userCreatedOrders?.length > 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen px-4"
      >
        <div className="text-center max-w-md">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
            }}
          >
            <svg
              className="w-12 h-12 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <Typography variant="h5" className="font-bold text-gray-800 mb-3">
            No Orders Yet
          </Typography>
          <Typography className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </Typography>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/marketplace")}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
            }}
          >
            Start Shopping
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track and manage all your marketplace orders
              </p>
            </div>

            {/* Order Statistics */}
            <div className="flex gap-3 sm:gap-4">
              <div
                className="px-4 py-3 rounded-xl text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                  border: "1px solid rgba(234, 88, 12, 0.2)",
                }}
              >
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {userCreatedOrders?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">Total Orders</p>
              </div>
              <div
                className="px-4 py-3 rounded-xl text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {activeOrders?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">Active</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("active")}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all relative ${
                activeTab === "active" ? "text-orange-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                Active Orders
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "active"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {activeOrders?.length || 0}
                </span>
              </span>
              {activeTab === "active" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all relative ${
                activeTab === "cancelled" ? "text-orange-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                Cancelled Orders
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "cancelled"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cancelledOrders?.length || 0}
                </span>
              </span>
              {activeTab === "cancelled" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("history")}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all relative ${
                activeTab === "history" ? "text-orange-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                Order History
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "history" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {historyItems.length}
                </span>
              </span>
              {activeTab === "history" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        </motion.div>

        {activeTab === "history" ? (
          <div className="space-y-3 sm:space-y-4" data-testid="order-history">
            {historyItems.length === 0 ? (
              <Typography className="text-gray-600 text-center py-16">
                Finished orders appear here once the seller has been paid out.
              </Typography>
            ) : (
              historyItems.map((row) => {
                const it = row.sealedOrderItem || {};
                const when = row.cashesOutAndSealedAt ? new Date(row.cashesOutAndSealedAt) : null;
                let label = "Completed · Settled";
                if (it.isCanceled) label = "Cancelled";
                else if (it.isReturned) label = "Returned";
                return (
                  <div
                    key={row.id}
                    className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4"
                    style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
                  >
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{it.name}</p>
                      <p className="text-sm text-gray-500">
                        {it.quantity} × ₦{Number(it.price || 0).toLocaleString("en-NG")}
                        {when ? ` · ${when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {/* Orders List */}
        <AnimatePresence mode="wait">
          {activeTab === "history" ? null : displayedOrders?.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              {displayedOrders.map((order, index) => (
                <motion.div
                  key={order?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{
                    border: "1px solid rgba(229, 231, 235, 1)",
                  }}
                >
                  <OrderCard orderData={order} />
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
              className="flex flex-col items-center justify-center py-16 px-4"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
                }}
              >
                <svg
                  className="w-10 h-10 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <Typography variant="h6" className="font-bold text-gray-800 mb-2 text-center">
                {activeTab === "active" ? "No Active Orders" : "No Cancelled Orders"}
              </Typography>
              <Typography className="text-gray-600 text-center max-w-md">
                {activeTab === "active"
                  ? "You don't have any active orders at the moment."
                  : "You don't have any cancelled orders."}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DemoContent;
