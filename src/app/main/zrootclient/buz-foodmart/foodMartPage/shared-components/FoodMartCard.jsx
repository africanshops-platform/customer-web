import { useState } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  LocationOn,
  Phone,
  AccessTime,
  Star,
} from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

function formatBusinessHours(openPeriod, closePeriod) {
  if (!openPeriod || !closePeriod) return null;
  try {
    const open = new Date(openPeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const close = new Date(closePeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${open} – ${close}`;
  } catch {
    return null;
  }
}

const CATEGORY_COLORS = {
  restaurant: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  bar: { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
  club: { bg: "#f3e8ff", text: "#9333ea", border: "#e9d5ff" },
  lounge: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  cafe: { bg: "#fef9c3", text: "#ca8a04", border: "#fef08a" },
  bakery: { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
  fastfood: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  spot: { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" },
};

function FoodMartCard({
  id,
  slug,
  imageSrc = "",
  title,
  description,
  address,
  phoneNumber,
  rating,
  numReviews,
  foodMartCategory,
  operationMode,
  busniessOpenPeriod,
  busniessClosePeriod,
  isFeatured,
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const categoryColor = CATEGORY_COLORS[foodMartCategory?.toLowerCase()] || CATEGORY_COLORS.restaurant;
  const businessHours = formatBusinessHours(busniessOpenPeriod, busniessClosePeriod);
  const displayRating = rating ? parseFloat(rating).toFixed(1) : null;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group transition-all duration-300"
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(249, 115, 22, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(234, 88, 12, 0.18)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
            }}
          >
            <span style={{ fontSize: "3.5rem" }}>🍽️</span>
            <Typography sx={{ color: "#9ca3af", fontSize: "1.4rem", marginTop: "8px" }}>
              No image available
            </Typography>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Favorite Button */}
        <IconButton
          onClick={toggleFavorite}
          className="absolute top-3 right-3 bg-white/85 hover:bg-white"
          size="small"
          sx={{ backdropFilter: "blur(4px)" }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: "#ef4444", fontSize: "2.0rem" }} />
          ) : (
            <FavoriteBorder sx={{ color: "#374151", fontSize: "2.0rem" }} />
          )}
        </IconButton>

        {/* Featured Badge */}
        {isFeatured && (
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-base font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.4)",
            }}
          >
            ⭐ Featured
          </div>
        )}

        {/* Category Badge — bottom left of image */}
        {foodMartCategory && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-base font-bold capitalize"
            style={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              border: `1px solid ${categoryColor.border}`,
              backdropFilter: "blur(4px)",
            }}
          >
            {foodMartCategory}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Operation Mode + Hours row */}
        <div className="flex items-center justify-between mb-3">
          {operationMode && (
            <span
              className="text-base font-semibold uppercase tracking-wide px-2 py-1 rounded"
              style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              {operationMode.replace(/_/g, " ")}
            </span>
          )}
          {businessHours && (
            <div className="flex items-center gap-1 text-base text-gray-500">
              <AccessTime sx={{ fontSize: "1.4rem", color: "#9ca3af" }} />
              <span>{businessHours}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1.76rem",
            color: "#111827",
            marginBottom: "6px",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.8rem",
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: "1.4rem",
              fontStyle: "italic",
              marginBottom: "10px",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            "{description}"
          </Typography>
        )}

        {/* Address */}
        {address && (
          <div className="flex items-start gap-1.5 mb-2">
            <LocationOn sx={{ fontSize: "1.6rem", color: "#9ca3af", marginTop: "2px", flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "1.4rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {address}
            </Typography>
          </div>
        )}

        {/* Phone */}
        {phoneNumber && (
          <div className="flex items-center gap-1.5 mb-3">
            <Phone sx={{ fontSize: "1.6rem", color: "#9ca3af", flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "1.4rem" }}>
              {phoneNumber}
            </Typography>
          </div>
        )}

        {/* Rating Row */}
        <div className="flex items-center justify-between mb-4">
          {displayRating ? (
            <div className="flex items-center gap-1.5">
              <Star sx={{ fontSize: "1.6rem", color: "#f59e0b" }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.44rem" }}>
                {displayRating}
              </Typography>
              {numReviews && (
                <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "1.28rem" }}>
                  ({numReviews} reviews)
                </Typography>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} sx={{ fontSize: "1.44rem", color: s <= 4 ? "#fbbf24" : "#e5e7eb" }} />
              ))}
              <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "1.28rem" }}>
                New
              </Typography>
            </div>
          )}
        </div>

        {/* Visit Button */}
        <Button
          size="small"
          component={NavLinkAdapter}
          to={`/foodmarts/${slug}/visit-mart/${slug}`}
          fullWidth
          sx={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            fontWeight: 700,
            borderRadius: "10px",
            paddingY: "10px",
            fontSize: "1.44rem",
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              boxShadow: "0 6px 18px rgba(234, 88, 12, 0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Visit Restaurant
        </Button>
      </div>
    </div>
  );
}

export default FoodMartCard;
