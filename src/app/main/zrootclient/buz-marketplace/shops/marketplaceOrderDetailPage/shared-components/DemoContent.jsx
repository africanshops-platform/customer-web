import FuseLoading from "@fuse/core/FuseLoading";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import {
  useCancleOrderItem,
  useRequestRefundOnOrderItem,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import RaiseDisputeDialog from "src/app/main/zrootclient/buz-disputes/RaiseDisputeDialog";

/**
 * Order Detail Content - Production Ready
 */
function DemoContent(props) {
  const { isLoading, isError, userOrder, orderId } = props;
  const cancelOrderItem = useCancleOrderItem();
  const requestRefund = useRequestRefundOnOrderItem();

  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

  const handleCancelDialogOpen = (itemId) => {
    setSelectedItemId(itemId);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedItemId(null);
  };

  const handleRefundDialogOpen = (itemId) => {
    setSelectedItemId(itemId);
    setRefundDialogOpen(true);
  };

  const handleRefundDialogClose = () => {
    setRefundDialogOpen(false);
    setSelectedItemId(null);
  };

  const confirmCancellation = () => {
    if (selectedItemId) {
      cancelOrderItem.mutate(selectedItemId);
      handleCancelDialogClose();
    }
  };

  const confirmRefundRequest = () => {
    if (selectedItemId) {
      requestRefund.mutate(selectedItemId);
      handleRefundDialogClose();
    }
  };

  // Get order status details
  const getOrderStatusInfo = () => {
    if (!userOrder) return null;

    if (userOrder?.isDelivered) {
      return {
        label: "Delivered",
        color: "#16a34a",
        bgColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.3)",
      };
    }
    if (userOrder?.hasArrivedWarehouse) {
      return {
        label: "At Warehouse",
        color: "#2563eb",
        bgColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      };
    }
    if (userOrder?.isShipped) {
      return {
        label: "Shipped",
        color: "#a855f7",
        bgColor: "rgba(168, 85, 247, 0.1)",
        borderColor: "rgba(168, 85, 247, 0.3)",
      };
    }
    if (userOrder?.isPacked) {
      return {
        label: "Packaged",
        color: "#ea580c",
        bgColor: "rgba(249, 115, 22, 0.1)",
        borderColor: "rgba(249, 115, 22, 0.3)",
      };
    }
    return {
      label: "Processing",
      color: "#6b7280",
      bgColor: "rgba(107, 114, 128, 0.1)",
      borderColor: "rgba(107, 114, 128, 0.3)",
    };
  };

  const statusInfo = getOrderStatusInfo();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <FuseLoading />
  //     </div>
  //   );
  // }
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
        <ClienttErrorPage message={"Error occurred while retrieving order details"} />
      </motion.div>
    );
  }

  if (!userOrder) {
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <Typography variant="h5" className="font-bold text-gray-800 mb-3">
            Order Not Found
          </Typography>
          <Typography className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </Typography>
          <NavLinkAdapter to="/marketplace/user/orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
              }}
            >
              View All Orders
            </motion.button>
          </NavLinkAdapter>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <NavLinkAdapter to="/marketplace/user/orders">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-semibold">Back to Orders</span>
            </motion.button>
          </NavLinkAdapter>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Order ID: {userOrder?.paymentResult?.reference || "N/A"}
              </p>
            </div>

            {/* Status Badge */}
            {statusInfo && (
              <div
                className="px-4 py-2 rounded-xl font-semibold text-center"
                style={{
                  background: statusInfo.bgColor,
                  border: `2px solid ${statusInfo.borderColor}`,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </div>
            )}
          </div>

          {/* Order Meta Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Placed on:{" "}
                {new Date(userOrder?.createdAt)?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-bold text-orange-600">
                Total: ₦{formatCurrency(userOrder?.totalPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>

          {userOrder?.orderItems?.map((orderItem, index) => (
            <motion.div
              key={orderItem?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
              style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <img
                      src={orderItem?.image}
                      alt={orderItem?.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{orderItem?.name}</h3>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Price: </span>
                        <span className="font-bold text-gray-900">
                          ₦{formatCurrency(orderItem?.price)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Qty: </span>
                        <span className="font-bold text-gray-900">{orderItem?.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Total: </span>
                        <span className="font-bold text-orange-600">
                          ₦{formatCurrency(orderItem?.price * orderItem?.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {orderItem?.isDelivered && (
                        <div
                          className="px-4 py-2 rounded-lg font-semibold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)",
                            color: "#16a34a",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          ✓ Fulfilled
                        </div>
                      )}
                      {!orderItem?.isDelivered && !orderItem?.isCanceled && (
                        <div
                          className="px-4 py-2 rounded-lg font-semibold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
                            color: "#ea580c",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                          }}
                        >
                          Processing
                        </div>
                      )}
                      {orderItem?.isCanceled && (
                        <div
                          className="px-4 py-2 rounded-lg font-semibold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)",
                            color: "#dc2626",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                          }}
                        >
                          Cancelled
                        </div>
                      )}
                      {orderItem?.isRefundRequested && (
                        <div
                          className="px-4 py-2 rounded-lg font-semibold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)",
                            color: "#2563eb",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                          }}
                        >
                          Refund Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {!orderItem?.isCanceled && !orderItem?.isDelivered && !userOrder?.isShipped && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCancelDialogOpen(orderItem?.id)}
                      className="px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)",
                        color: "#dc2626",
                        border: "2px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      Cancel Item
                    </motion.button>
                  )}

                  {orderItem?.isCanceled && !orderItem?.isRefundRequested && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRefundDialogOpen(orderItem?._id)}
                      className="px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "white",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
                      }}
                    >
                      Request Refund
                    </motion.button>
                  )}

                  {/* Gated on the ORDER-level flag, not orderItem?.isDelivered
                      (item-level) — the dispute-eligibility check on the
                      backend reads the parent order's isDelivered, and in
                      practice item-level delivery flags can lag behind the
                      order-level one, so item-level would hide this button
                      on orders the backend would actually accept. */}
                  {userOrder?.isDelivered && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDisputeDialogOpen(true)}
                      className="px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: "white",
                        color: "#dc2626",
                        border: "1px solid rgba(220, 38, 38, 0.4)",
                      }}
                    >
                      Report an issue
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <RaiseDisputeDialog
          open={disputeDialogOpen}
          onClose={() => setDisputeDialogOpen(false)}
          orderId={orderId}
          orderType="PRODUCT"
        />

        {/* Payment & Order Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6"
            style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Payment Information</h3>
            </div>

            <div className="space-y-3">
              {userOrder?.paymentResult?.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">
                    {userOrder.paymentResult.paymentMethod}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-orange-600">
                  ₦{formatCurrency(userOrder?.totalPrice)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Order Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6"
            style={{ border: "1px solid rgba(229, 231, 235, 1)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Order Progress</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Packaged:</span>
                <span
                  className={`font-semibold ${userOrder?.isPacked ? "text-green-600" : "text-gray-400"}`}
                >
                  {userOrder?.isPacked ? "✓ Packaged" : "Pending..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipment:</span>
                <span
                  className={`font-semibold ${userOrder?.isShipped ? "text-green-600" : "text-gray-400"}`}
                >
                  {userOrder?.isShipped ? "✓ Shipped" : "Pending..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Warehouse Arrival:</span>
                <span
                  className={`font-semibold ${userOrder?.hasArrivedWarehouse ? "text-green-600" : "text-gray-400"}`}
                >
                  {userOrder?.hasArrivedWarehouse ? "✓ Arrived" : "Pending..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Delivery:</span>
                <span
                  className={`font-semibold ${userOrder?.isDelivered ? "text-green-600" : "text-gray-400"}`}
                >
                  {userOrder?.isDelivered ? "✓ Delivered" : "Pending..."}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              overflow: "hidden",
            },
          }}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-bold text-xl">Cancel Order Item?</span>
          </DialogTitle>

          <DialogContent sx={{ padding: "32px 24px" }}>
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              Are you sure you want to cancel this item?
            </Typography>
            <Typography variant="body1" className="text-gray-700 leading-relaxed mb-4">
              Once cancelled, this item will no longer be processed. This action cannot be undone.
            </Typography>
            <div
              className="p-4 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                border: "2px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <Typography variant="body2" className="text-gray-700">
                <strong>Note:</strong> You can request a refund after cancellation if payment was
                made.
              </Typography>
            </div>
          </DialogContent>

          <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
            <Button
              onClick={handleCancelDialogClose}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#9ca3af",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#6b7280",
                  backgroundColor: "#f3f4f6",
                },
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 24px",
              }}
            >
              Keep Item
            </Button>
            <Button
              onClick={confirmCancellation}
              variant="contained"
              fullWidth
              disabled={cancelOrderItem.isLoading}
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                  boxShadow: "0 8px 20px rgba(220, 38, 38, 0.4)",
                },
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 24px",
              }}
            >
              {cancelOrderItem.isLoading ? "Cancelling..." : "Yes, Cancel Item"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Refund Request Dialog */}
        <Dialog
          open={refundDialogOpen}
          onClose={handleRefundDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              overflow: "hidden",
            },
          }}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-bold text-xl">Request Refund</span>
          </DialogTitle>

          <DialogContent sx={{ padding: "32px 24px" }}>
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              Request a refund for this item?
            </Typography>
            <Typography variant="body1" className="text-gray-700 leading-relaxed mb-4">
              Your refund request will be reviewed by our team. Once approved, the funds will be
              repatriated to your wallet.
            </Typography>
            <div
              className="p-4 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
                border: "2px solid rgba(249, 115, 22, 0.2)",
              }}
            >
              <Typography variant="body2" className="text-gray-700">
                <strong>Note:</strong> Refunds typically take 3-5 business days to process after
                approval.
              </Typography>
            </div>
          </DialogContent>

          <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
            <Button
              onClick={handleRefundDialogClose}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#9ca3af",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#6b7280",
                  backgroundColor: "#f3f4f6",
                },
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 24px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRefundRequest}
              variant="contained"
              fullWidth
              disabled={requestRefund.isLoading}
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                },
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 24px",
              }}
            >
              {requestRefund.isLoading ? "Submitting..." : "Submit Refund Request"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Chat Support Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-full font-semibold text-white shadow-2xl flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Chat with us</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default DemoContent;
