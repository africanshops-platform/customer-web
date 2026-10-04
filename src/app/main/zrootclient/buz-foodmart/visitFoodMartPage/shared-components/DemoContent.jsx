import VenueHero from "./VenueHero";
import { themeFor } from "../venueThemes";
import "../venue-themes.css";
import FulfillmentBadge from "../../components/FulfillmentBadge";
import FuseLoading from "@fuse/core/FuseLoading";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button, Typography, IconButton, Chip, Rating } from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  LocalOffer,
  Star,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import { useGetRCSMenuItems } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";

/**
 * MenuItemCard - Individual menu item card component
 */
function MenuItemCard({ item, index }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = item?.imageSrcs || [];
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const hasDiscount = item?.listprice && item?.listprice > item?.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.listprice - item.price) / item.listprice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="menu-card group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-100 overflow-hidden bg-gray-100">
        {hasImages ? (
          <img
            src={images[currentImageIndex]?.url}
            alt={`${item?.title} - image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
          >
            <span style={{ fontSize: "3rem" }}>🍽️</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Prev / Next arrows — only when multiple images */}
        {hasMultiple && (
          <>
            <IconButton
              onClick={handlePrev}
              size="small"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <NavigateBefore fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleNext}
              size="small"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <NavigateNext fontSize="small" />
            </IconButton>

            {/* Dot indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? "bg-white w-3" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <Chip
            icon={<LocalOffer fontSize="small" />}
            label={`${discountPercent}% OFF`}
            size="small"
            className="absolute top-3 left-3 shadow-lg"
            sx={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold" }}
          />
        )}

        {/* Popular Badge */}
        {index % 3 === 0 && (
          <Chip
            icon={<Star fontSize="small" />}
            label="Popular"
            size="small"
            className="absolute top-3 right-3 shadow-lg"
            sx={{
              background: "linear-gradient(to right, #f59e0b, #f97316)",
              color: "white",
              fontWeight: 600,
            }}
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
            to={`/foodmarts/${item?.foodMartVendor}/menu/${item?.slug}/view`}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
            size="small"
          >
            <Visibility />
          </IconButton>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category Badge */}
        <Chip
          label={item?.category || "Main Course"}
          size="small"
          className="mb-2 bg-orange-100 text-orange-800 font-medium"
          sx={{
            backgroundColor: "#ffedd5",
            color: "#c2410c",
            fontWeight: 500,
          }}
        />

        {/* Title */}
        <Typography
          variant="subtitle1"
          className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-orange-600 transition-colors"
          component={NavLinkAdapter}
          to={`/foodmarts/${item?.foodMartVendor}/menu/${item?.slug}/view`}
        >
          {item?.title}
        </Typography>

        {/* Description */}
        {item?.description && (
          <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-2">
            {item?.description || "Delicious and freshly prepared meal."}
          </Typography>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Rating
            value={item?.rating || 4.5}
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
            ({item?.reviews || Math.floor(Math.random() * 50) + 10})
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
                ₦{formatCurrency(item?.price)}
              </Typography>
              {hasDiscount && (
                <Typography variant="body2" className="line-through text-gray-400">
                  ₦{formatCurrency(item?.listprice)}
                </Typography>
              )}
            </div>
            <Typography variant="caption" className="text-gray-500">
              per {item?.unitPerQuantity || "serving"}
            </Typography>
          </div>
        </div>
        <div className="mb-3">
          <FulfillmentBadge item={item} withDetail />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-4">
          <Button
            fullWidth
            variant="contained"
            startIcon={<Visibility />}
            component={NavLinkAdapter}
            to={`/foodmarts/${item?.foodMartVendor}/menu/${item?.slug}/view`}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            sx={{
              background: "linear-gradient(to right, #ea580c, #dc2626)",
              "&:hover": {
                background: "linear-gradient(to right, #c2410c, #b91c1c)",
              },
            }}
          >
            View More
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Demo Content
 */
function DemoContent(props) {
  const { rcsId, rcsFoodMart } = props;
  const venue = themeFor(rcsFoodMart?.operationMode);

  const { data: RcsMenu, isLoading: menuLoading, isError: menuError } = useGetRCSMenuItems(rcsId);
  console.log("RcsMenu data:", RcsMenu);

  if (menuLoading) {
    return <FuseLoading />;
  }

  if (menuError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retrieving menu items"} />
      </motion.div>
    );
  }

  if (!RcsMenu?.data?.menus || RcsMenu.data.menus.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No menu items available!
        </Typography>
      </motion.div>
    );
  }

  return (
    <div className={`${venue.className} flex-auto p-0 sm:p-0`} style={{ background: venue.ground, fontFamily: venue.font }}>
      <VenueHero foodMart={rcsFoodMart} />
      {/* Header Section */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h4" className="font-bold text-gray-900">
              Our Menu
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">
              Discover our delicious selection of {RcsMenu?.data?.menus?.length} items
            </Typography>
          </div>
          <Chip
            label={`${RcsMenu?.data?.menus?.length} Items`}
            className="bg-orange-100 text-orange-800 font-semibold"
            sx={{
              backgroundColor: "#ffedd5",
              color: "#c2410c",
              fontWeight: 600,
            }}
          />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {RcsMenu?.data?.menus?.map((item, index) => (
            <MenuItemCard key={item?.id || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DemoContent;
