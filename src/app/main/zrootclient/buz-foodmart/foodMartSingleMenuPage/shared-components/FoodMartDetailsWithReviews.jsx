import { useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Rating,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  EmojiEmotions,
  Image as ImageIcon,
  LocalDining,
  RateReview,
  Reply,
  RestaurantMenu,
  Send,
  Star,
  ThumbUp,
  VerifiedUser,
  Whatshot,
  SoupKitchen,
  Inventory,
  Storefront,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import FoodMenuReviewsPanel from "./FoodMenuReviewsPanel";
import { useGetFoodMenuReviews } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";

function TabButton({ active, onClick, icon, label, isMobile }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-xl p-4 transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
          : "bg-white hover:bg-gray-50 border-2 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        {icon}
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          className={`font-bold ${active ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </Typography>
      </div>
      {active && (
        <motion.div
          layoutId="foodmartActiveTab"
          className="h-1 bg-white/70 rounded-full mt-2"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  );
}

function SpecCard({ label, value, colorClass = "border-gray-200 bg-white", labelColor = "text-gray-500", valueColor = "text-gray-900", icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 border-2 rounded-xl hover:shadow-md transition-all duration-300 ${colorClass}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <Typography variant="caption" className={`font-semibold uppercase tracking-wide ${labelColor}`}>
          {label}
        </Typography>
      </div>
      <Typography variant="h6" className={`font-black leading-tight ${valueColor}`}>
        {value}
      </Typography>
    </motion.div>
  );
}

/**
 * FoodMartDetailsWithReviews — tabbed detail + review panel for a single RCS menu item.
 * Modelled after ProductDetailsWithReviews (marketplace) with food/RCS-specific copy and palette.
 */
const FoodMartDetailsWithReviews = ({ menuData }) => {
  const user = useAppSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [active, setActive] = useState(1);
  const { data: reviewsRes } = useGetFoodMenuReviews(menuData?.id);
  const reviewCount = reviewsRes?.data?.count ?? 0;

  return (
    <div className="p-0">

      {/* ── Tab bar ── */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
        <div className="flex gap-3 p-6">
          <TabButton
            active={active === 1}
            onClick={() => setActive(1)}
            isMobile={isMobile}
            icon={
              <LocalDining
                sx={{
                  fontSize: isMobile ? "1.5rem" : "1.75rem",
                  color: active === 1 ? "white" : "#ea580c",
                }}
              />
            }
            label="Dish Details"
          />
          <TabButton
            active={active === 2}
            onClick={() => setActive(2)}
            isMobile={isMobile}
            icon={
              <RateReview
                sx={{
                  fontSize: isMobile ? "1.5rem" : "1.75rem",
                  color: active === 2 ? "white" : "#ea580c",
                }}
              />
            }
            label={`Diner Reviews (${reviewCount})`}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── DISH DETAILS TAB ── */}
        {active === 1 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-white"
          >
            <div className={isMobile ? "p-6" : "p-10"}>

              {/* About this dish */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <RestaurantMenu sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
                  <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                    About This Dish
                  </Typography>
                </div>
                <div
                  className="p-6 rounded-2xl border-l-4 border-orange-500"
                  style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
                >
                  <Typography
                    variant={isMobile ? "body2" : "body1"}
                    className="text-gray-700 leading-relaxed"
                    sx={{ fontSize: isMobile ? "0.95rem" : "1.1rem", lineHeight: 1.85 }}
                  >
                    {menuData?.description || "No description available for this dish yet."}
                  </Typography>
                </div>
              </div>

              {/* Dish info grid */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <VerifiedUser sx={{ color: "#10b981", fontSize: "1.75rem" }} />
                  <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                    Dish Information
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuData?.foodMartCategory && (
                    <SpecCard
                      label="Category"
                      value={menuData.foodMartCategory}
                      icon={<SoupKitchen sx={{ fontSize: "1rem", color: "#ea580c" }} />}
                      colorClass="border-orange-200 bg-orange-50 hover:border-orange-400"
                      labelColor="text-orange-700"
                      valueColor="text-orange-900"
                    />
                  )}

                  {menuData?.unitPerQuantity && (
                    <SpecCard
                      label="Serving Size"
                      value={menuData.unitPerQuantity}
                      icon={<LocalDining sx={{ fontSize: "1rem", color: "#f59e0b" }} />}
                      colorClass="border-amber-200 bg-amber-50 hover:border-amber-400"
                      labelColor="text-amber-700"
                      valueColor="text-amber-900"
                    />
                  )}

                  {menuData?.quantity && (
                    <SpecCard
                      label="Available Portions"
                      value={`${menuData.quantity}${menuData.unitPerQuantity ? ` ${menuData.unitPerQuantity}` : ""} left`}
                      icon={<Inventory sx={{ fontSize: "1rem", color: "#10b981" }} />}
                      colorClass="border-green-200 bg-green-50 hover:border-green-400"
                      labelColor="text-green-700"
                      valueColor="text-green-900"
                    />
                  )}

                  {menuData?.price && (
                    <SpecCard
                      label="Price"
                      value={`₦${formatCurrency(menuData.price)} per ${menuData?.unitPerQuantity || "serving"}`}
                      icon={<Whatshot sx={{ fontSize: "1rem", color: "#dc2626" }} />}
                      colorClass="border-red-200 bg-red-50 hover:border-red-400"
                      labelColor="text-red-700"
                      valueColor="text-red-900"
                    />
                  )}

                  {(menuData?.foodMartVendor?.name || menuData?.foodMartVendor) && (
                    <SpecCard
                      label="Restaurant"
                      value={
                        typeof menuData.foodMartVendor === "object"
                          ? menuData.foodMartVendor?.name || "Official Restaurant"
                          : "Official Restaurant"
                      }
                      icon={<Storefront sx={{ fontSize: "1rem", color: "#3b82f6" }} />}
                      colorClass="border-blue-200 bg-blue-50 hover:border-blue-400"
                      labelColor="text-blue-700"
                      valueColor="text-blue-900"
                    />
                  )}
                </div>
              </div>

              {/* Dining experience note */}
              <div
                className="p-6 rounded-2xl flex items-start gap-4"
                style={{ background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", border: "2px solid #e9d5ff" }}
              >
                <Whatshot sx={{ color: "#a855f7", fontSize: "2rem", flexShrink: 0, mt: 0.5 }} />
                <div>
                  <Typography variant="subtitle1" className="font-bold text-purple-900 mb-1">
                    Dining Experience
                  </Typography>
                  <Typography variant="body2" className="text-purple-700 leading-relaxed">
                    Freshly prepared by our kitchen team. Best enjoyed immediately after serving.
                    Call <span className="font-bold">07087200297</span> to customise your order or make special dietary requests.
                  </Typography>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ── REVIEWS TAB ── (real, order-gated reviews) */}
        {active === 2 && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-white"
          >
            <FoodMenuReviewsPanel menuId={menuData?.id} isMobile={isMobile} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default FoodMartDetailsWithReviews;
