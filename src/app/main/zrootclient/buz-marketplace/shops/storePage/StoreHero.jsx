import { Button, Chip } from "@mui/material";
import { Verified } from "@mui/icons-material";
import { PLATFORM_ORDER_TEL } from "../../../shared-contact/platformContact";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * The shop's identity card: cover, logo, name, the Verified badge (only when the shop really is verified),
 * where it trades from, how long it has been a member and how many listings it has.
 */
function StoreHero({ shopData, listingsTotal }) {
  const meta = [
    shopData?.marketName,
    shopData?.memberSince ? `Member since ${shopData.memberSince}` : null,
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6" data-testid="store-hero">
      <div
        role="img"
        aria-label="Shop cover"
        style={{
          height: 150,
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,.28) 0 14%, transparent 15%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.18) 0 18%, transparent 19%), linear-gradient(120deg, #ea580c, #f59e0b 60%, #dc2626)",
        }}
      />
      <div
        className="px-5 sm:px-6 pb-5 flex flex-wrap items-start gap-4"
        style={{ marginTop: -38 }}
      >
        <div
          className="rounded-3xl bg-white flex items-center justify-center shadow-lg shrink-0"
          style={{ width: 84, height: 84, border: "4px solid white" }}
        >
          <div
            className="w-full h-full rounded-2xl bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center"
            style={{ fontSize: 28 }}
          >
            {initials(shopData?.shopName) || "S"}
          </div>
        </div>
        <div className="flex-1 min-w-[220px]" style={{ paddingTop: 44 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-gray-900 m-0" style={{ fontSize: 24 }}>
              {shopData?.shopName}
            </h1>
            {shopData?.isVerified && (
              <Chip
                icon={<Verified fontSize="small" />}
                label="Verified"
                size="small"
                sx={{
                  backgroundColor: "#e2f6ee",
                  color: "#0f9d6b",
                  fontWeight: 700,
                  "& .MuiChip-icon": { color: "#0f9d6b" },
                }}
              />
            )}
          </div>
          {meta.length > 0 && (
            <p className="text-sm text-gray-500 mt-1 mb-0">{meta.join("  ·  ")}</p>
          )}
        </div>
        <div style={{ paddingTop: 48 }}>
          <Button
            href={PLATFORM_ORDER_TEL}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 99,
              backgroundColor: "#ea580c",
              boxShadow: "0 6px 16px rgba(249,115,22,.45)",
              "&:hover": { backgroundColor: "#c2410c" },
            }}
          >
            Call to order
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 border-t border-gray-100">
        <div className="px-6 py-3">
          <b
            className="block text-xl font-extrabold text-gray-900"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {listingsTotal ?? "–"}
          </b>
          <span className="text-xs text-gray-500">
            {listingsTotal === 1 ? "Listing" : "Listings"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StoreHero;
