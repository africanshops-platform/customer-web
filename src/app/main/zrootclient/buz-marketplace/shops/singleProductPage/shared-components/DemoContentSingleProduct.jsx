import { motion } from "framer-motion";
import { useState } from "react";
import { Button, Typography, Chip, Rating, IconButton, Divider, Badge } from "@mui/material";
import {
  LocalOffer,
  Star,
  Verified,
  LocalShipping,
  Inventory,
  Phone,
  WhatsApp,
  Share,
  FavoriteBorder,
  Favorite,
  ZoomIn,
  Store,
} from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import AddToProductCartButton from "../../components/AddToProductCartButton";
import ProductDetailsWithReviews from "./ProductDetailsWithReviews";
import ProductShippingEstimate from "./ProductShippingEstimate";
import ProductImageGalleryView from "./ProductImageGalleryView";
import SingleProductLoadingPlaceholder from "./SingleProductLoadingPlaceholder";

/**
 * Demo Content - Single Product Page
 * Completely redesigned with compelling, engaging, and professional UI
 */

function DemoContentSingleProduct(props) {
  const {
    isLoading,
    isError,
    productData,
    onSubmit,
    loading,
    productId,
    cartItems,
    select,
    setSelect,
  } = props;

  // console.log("Single Product Data:", productData);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);


  // Loading state
  if (isLoading) {
    return <SingleProductLoadingPlaceholder />;
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retrieving product details"} />
      </motion.div>
    );
  }

  // No product data
  if (!productData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          Product not found!
        </Typography>
      </motion.div>
    );
  }

  // Calculate discount percentage
  const hasDiscount = productData?.listprice && productData?.listprice > productData?.price;
  const discountPercent = hasDiscount
    ? Math.round(((productData.listprice - productData.price) / productData.listprice) * 100)
    : 0;

  return (
    <div className="flex-auto p-0 sm:p-0 bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <Typography variant="body2" className="text-gray-600">
          <span className="hover:text-orange-600 cursor-pointer">Home</span>
          {" / "}
          <span className="hover:text-orange-600 cursor-pointer">Marketplace</span>
          {" / "}
          <span className="text-gray-900 font-semibold">{productData?.name}</span>
        </Typography>
      </div>

      {/* Main Product Section */}
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row p-8 gap-10">
            {/* LEFT: Image Gallery Section */}
            <div className="w-full lg:w-1/2">
              {/* Main Image */}
              <motion.div
                className="relative rounded-2xl overflow-hidden bg-gray-50 group"
                style={{ height: "500px" }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={productData?.imageLinks[select]?.url || "https://via.placeholder.com/500"}
                  alt={productData?.name}
                  className="w-full h-full object-cover cursor-pointer"
                  style={{ objectFit: "cover" }}
                  onClick={() => setGalleryOpen(true)}
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="contained"
                    startIcon={<ZoomIn />}
                    onClick={() => setGalleryOpen(true)}
                    sx={{
                      backgroundColor: "white",
                      color: "#ea580c",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                      fontWeight: 700,
                      fontSize: "1rem",
                      padding: "12px 32px",
                      borderRadius: "12px",
                    }}
                  >
                    View Full Gallery
                  </Button>
                </div>

                {/* Discount Badge */}
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
                      boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
                    }}
                  />
                )}

                {/* Favorite Button */}
                <IconButton
                  onClick={() => setIsFavorite(!isFavorite)}
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

              {/* Thumbnail Gallery */}
              <div className="flex mt-6 space-x-4 overflow-x-auto pb-2">
                {productData?.imageLinks?.map((img, index) => (
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

            {/* RIGHT: Product Information Section */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Badges Section */}
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Chip
                  icon={<Store fontSize="small" />}
                  label="Official Store"
                  component={NavLinkAdapter}
                  to={`/marketplace/merchant/${productData?.shop}/portal`}
                  clickable
                  sx={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    "&:hover": {
                      backgroundColor: "#059669",
                    },
                  }}
                />
                <Chip
                  icon={<Verified fontSize="small" />}
                  label="Verified Seller"
                  sx={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
                <Chip
                  icon={<LocalShipping fontSize="small" />}
                  label="Fast Delivery"
                  sx={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              {/* Product Title */}
              <Typography
                variant="h3"
                className="font-bold text-gray-900 mb-4 leading-tight"
                sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}
              >
                {productData?.name}
              </Typography>

              {/* Brand/Category Info */}
              <div className="flex items-center gap-2 mb-6">
                <Typography variant="body1" className="text-gray-600">
                  Brand: <span className="font-semibold text-gray-900">Premium</span>
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography
                  variant="body1"
                  className="text-orange-600 cursor-pointer hover:underline font-medium"
                >
                  Similar products
                </Typography>
              </div>

              {/* Rating Section */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-xl">
                <Rating
                  value={4.5}
                  precision={0.5}
                  size="large"
                  readOnly
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "#f59e0b",
                    },
                  }}
                />
                <Typography variant="body1" className="text-gray-700 font-medium">
                  4.5 out of 5
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  ({Math.floor(Math.random() * 100) + 50} reviews)
                </Typography>
              </div>

              {/* Price Section */}
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
                    ₦{formatCurrency(productData?.price)}
                  </Typography>
                  <Typography variant="h6" className="text-gray-600 font-medium">
                    per {productData?.unitweight?.unitname || "unit"}
                  </Typography>
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-3 mt-3">
                    <Typography variant="h6" className="line-through text-gray-500">
                      ₦{formatCurrency(productData?.listprice)}
                    </Typography>
                    <Chip
                      label={`Save ₦${formatCurrency(productData?.listprice - productData?.price)}`}
                      size="small"
                      sx={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Stock & Shipping Info */}
              <div className="border-y-2 border-gray-200 py-5 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Inventory sx={{ color: "#10b981", fontSize: "1.5rem" }} />
                  <Typography variant="body1" className="text-gray-700">
                    In Stock:{" "}
                    <span className="font-bold text-green-600">
                      {productData?.quantity} {productData?.unitPerQuantity} available
                    </span>
                  </Typography>
                </div>
                <ProductShippingEstimate productData={productData} />
              </div>

              {/* Add to Cart Button */}
              <div className="mb-6">
                <AddToProductCartButton
                  onSubmit={onSubmit}
                  loading={loading}
                  productId={productId}
                  cartItems={cartItems}
                  quantityLeft={productData?.quantityInStock}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  fullWidth
                  sx={{
                    borderColor: "#ea580c",
                    color: "#ea580c",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#c2410c",
                      backgroundColor: "#fff7ed",
                    },
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
                    "&:hover": {
                      borderColor: "#059669",
                      backgroundColor: "#f0fdf4",
                    },
                  }}
                >
                  Call Seller
                </Button>
              </div>

              {/* Promotions Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <LocalOffer sx={{ color: "#a855f7", fontSize: "1.5rem" }} />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Special Promotions
                  </Typography>
                </div>
                <ul className="space-y-3">
                  {[
                    { icon: Phone, text: "Call 07087200297 to place your order", color: "#10b981" },
                    {
                      icon: WhatsApp,
                      text: "Need extra money? Loan up to ₦500,000 on your Africanshops Wallet",
                      color: "#22c55e",
                    },
                    {
                      icon: LocalShipping,
                      text: "Enjoy cheaper shipping fees when you select a PickUp Station at checkout",
                      color: "#3b82f6",
                    },
                  ].map((promo, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <promo.icon
                        sx={{ color: promo.color, fontSize: "1.5rem", marginTop: "2px" }}
                      />
                      <Typography variant="body2" className="text-gray-700 leading-relaxed">
                        {promo.text}
                      </Typography>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Details & Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <ProductDetailsWithReviews productData={productData} />
        </motion.div>
      </div>

      {/* Image Gallery Modal */}
      
      <ProductImageGalleryView
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={productData?.imageLinks || []}
        productData={{
          name: productData?.name,
          shortDescription: productData?.shortDescription,
          price: productData?.price,
          listprice: productData?.listprice,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 100) + 50,
        }}
      />
    </div>
  );
}

export default DemoContentSingleProduct;
