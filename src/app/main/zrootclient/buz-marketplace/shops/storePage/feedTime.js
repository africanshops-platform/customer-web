/** "just now", "2 hours ago", "Yesterday", "3 days ago", then the date. Pure, so it is easy to test. */
export function timeAgo(iso, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(then).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const CATEGORY_LABELS = {
  BUSINESS_TIP: { label: "Business tip", tone: "" },
  PRODUCT_SPOTLIGHT: { label: "Product spotlight", tone: "" },
  EVENT: { label: "Event", tone: "ev" },
  EDUCATION: { label: "Learn", tone: "edu" },
  MARKET_TREND: { label: "Market trend", tone: "edu" },
};

export const REPORT_REASONS = [
  { value: "OFF_TOPIC", label: "Not about business or learning" },
  { value: "SPAM", label: "Spam or an unwanted advert" },
  { value: "MISINFORMATION", label: "False or misleading" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "HATE_OR_ABUSE", label: "Hate or abuse" },
  { value: "OTHER", label: "Something else" },
];

/** "21h left" / "35m left" for something that expires at the given time. */
export function timeLeft(iso, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return "ending";
  const hours = Math.floor(ms / 3_600_000);
  return hours >= 1 ? `${hours}h left` : `${Math.max(1, Math.round(ms / 60_000))}m left`;
}
