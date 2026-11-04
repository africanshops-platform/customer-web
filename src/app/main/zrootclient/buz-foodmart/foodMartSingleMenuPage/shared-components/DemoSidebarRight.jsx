import { Typography } from "@mui/material";
import { DeliveryDining, Storefront } from "@mui/icons-material";
import DeliveryRouteMap from "../../components/maps/DeliveryRouteMap";
import SellerInformation from "src/app/main/zrootclient/components/SellerInformation";

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
      <div
        className="p-1.5 rounded-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        {icon}
      </div>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "0.875rem",
          color: "#111827",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
    </div>
  );
}

/**
 * DemoSidebarRight — right sidebar for the single menu-item page.
 *
 * Structure mirrors MarketplaceDemoSidebarRight.jsx:
 *   Header  →  orange gradient bar with DeliveryDining icon
 *   flex-1  →  DeliveryRouteMap (restaurant ↔ user route, placeholder when GPS off)
 *   Bottom  →  FoodMart Official Restaurant (SellerInformation)
 */
function DemoSidebarRight({ menu, foodMart }) {
  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)" }}
    >
      {/* ── Delivery Route section — 60% ── */}
      <div className="flex-[6] flex flex-col min-h-0 mb-4">
        {/* Header — same style as MarketplaceDemoSidebarRight */}
        <div
          className="mb-4 p-4 rounded-xl flex items-center gap-3 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
          }}
        >
          <DeliveryDining sx={{ color: "white", fontSize: "1.75rem" }} />
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
            Delivery Route
          </Typography>
        </div>

        {/* Map fills the remaining 60% height — mirrors MarketplaceDemoSidebarRight */}
        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden shadow-2xl">
          <DeliveryRouteMap restaurant={foodMart} />
        </div>
      </div>

      {/* ── FoodMart Official Restaurant — 40% ── */}
      <div className="flex-[4] flex flex-col min-h-0">
        <SectionLabel
          icon={<Storefront sx={{ color: "white", fontSize: "1.1rem" }} />}
          title="FoodMart Official Restaurant"
        />
        {/* Scrollable so it never overflows on short screens */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SellerInformation
            sellerName={foodMart?.title || "Restaurant"}
            sellerDescription={
              foodMart?.description && foodMart.description.length > 80
                ? `${foodMart.description.slice(0, 80)}…`
                : foodMart?.description
            }
            address={foodMart?.address}
            rating={foodMart?.rating}
            numReviews={foodMart?.numReviews}
            memberSince={foodMart?.createdAt ? new Date(foodMart.createdAt).getFullYear() : null}
          />
        </div>
      </div>
    </div>
  );
}

export default DemoSidebarRight;
