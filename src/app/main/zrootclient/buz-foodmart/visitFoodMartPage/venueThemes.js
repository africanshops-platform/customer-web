/**
 * Each kind of venue should feel like walking into it. The theme drives the hero, the page ground, the cards
 * and the accent on the visit page; `className` scopes the CSS overrides in venue-themes.css.
 */
export const VENUE_THEMES = {
  RESTAURANT: {
    className: "venue-restaurant",
    label: "Restaurant",
    icon: "🍽️",
    headline: "Pull up a chair",
    tagline: "Table service, a proper menu and food cooked with care.",
    hero: "linear-gradient(135deg,#7c2d12 0%,#b45309 55%,#f59e0b 100%)",
    ground: "#fffaf3",
    accent: "#b45309",
    font: "'Playfair Display','Georgia',serif",
    chips: ["Dine-in", "Table service", "Chef's menu"],
  },
  CAFE: {
    className: "venue-cafe",
    label: "Café",
    icon: "☕",
    headline: "Slow down, stay a while",
    tagline: "Fresh coffee, pastries and an easy, unhurried atmosphere.",
    hero: "linear-gradient(135deg,#3f2a1d 0%,#7a5238 55%,#c8a27c 100%)",
    ground: "#faf5ee",
    accent: "#7a5238",
    font: "'Quicksand','Trebuchet MS',sans-serif",
    chips: ["Coffee & tea", "Pastries", "Cosy seating"],
  },
  CLUB: {
    className: "venue-club",
    label: "Club / Lounge",
    icon: "🪩",
    headline: "The night starts here",
    tagline: "Music, bottle service and a crowd that comes to stay up.",
    hero: "linear-gradient(135deg,#1e0a3c 0%,#5b1fa8 50%,#e11d8f 100%)",
    ground: "#0f0a1e",
    accent: "#e11d8f",
    font: "'Poppins','Segoe UI',sans-serif",
    chips: ["Bottle service", "Late night", "Reserve a table"],
  },
  SPOT: {
    className: "venue-spot",
    label: "Spot",
    icon: "🔥",
    headline: "Straight off the fire",
    tagline: "Grills, small chops and good company — no fuss, all flavour.",
    hero: "linear-gradient(135deg,#111827 0%,#7f1d1d 55%,#f97316 100%)",
    ground: "#16110d",
    accent: "#f97316",
    font: "'Barlow Condensed','Impact',sans-serif",
    chips: ["Grill", "Small chops", "Hangout"],
  },
};

export const themeFor = (mode) => VENUE_THEMES[mode] || VENUE_THEMES.RESTAURANT;
export const isDarkTheme = (mode) => mode === "CLUB" || mode === "SPOT";
