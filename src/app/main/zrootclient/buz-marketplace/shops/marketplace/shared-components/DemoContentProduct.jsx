import { motion } from "framer-motion";
import { useState } from "react";
import { Button, Typography, IconButton, Chip, Rating } from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  LocalOffer,
  Star,
  ShoppingCart,
} from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import ProductPaginationBar from "./ProductPaginationBar";
import ContentLoadingPlaceholder from "./ContentLoadingPlaceholder";
import { isItemAvailable, NOT_AVAILABLE_LABEL, NOT_AVAILABLE_NOTE, unavailableLook } from "../../../../shared/itemAvailability";

/**
 * ProductCard - Individual product card component
 */
function ProductCard({ product, index }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const available = isItemAvailable(product);
  const hasDiscount = product?.listprice && product?.listprice > product?.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.listprice - product.price) / product.listprice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-100" style={{ height: "250px" }}>
        <img
          src={product?.imageLinks[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          style={{ minHeight: "250px", maxHeight: "250px", objectFit: "cover", ...(available ? {} : unavailableLook) }}
        />

        {/* Not available: the picture is greyed and this badge says why */}
        {!available && (
          <Chip
            label={NOT_AVAILABLE_LABEL}
            size="small"
            data-testid="not-available-badge"
            className="absolute top-3 left-3 font-bold shadow-lg"
            sx={{ backgroundColor: "#374151", color: "white", fontWeight: "bold", zIndex: 2 }}
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount Badge */}
        {hasDiscount && (
          <Chip
            icon={<LocalOffer fontSize="small" />}
            label={`${discountPercent}% OFF`}
            size="small"
            className="absolute top-3 left-3 bg-red-600 text-white font-bold shadow-lg"
            sx={{
              backgroundColor: "#dc2626",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}

        {/* Popular Badge - Show for featured products */}
        {index % 3 === 0 && (
          <Chip
            icon={<Star fontSize="small" />}
            label="Popular"
            size="small"
            className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg"
          />
        )}

        {/* Favorite Button */}
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white shadow-lg"
          size="small"
        >
          {isFavorite ? <Favorite sx={{ color: "#ef4444" }} /> : <FavoriteBorder />}
        </IconButton>

        {/* Quick View Button - Shows on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute bottom-3 left-3"
        >
          <IconButton
            component={NavLinkAdapter}
            to={`/marketplace/product/${product?.slug}/view`}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
            size="small"
          >
            <Visibility />
          </IconButton>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow" style={available ? undefined : { color: "#6b7280" }}>
        {/* Shop Badge */}
        {product?.shop?.shopname && (
          <Chip
            label={product.shop.shopname}
            size="small"
            className="mb-2 bg-orange-100 text-orange-800 font-medium"
            sx={{
              backgroundColor: "#ffedd5",
              color: "#c2410c",
              fontWeight: 500,
              maxWidth: "fit-content",
            }}
          />
        )}

        {/* Title */}
        <Typography
          variant="subtitle1"
          className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-orange-600 transition-colors"
          component={NavLinkAdapter}
          to={`/marketplace/product/${product?.slug}/view`}
        >
          {product?.name}
        </Typography>

        {/* Address */}
        {product?.shop?.shopaddress && (
          <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-1 text-sm">
            📍 {product.shop.shopaddress}
          </Typography>
        )}

        {/* Rating - Using dummy data for now */}
        <div className="flex items-center gap-2 mb-3">
          <Rating
            value={4.5}
            precision={0.5}
            size="small"
            readOnly
            sx={{
              "& .MuiRating-iconFilled": {
                color: "#f59e0b",
              },
            }}
          />
          <Typography variant="caption" className="text-gray-500">
            ({Math.floor(Math.random() * 50) + 10})
          </Typography>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <Typography
                variant="h5"
                className="font-bold text-orange-600"
                sx={{ color: "#ea580c" }}
              >
                ₦{formatCurrency(product?.price)}
              </Typography>
              {hasDiscount && (
                <Typography variant="body2" className="line-through text-gray-400">
                  ₦{formatCurrency(product?.listprice)}
                </Typography>
              )}
            </div>
            <Typography variant="caption" className="text-gray-500">
              per {product?.unitweight?.unitname || "unit"}
            </Typography>
          </div>
        </div>

        {!available && (
          <Typography variant="caption" className="text-gray-600" data-testid="not-available-note">
            {NOT_AVAILABLE_NOTE}
          </Typography>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-4">
          <Button
            component={NavLinkAdapter}
            to={`/marketplace/product/${product?.slug}/view`}
            fullWidth
            variant="contained"
            startIcon={<Visibility />}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            sx={
              available
                ? {
                    background: "linear-gradient(to right, #ea580c, #dc2626)",
                    "&:hover": {
                      background: "linear-gradient(to right, #c2410c, #b91c1c)",
                    },
                  }
                : { background: "#9ca3af", "&:hover": { background: "#6b7280" } }
            }
          >
            {available ? "View more" : "View details"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Demo Content
 */
function DemoContentProduct(props) {
  const {
    isLoading,
    isError,
    products,
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
  } = props;

  if (isLoading) {
    return <ContentLoadingPlaceholder />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retrieving products"} />
      </motion.div>
    );
  }

  if (!products?.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen"
        style={{
          background: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
        }}
      >
        <div className="flex flex-col items-center justify-center max-w-2xl px-8 text-center">
          {/* Icon/Visual Element - Shopping Bag/Cart */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            className="mb-8"
          >
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-orange-300"
            >
              {/* Outer circle decoration */}
              <circle
                cx="90"
                cy="90"
                r="75"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="10 10"
                opacity="0.25"
              />

              {/* Shopping bag */}
              <path
                d="M50 70 L50 140 C50 145 52 150 57 150 L123 150 C128 150 130 145 130 140 L130 70 Z"
                fill="currentColor"
                opacity="0.15"
                stroke="currentColor"
                strokeWidth="2"
                // opacity="0.3"
              />

              {/* Bag handles */}
              <path
                d="M65 70 C65 55 75 45 90 45 C105 45 115 55 115 70"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.3"
                fill="none"
              />

              {/* Shopping cart icon overlay */}
              <circle cx="75" cy="130" r="4" fill="currentColor" opacity="0.35" />
              <circle cx="105" cy="130" r="4" fill="currentColor" opacity="0.35" />

              {/* Decorative product boxes in bag */}
              <rect x="65" y="85" width="20" height="20" rx="3" fill="currentColor" opacity="0.2" />
              <rect x="95" y="85" width="20" height="20" rx="3" fill="currentColor" opacity="0.2" />
              <rect
                x="65"
                y="110"
                width="20"
                height="15"
                rx="3"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x="95"
                y="110"
                width="20"
                height="15"
                rx="3"
                fill="currentColor"
                opacity="0.2"
              />

              {/* Tag icon */}
              <circle cx="140" cy="60" r="12" fill="currentColor" opacity="0.15" />
              <path
                d="M135 57 L145 57 L145 63 L140 68 L135 63 Z"
                fill="currentColor"
                opacity="0.25"
              />
            </svg>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#9a3412",
                marginBottom: "16px",
                fontSize: { xs: "1.875rem", sm: "2.25rem" },
              }}
            >
              No Products Available
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#7c2d12",
                fontSize: { xs: "1rem", sm: "1.125rem" },
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              The marketplace is currently empty. No products are available at this moment. Please
              check back soon as new items are added regularly, or adjust your filters to explore
              more options.
            </Typography>
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
            className="flex items-center gap-3 mt-4"
          >
            <ShoppingCart sx={{ color: "#ea580c", opacity: 0.4 }} />
            <div className="h-1 w-16 bg-gradient-to-r from-orange-400 via-orange-300 to-transparent rounded-full"></div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Fallback: if totalItems is not provided by backend, estimate based on products length
  const estimatedTotal = totalItems > 0 ? totalItems : products?.length || 0;

  return (
    <div className="flex-auto p-0 sm:p-0 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h4" className="font-bold text-gray-900">
              Marketplace Products
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">
              Discover amazing products from {products?.length || 0} items
            </Typography>
          </div>
          <Chip
            label={`${products?.length || 0} Products`}
            className="bg-orange-100 text-orange-800 font-semibold"
            sx={{
              backgroundColor: "#ffedd5",
              color: "#c2410c",
              fontWeight: 600,
            }}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product?.id || product?._id} product={product} index={index} />
          ))}
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="px-8 pb-8">
        <ProductPaginationBar
          totalItems={estimatedTotal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
}

export default DemoContentProduct;
