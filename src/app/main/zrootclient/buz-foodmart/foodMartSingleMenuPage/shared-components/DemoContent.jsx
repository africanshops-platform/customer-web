import FulfillmentBadge from "../../components/FulfillmentBadge";
import { motion } from "framer-motion";
import { useState } from "react";
import { useGetFoodMenuReviews } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { Button, Typography, Chip, Rating, IconButton, Divider } from "@mui/material";
import {
  LocalOffer,
  Verified,
  LocalShipping,
  Inventory,
  Phone,
  WhatsApp,
  Share,
  FavoriteBorder,
  Favorite,
  ZoomIn,
} from "@mui/icons-material";
import FuseLoading from "@fuse/core/FuseLoading";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import AddToFoodCartButton from "../../components/AddToFoodCartButton";
import FoodMartDetailsWithReviews from "./FoodMartDetailsWithReviews";
import FoodMartImageGalleryView from "./FoodMartImageGalleryView";

const PLACEHOLDER_IMG = "https://placehold.co/500x500/fff7ed/ea580c?text=No+Image";

/**
 * DemoContent — Single RCS menu item detail page.
 * Modelled after buz-marketplace/shops/singleProductPage/DemoContentSingleProduct.jsx
 */
function DemoContent({ isLoading, isError, menuData, onAddToFoodCart, addFoodCartLoading, foodCart }) {
  const { data: reviewsRes } = useGetFoodMenuReviews(menuData?.id);
  const reviewCount = reviewsRes?.data?.count ?? 0;
  const averageRating = reviewsRes?.data?.averageRating ?? 0;
  const [select, setSelect] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) return <FuseLoading />;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message="Error occurred while retrieving menu item details" />
      </motion.div>
    );
  }

  if (!menuData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          Menu item not found!
        </Typography>
      </motion.div>
    );
  }

  const hasDiscount = menuData?.listprice && menuData?.listprice > menuData?.price;
  const discountPercent = hasDiscount
    ? Math.round(((menuData.listprice - menuData.price) / menuData.listprice) * 100)
    : 0;

  return (
    <div className="flex-auto p-0 sm:p-0 bg-gradient-to-b from-gray-50 to-white">

      {/* Breadcrumb */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <Typography variant="body2" className="text-gray-600">
          <span className="hover:text-orange-600 cursor-pointer">Home</span>
          {" / "}
          <span className="hover:text-orange-600 cursor-pointer">Restaurants & Clubs</span>
          {" / "}
          <span className="text-gray-900 font-semibold">{menuData?.title}</span>
        </Typography>
      </div>

      <div className="p-8">
        {/* ── Main product card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row p-8 gap-10">

            {/* ── LEFT: Image gallery ── */}
            <div className="w-full lg:w-1/2">
              {/* Main image */}
              <motion.div
                className="relative rounded-2xl overflow-hidden bg-gray-50 group"
                style={{ height: "500px" }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={menuData?.imageSrcs?.[select]?.url || PLACEHOLDER_IMG}
                  alt={menuData?.title}
                  className="w-full h-full object-cover cursor-pointer"
                  style={{ objectFit: "cover" }}
                  onClick={() => setGalleryOpen(true)}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="contained"
                    startIcon={<ZoomIn />}
                    onClick={() => setGalleryOpen(true)}
                    sx={{
                      backgroundColor: "white",
                      color: "#ea580c",
                      "&:hover": { backgroundColor: "#f3f4f6" },
                      fontWeight: 700,
                      fontSize: "1rem",
                      padding: "12px 32px",
                      borderRadius: "12px",
                    }}
                  >
                    View Full Gallery
                  </Button>
                </div>

                {/* Discount badge */}
                {hasDiscount && (
                  <Chip
                    icon={<LocalOffer fontSize="small" />}
                    label={`${discountPercent}% OFF`}
                    size="medium"
                    className="absolute top-4 left-4"
                    sx={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "20px 8px",
                      boxShadow: "0 4px 15px rgba(220,38,38,0.4)",
                    }}
                  />
                )}

                {/* Favourite */}
                <IconButton
                  onClick={() => setIsFavorite((v) => !v)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
                  size="large"
                >
                  {isFavorite ? (
                    <Favorite sx={{ color: "#ef4444", fontSize: "2rem" }} />
                  ) : (
                    <FavoriteBorder sx={{ fontSize: "2rem" }} />
                  )}
                </IconButton>
              </motion.div>

              {/* Thumbnails */}
              <div className="flex mt-6 space-x-4 overflow-x-auto pb-2">
                {menuData?.imageSrcs?.map((img, index) => (
                  <motion.div
                    key={img?.public_id || index}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={img?.url}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-24 h-24 rounded-xl object-cover cursor-pointer border-4 transition-all duration-300 ${
                        select === index
                          ? "border-orange-600 shadow-lg scale-105"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      style={{ minWidth: "96px", objectFit: "cover" }}
                      onClick={() => setSelect(index)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Product information ── */}
            <div className="w-full lg:w-1/2 flex flex-col">

              {/* Badges */}
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Chip
                  icon={<Verified fontSize="small" />}
                  label="Official Store"
                  sx={{ backgroundColor: "#10b981", color: "white", fontWeight: 600, fontSize: "0.875rem",
                    "&:hover": { backgroundColor: "#059669" } }}
                />
                <Chip
                  icon={<Verified fontSize="small" />}
                  label="Verified Menu"
                  sx={{ backgroundColor: "#3b82f6", color: "white", fontWeight: 600, fontSize: "0.875rem" }}
                />
                <Chip
                  icon={<LocalShipping fontSize="small" />}
                  label="Fast Delivery"
                  sx={{ backgroundColor: "#f59e0b", color: "white", fontWeight: 600, fontSize: "0.875rem" }}
                />
              </div>

              {/* Title */}
              <Typography
                variant="h3"
                className="font-bold text-gray-900 mb-4 leading-tight"
                sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}
              >
                {menuData?.title}
              </Typography>

              {/* Category / Similar */}
              <div className="flex items-center gap-2 mb-6">
                <Typography variant="body1" className="text-gray-600">
                  Category:{" "}
                  <span className="font-semibold text-gray-900">
                    {menuData?.foodMartCategory || "Food & Beverages"}
                  </span>
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography
                  variant="body1"
                  className="text-orange-600 cursor-pointer hover:underline font-medium"
                >
                  Similar items
                </Typography>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-xl">
                <Rating
                  value={averageRating}
                  precision={0.1}
                  size="large"
                  readOnly
                  sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" } }}
                />
                <Typography variant="body1" className="text-gray-700 font-medium">
                  {reviewCount ? `${averageRating.toFixed(1)} out of 5` : "No ratings yet"}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                </Typography>
              </div>

              {/* Price block */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl mb-6 border-2 border-orange-200">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <Typography
                    variant="h2"
                    className="font-black"
                    sx={{
                      fontSize: { xs: "2rem", md: "2.75rem" },
                      background: "linear-gradient(to right, #ea580c, #dc2626)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ₦{formatCurrency(menuData?.price)}
                  </Typography>
                  <Typography variant="h6" className="text-gray-600 font-medium">
                    per {menuData?.unitPerQuantity || "serving"}
                  </Typography>
                </div>

                <div className="mt-3">
                  <FulfillmentBadge item={menuData} withDetail large />
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-3 mt-3">
                    <Typography variant="h6" className="line-through text-gray-500">
                      ₦{formatCurrency(menuData?.listprice)}
                    </Typography>
                    <Chip
                      label={`Save ₦${formatCurrency(menuData?.listprice - menuData?.price)}`}
                      size="small"
                      sx={{ backgroundColor: "#dc2626", color: "white", fontWeight: 700 }}
                    />
                  </div>
                )}
              </div>

              {/* Stock & shipping */}
              <div className="border-y-2 border-gray-200 py-5 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Inventory sx={{ color: "#10b981", fontSize: "1.5rem" }} />
                  <Typography variant="body1" className="text-gray-700">
                    Available:{" "}
                    <span className="font-bold text-green-600">
                      {menuData?.quantity} {menuData?.unitPerQuantity} left
                    </span>
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <LocalShipping sx={{ color: "#3b82f6", fontSize: "1.5rem" }} />
                  <Typography variant="body2" className="text-gray-600">
                    Delivery fee calculated based on your location
                  </Typography>
                </div>
              </div>

              {/* Add to cart */}
              <div className="mb-6">
                <AddToFoodCartButton
                  onSubmit={onAddToFoodCart}
                  loading={addFoodCartLoading}
                  productId={menuData?.id}
                  cartItems={foodCart?.cartProducts}
                  quantityLeft={menuData?.quantity}
                />
              </div>

              {/* Quick actions */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  fullWidth
                  sx={{
                    borderColor: "#ea580c",
                    color: "#ea580c",
                    fontWeight: 600,
                    "&:hover": { borderColor: "#c2410c", backgroundColor: "#fff7ed" },
                  }}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Phone />}
                  fullWidth
                  sx={{
                    borderColor: "#10b981",
                    color: "#10b981",
                    fontWeight: 600,
                    "&:hover": { borderColor: "#059669", backgroundColor: "#f0fdf4" },
                  }}
                >
                  Call Seller
                </Button>
              </div>

              {/* Promotions */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <LocalOffer sx={{ color: "#a855f7", fontSize: "1.5rem" }} />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Special Promotions
                  </Typography>
                </div>
                <ul className="space-y-3">
                  {[
                    { Icon: Phone, text: "Call 07087200297 to place your order directly", color: "#10b981" },
                    { Icon: WhatsApp, text: "Need extra money? Loan up to ₦500,000 on the Africanshops Wallet", color: "#22c55e" },
                    { Icon: LocalShipping, text: "Enjoy cheaper shipping when you select a Pickup Station at checkout", color: "#3b82f6" },
                  ].map(({ Icon, text, color }, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer list-none"
                    >
                      <Icon sx={{ color, fontSize: "1.5rem", marginTop: "2px" }} />
                      <Typography variant="body2" className="text-gray-700 leading-relaxed">
                        {text}
                      </Typography>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Details & Reviews ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <FoodMartDetailsWithReviews menuData={menuData} />
        </motion.div>
      </div>

      {/* ── Image gallery modal ── */}
      <FoodMartImageGalleryView
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={menuData?.imageSrcs || []}
        menuData={{
          title: menuData?.title,
          description: menuData?.description,
          price: menuData?.price,
          listprice: menuData?.listprice,
          rating: averageRating,
          reviewCount,
        }}
        onAddToCart={onAddToFoodCart}
      />
    </div>
  );
}

export default DemoContent;
