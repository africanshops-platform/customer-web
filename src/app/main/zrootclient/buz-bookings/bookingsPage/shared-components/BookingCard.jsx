import { useState } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import { FavoriteBorder, Favorite, NavigateBefore, NavigateNext } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import { distanceLabel } from "src/app/main/zrootclient/shared-near/nearby";

/**
 * BookingCard Component
 * Displays hotel/apartment listing with image slider
 */
function BookingCard({
  id,
  slug,
  images = [],
  title,
  address,
  price,
  roomCount,
  rating = 0,
  reviewCount = 0,
  category,
  bookingPeriod,
  distanceKm,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Star rating component
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-black">
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-black">
          ⯨
        </span>,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>,
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm flex flex-col h-full">
      {/* Image Slider Section */}
      <div className="relative group flex-shrink-0">
        <div className="relative h-160 overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]?.url || images[currentImageIndex]}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full transition ease-in-out delay-150  hover:scale-105 object-cover"
              // height={384}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center px-4 py-2">
              <Typography color="text.secondary">No image available</Typography>
            </div>
          )}

          {/* Favorite Button */}
          <IconButton
            onClick={toggleFavorite}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            size="small"
          >
            {isFavorite ? (
              <Favorite className="text-red-500" />
            ) : (
              <FavoriteBorder className="text-gray-700" />
            )}
          </IconButton>

          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                size="small"
              >
                <NavigateBefore />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                size="small"
              >
                <NavigateNext />
              </IconButton>

              {/* Image Dots Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-6 h-6 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-10 flex flex-col flex-grow">
        {/* Content that can vary in height */}
        <div className="flex-grow">
          {/* Duration and Host */}
          <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
            <span className="font-serif font-100">{category}</span>
            {/* <span>•</span>
            <span className="font-xs">{host}</span> */}
          </div>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.625rem",
              color: "#111827",
              marginBottom: "4px",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "3.5rem",
            }}
          >
            {title}
          </Typography>

          {/* Address */}
          <Typography
            variant="body1"
            sx={{
              fontSize: "1rem",
              color: "#6b7280",
              marginBottom: "16px",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {address}
          </Typography>
          {distanceLabel(distanceKm) && (
            <span
              className="inline-block mb-4 px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: "#eff6ff", color: "#1d4ed8" }}
              data-testid="booking-distance"
            >
              {distanceLabel(distanceKm)}
            </span>
          )}

          {/* Price and Rating Row */}
          <div className="flex justify-between mb-4">
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.45rem",
                  color: "#ea580c",
                }}
              >
                N{formatCurrency(price)}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "0.95rem",
                  color: "#6b7280",
                }}
              >
                /{String(bookingPeriod || "").toLowerCase()}
              </Typography>
            </div>

            {/* Rating: only when real reviews exist (it used to default every listing to 4.5 stars / 9 reviews) */}
            <div className="flex items-center gap-2">
              {reviewCount > 0 && rating > 0 ? (
                <>
                  <div className="flex text-sm">{renderStars()}</div>
                  <Typography variant="body1" sx={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    ({reviewCount.toString().padStart(2, "0")})
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ fontSize: "0.95rem", color: "#9ca3af" }}>
                  No reviews yet
                </Typography>
              )}
            </div>
          </div>

          {/* Room Count */}
          {roomCount && (
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "16px",
                fontWeight: 500,
              }}
            >
              <i className="fas fa-door-open mr-2"></i>
              {roomCount} {roomCount === 1 ? "Room" : "Rooms"}
            </Typography>
          )}
        </div>

        {/* Button Section - Always at bottom */}
        <div className="mt-auto pt-4">
          <Button
            size="medium"
            component={NavLinkAdapter}
            to={`/bookings/listings/${slug}/view`}
            fullWidth
            sx={{
              backgroundColor: "#ea580c",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              padding: "12px 24px",
              borderRadius: "12px",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#c2410c",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(234, 88, 12, 0.3)",
              },
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookingCard;
