import { themeFor } from "./venueThemes";

/**
 * What the visit-page sidebar may show about a venue: ONLY fields the API really returns. Anything missing is left
 * out rather than replaced by a placeholder (the sidebar used to invent a 4.5 rating, 234 reviews, 1,250 followers,
 * info@restaurant.com ... for every venue; tracker customer-13).
 */

const asText = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

/** Same clock format as the listing cards and maps, so a venue shows identical hours everywhere. */
export function formatTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatOpeningHours(openPeriod, closePeriod) {
  const open = formatTime(openPeriod);
  const close = formatTime(closePeriod);
  return open && close ? `${open} – ${close}` : null;
}

/** A real rating needs real reviews behind it: no reviews means no stars, never a default. */
function realRating(rating, numReviews) {
  const count = Number(numReviews);
  const value = Number(rating);
  if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(value) || value <= 0) return null;
  return { value, count };
}

function listedSinceYear(createdAt) {
  if (!createdAt) return null;
  const year = new Date(createdAt).getFullYear();
  return Number.isFinite(year) ? year : null;
}

/** Venue-kind label from the theme (Café, Club / Lounge ...); the merchant's own free-text category only when it adds something. */
function categoryExtra(foodMartCategory, theme, operationMode) {
  const category = asText(foodMartCategory);
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower === String(operationMode ?? "").toLowerCase() || theme.label.toLowerCase().startsWith(lower)) return null;
  return category;
}

/** Stars for a dish: only when it has real reviews and a real rating. */
export function dishRating(item) {
  // The review count arrives as numReviews (a number) or reviews (a number, or the list of reviews).
  const raw = item?.numReviews ?? item?.reviews;
  const count = Array.isArray(raw) ? raw.length : Number(raw ?? NaN);
  const rating = Number(item?.rating);
  if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(rating) || rating <= 0) return { rating: null, count: 0 };
  return { rating, count };
}

export function directionsUrl(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (latitude == null || longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function buildVenueProfile(foodMart) {
  const theme = themeFor(foodMart?.operationMode);
  const phone = asText(foodMart?.phoneNumber);
  return {
    name: asText(foodMart?.title),
    logo: foodMart?.imageSrc || foodMart?.imageSrcs?.[0]?.url || null,
    venueLabel: theme.label,
    venueIcon: theme.icon,
    extraCategory: categoryExtra(foodMart?.foodMartCategory, theme, foodMart?.operationMode),
    rating: realRating(foodMart?.rating, foodMart?.numReviews),
    listedSince: listedSinceYear(foodMart?.createdAt),
    description: asText(foodMart?.description),
    hours: formatOpeningHours(foodMart?.busniessOpenPeriod, foodMart?.busniessClosePeriod),
    address: asText(foodMart?.address),
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
    directions: directionsUrl(foodMart?.latitude, foodMart?.longitude),
  };
}

/** Native share sheet where available, otherwise copies the link. Resolves "shared" | "copied" | "failed". */
export async function shareVenue({ title, url }, nav = typeof navigator === "undefined" ? undefined : navigator) {
  try {
    if (nav?.share) {
      await nav.share({ title, url });
      return "shared";
    }
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(url);
      return "copied";
    }
  } catch (error) {
    // The user dismissing the share sheet is not a failure.
    if (error?.name === "AbortError") return "failed";
  }
  return "failed";
}
