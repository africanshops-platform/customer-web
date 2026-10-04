import { MODE_LABEL } from "./kitchenFlow";

const STYLE = {
  READY: { bg: "rgba(34,197,94,0.12)", fg: "#15803d", icon: "⚡" },
  A_LA_CARTE: { bg: "rgba(249,115,22,0.14)", fg: "#c2410c", icon: "🔥" },
  COOK_TO_ORDER: { bg: "rgba(124,58,237,0.12)", fg: "#6d28d9", icon: "👩‍🍳" },
};

/** What a dish is, at a glance: ready now, made to order (N min), or chef-booked (N h ahead). */
export function fulfillmentDetail(item) {
  const mode = item?.fulfillmentMode || "READY";
  if (mode === "A_LA_CARTE" && item?.prepMinutes) return `about ${item.prepMinutes} min after you pay`;
  if (mode === "COOK_TO_ORDER" && item?.leadTimeHours) return `book ${item.leadTimeHours}h+ ahead · ready within 3 days`;
  return mode === "READY" ? "served as soon as it is packed" : "";
}

function FulfillmentBadge({ item, withDetail = false, large = false }) {
  const mode = item?.fulfillmentMode || "READY";
  const st = STYLE[mode] || STYLE.READY;
  return (
    <span className="inline-flex flex-wrap items-center gap-2" data-testid="fulfillment-badge">
      <span
        className="inline-flex items-center gap-1 rounded-full font-bold"
        style={{ background: st.bg, color: st.fg, padding: large ? "6px 14px" : "3px 10px", fontSize: large ? "1.5rem" : "1.2rem" }}
      >
        <span aria-hidden>{st.icon}</span>
        {MODE_LABEL[mode]}
      </span>
      {withDetail && fulfillmentDetail(item) && (
        <span className="text-gray-600" style={{ fontSize: large ? "1.4rem" : "1.2rem" }}>
          {fulfillmentDetail(item)}
        </span>
      )}
    </span>
  );
}

export default FulfillmentBadge;
