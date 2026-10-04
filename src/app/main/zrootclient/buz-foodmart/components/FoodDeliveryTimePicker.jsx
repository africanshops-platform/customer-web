import { useMemo } from "react";
import { motion } from "framer-motion";

const HOUR = 3_600_000;
const MAX_HOURS = 72;
const pad = (n) => String(n).padStart(2, "0");
/** value for <input type="datetime-local"> in the viewer's own time zone */
const toLocalInput = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Chef-booked dishes are made over hours, not minutes. The customer says when they want it; the server clamps
 * that to [longest lead time, 72 hours] after payment, so the picker simply offers that window.
 */
function FoodDeliveryTimePicker({ cartItems, value, onChange }) {
  const cook = useMemo(() => (cartItems || []).filter((i) => i?.martMenu?.fulfillmentMode === "COOK_TO_ORDER"), [cartItems]);
  const lead = useMemo(() => Math.max(1, ...cook.map((i) => Number(i?.martMenu?.leadTimeHours) || 1)), [cook]);
  if (!cook.length) return null;

  const now = Date.now();
  const min = now + lead * HOUR;
  const max = now + MAX_HOURS * HOUR;
  const earliest = new Date(min).toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden mt-6"
      style={{ border: "2px solid rgba(234,88,12,0.18)" }}
      data-testid="food-delivery-time"
    >
      <div className="p-4 sm:p-6" style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)" }}>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">👩‍🍳 Your chef-booked dishes</h2>
        <p className="text-sm text-gray-700 mt-1">
          {cook.map((i) => i?.martMenu?.title).join(", ")} {cook.length > 1 ? "are" : "is"} prepared to order — the chef sources ingredients and cooks it for you.
          The earliest it can reach you is about {lead} hour{lead > 1 ? "s" : ""} after you pay ({earliest}); never more than 3 days.
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-3">
        <label className="block text-sm font-semibold text-gray-700" htmlFor="food-deliver-by">
          When do you want it delivered?
        </label>
        <input
          id="food-deliver-by"
          type="datetime-local"
          value={value || ""}
          min={toLocalInput(min)}
          max={toLocalInput(max)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-2 px-4 py-3 text-base"
          style={{ borderColor: "#e5e7eb" }}
        />
        <p className="text-sm text-gray-600">
          Leave it empty and the chef delivers as soon as it is ready. After you pay, the chef has 2 hours to accept your booking — if they
          cannot, you are refunded in full automatically.
        </p>
      </div>
    </motion.div>
  );
}

export default FoodDeliveryTimePicker;
