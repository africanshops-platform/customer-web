import { Typography, Divider, Chip } from "@mui/material";
import { Store, LocationOn, Verified, Star, Phone, TrendingUp } from "@mui/icons-material";
import ShopLocationMap from "../../../components/maps/ShopLocationMap";
import ShopLocationMapLoadingPlaceholder from "../../../components/maps/ShopLocationMapLoadingPlaceholder";
import { motion } from "framer-motion";

/**
 * DemoSidebar Component
 * Left sidebar for single product page showing the real seller and its market location.
 * Ratings, sales and response time are not shown until the platform records them.
 */
function DemoSidebar(props) {
  const { shopData, isLoading } = props;

  const shop = shopData;

  if (!shop && !isLoading) return null;

  const showLoading = Boolean(isLoading);

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
        }}
      >
        <Store sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
          }}
        >
          Seller Location
        </Typography>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl mb-6">
        {showLoading ? (
          <ShopLocationMapLoadingPlaceholder />
        ) : shop?.coordinates ? (
          <ShopLocationMap shopData={shop} />
        ) : null}
      </div>

      {/* Shop Details Card */}
      {shop && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
        >
          {/* Shop Name & Verification */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {shop.shopName}
              </Typography>
              {shop.isVerified && <Verified sx={{ color: "#10b981", fontSize: "1.25rem" }} />}
            </div>
            {shop.isVerified && (
              <Chip
                label="Verified Seller"
                size="small"
                sx={{
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </div>

          <Divider />

          {/* Location Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <LocationOn sx={{ color: "#ea580c", fontSize: "1.25rem", marginTop: "2px" }} />
              <div>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.5,
                  }}
                >
                  {shop.marketName && (
                    <>
                      {shop.marketName}
                      <br />
                    </>
                  )}
                  {shop.address}
                </Typography>
              </div>
            </div>
          </div>

          <Divider />

          {/* Contact Seller Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Phone sx={{ color: "white", fontSize: "1.25rem" }} />
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              Contact Seller
            </Typography>
          </motion.button>

          {/* Member Since */}
          {shop.memberSince && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Member since {shop.memberSince}
            </Typography>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default DemoSidebar;
