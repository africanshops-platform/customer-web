import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Button, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import { CheckCircle, DeliveryDining, RestaurantMenu, AccessTime } from "@mui/icons-material";

const DELIVERY_STEPS = [
  { key: "ordered",    label: "Ordered",    icon: <CheckCircle sx={{ fontSize: "1.25rem" }} /> },
  { key: "preparing",  label: "Preparing",  icon: <RestaurantMenu sx={{ fontSize: "1.25rem" }} /> },
  { key: "on_the_way", label: "On the way", icon: <DeliveryDining sx={{ fontSize: "1.25rem" }} /> },
  { key: "delivered",  label: "Delivered",  icon: <CheckCircle sx={{ fontSize: "1.25rem" }} /> },
];

/** The order's real state from its flags / kitchen stage (orders have no `status` field). */
function deriveStatus(order) {
  if (order?.status) return order.status;
  if (order?.isCancelled || order?.kitchenStage === "DECLINED") return "cancelled";
  if (order?.isDelivered || order?.kitchenStage === "DELIVERED") return "delivered";
  if (order?.isShipped || order?.kitchenStage === "OUT_FOR_DELIVERY") return "on_the_way";
  if (order?.isPacked || ["IN_PREPARATION", "GONE_TO_MARKET", "ACCEPTED", "READY"].includes(order?.kitchenStage)) return "preparing";
  return order?.isPaid ? "confirmed" : "pending";
}

function resolveActiveStep(order) {
  const s = deriveStatus(order)?.toLowerCase();
  if (!s || s === "pending")   return 0;
  if (s === "confirmed" || s === "processing" || s === "preparing") return 1;
  if (s === "dispatched" || s === "on_the_way" || s === "shipped")  return 2;
  if (s === "delivered" || s === "completed")                        return 3;
  return 0;
}

function StatusBadge({ isPaid, status }) {
  const s = status?.toLowerCase();
  const base = { fontWeight: 700, fontSize: "0.82rem" };
  if (s === "cancelled" || s === "refunded")
    return <Chip label="Cancelled" sx={{ ...base, background: "rgba(239,68,68,0.1)", color: "#dc2626" }} />;
  if (s === "delivered" || s === "completed")
    return <Chip label="Delivered" sx={{ ...base, background: "rgba(34,197,94,0.1)", color: "#16a34a" }} />;
  if (s === "on_the_way")
    return <Chip label="On the way" sx={{ ...base, background: "rgba(124,58,237,0.1)", color: "#7c3aed" }} />;
  if (s === "preparing")
    return <Chip label="Preparing" sx={{ ...base, background: "rgba(249,115,22,0.14)", color: "#c2410c" }} />;
  if (isPaid)
    return <Chip label="Confirmed" sx={{ ...base, background: "rgba(249,115,22,0.1)", color: "#ea580c" }} />;
  return <Chip label="Unpaid" sx={{ ...base, background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" }} />;
}

const FoodOrderCard = ({ orderData }) => {
  const image =
    orderData?.foodOrderItems?.[0]?.image ||
    orderData?.foodCartItems?.[0]?.martMenu?.imageSrcs?.[0]?.url ||
    null;

  const restaurantName = orderData?.foodMart?.title || orderData?.rcsVendor?.title || "Restaurant";
  const customerName   = orderData?.shippingAddress?.fullName || orderData?.name || "—";
  const reference      = orderData?.paymentResult?.reference || orderData?.id?.slice(0, 10);
  const totalPrice     = orderData?.totalPrice ?? orderData?.grandTotal ?? 0;
  const itemCount      = orderData?.foodOrderItems?.length ?? orderData?.foodCartItems?.length ?? 0;
  const dateStr        = orderData?.createdAt ? new Date(orderData.createdAt).toDateString() : "—";
  const isPaid         = orderData?.isPaid;
  const status         = deriveStatus(orderData);
  const activeStep     = isPaid ? resolveActiveStep(orderData) : -1;
  const isCancelled    = status?.toLowerCase() === "cancelled" || status?.toLowerCase() === "refunded";

  return (
    <div className="p-5 sm:p-7">
      {/* Top row: image + details + CTA */}
      <div className="flex flex-col sm:flex-row gap-5">

        {/* Food image */}
        <div className="flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={restaurantName}
              className="w-full sm:w-32 h-32 object-cover rounded-xl shadow-md"
            />
          ) : (
            <div
              className="w-full sm:w-32 h-32 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
            >
              <span style={{ fontSize: "2.5rem" }}>🍽️</span>
            </div>
          )}
        </div>

        {/* Middle: main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <h3 className="text-lg font-bold text-gray-800 truncate">{restaurantName}</h3>
            <StatusBadge isPaid={isPaid} status={status} />
          </div>

          <p className="text-sm text-gray-500 mb-1.5">
            <span className="font-semibold text-gray-700">Customer:</span> {customerName}
          </p>
          <p className="text-sm text-gray-500 mb-1.5">
            <span className="font-semibold text-gray-700">Ref:</span> #{reference}
          </p>

          <div className="flex flex-wrap gap-3 mt-2.5">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <AccessTime sx={{ fontSize: "1.05rem", color: "#9ca3af" }} />
              {dateStr}
            </span>
            {itemCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(249,115,22,0.1)", color: "#ea580c" }}
              >
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-0.5">Total</p>
            <p className="text-xl font-bold text-orange-600">₦{formatCurrency(totalPrice)}</p>
          </div>

          {isPaid && !isCancelled ? (
            <Button
              component={NavLinkAdapter}
              to={`/foodmarts/user/food-orders/${orderData?.id}/view`}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                px: 3,
                py: 1,
                borderRadius: "10px",
                whiteSpace: "nowrap",
                "&:hover": {
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  boxShadow: "0 4px 14px rgba(234,88,12,0.45)",
                },
              }}
            >
              View Details
            </Button>
          ) : !isPaid ? (
            <Button
              component={NavLinkAdapter}
              to="/foodmarts/review-food-cart"
              variant="outlined"
              sx={{
                borderColor: "#ea580c",
                color: "#ea580c",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                px: 3,
                py: 1,
                borderRadius: "10px",
                whiteSpace: "nowrap",
                "&:hover": {
                  borderColor: "#c2410c",
                  backgroundColor: "rgba(249,115,22,0.06)",
                },
              }}
            >
              Pay Now
            </Button>
          ) : null}
        </div>
      </div>

      {/* Delivery progress tracker — paid, non-cancelled orders only */}
      {isPaid && !isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-6 pt-5"
          style={{ borderTop: "1px solid rgba(229,231,235,1)" }}
        >
          <div className="flex items-center justify-between">
            {DELIVERY_STEPS.map((step, idx) => {
              const done    = idx <= activeStep;
              const current = idx === activeStep;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <motion.div
                      animate={current ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.5, repeat: current ? Infinity : 0 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-sm"
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
                      style={{ color: done ? "#ea580c" : "#9ca3af", maxWidth: "64px" }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < DELIVERY_STEPS.length - 1 && (
                    <div
                      className="flex-1 h-1 mx-1.5 mb-5 rounded-full"
                      style={{
                        background:
                          idx < activeStep
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

      {/* Unpaid warning strip */}
      {!isPaid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 px-5 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(220,38,38,0.04) 100%)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-600 font-semibold">
            Payment pending — complete payment to confirm this food order.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FoodOrderCard;
