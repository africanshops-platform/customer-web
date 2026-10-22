import { motion } from "framer-motion";
import { Typography } from "@mui/material";
import { themeFor, isDarkTheme } from "../venueThemes";

/**
 * What a guest sees when a venue has not put its menu up yet: a covered dish with steam rising and sparkles, tinted with
 * the venue's own accent so a café, a club and a restaurant each feel different. Pure SVG, no image assets.
 */
function CookingIllustration({ accent, dark }) {
  const plate = dark ? "#e5e7eb" : "#ffffff";
  const plateShadow = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const dome = dark ? "#f3f4f6" : "#fff7ed";
  const steam = dark ? "rgba(255,255,255,0.7)" : accent;
  return (
    <svg
      viewBox="0 0 240 200"
      width="240"
      height="200"
      role="img"
      aria-label="A covered dish with steam rising"
      data-testid="menu-empty-illustration"
    >
      {/* soft glow behind the dish */}
      <circle cx="120" cy="112" r="78" fill={accent} opacity="0.12" />
      <circle cx="120" cy="112" r="52" fill={accent} opacity="0.12" />

      {/* sparkles */}
      <g fill={accent}>
        <path d="M36 52 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" opacity="0.9" />
        <path d="M204 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" opacity="0.7" />
        <circle cx="198" cy="96" r="3" opacity="0.6" />
        <circle cx="44" cy="120" r="2.5" opacity="0.5" />
      </g>

      {/* steam */}
      <g fill="none" stroke={steam} strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M98 66 C88 54, 108 46, 98 34 C92 27, 98 20, 102 18" />
        <path d="M122 62 C112 48, 134 40, 122 26 C115 18, 122 10, 127 8" />
        <path d="M146 66 C136 54, 156 46, 146 34 C140 27, 146 20, 150 18" />
      </g>

      {/* cloche (dish cover) */}
      <path d="M52 132 C52 88, 82 72, 120 72 C158 72, 188 88, 188 132 Z" fill={dome} stroke={accent} strokeWidth="4" />
      <path d="M70 124 C72 98, 92 86, 112 83" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <circle cx="120" cy="66" r="9" fill={accent} />
      <circle cx="117" cy="63" r="3" fill="#fff" opacity="0.8" />

      {/* plate */}
      <ellipse cx="120" cy="140" rx="84" ry="14" fill={plateShadow} />
      <ellipse cx="120" cy="134" rx="84" ry="14" fill={plate} stroke={accent} strokeWidth="4" />
      <ellipse cx="120" cy="134" rx="60" ry="8" fill="none" stroke={accent} strokeWidth="2" opacity="0.35" />

      {/* little fork and spoon */}
      <g stroke={accent} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M30 178 L30 150 M24 150 L24 164 M36 150 L36 164 M24 164 C24 169, 36 169, 36 164" />
        <path d="M210 178 L210 158" />
        <ellipse cx="210" cy="150" rx="6" ry="9" fill={accent} stroke="none" />
      </g>
    </svg>
  );
}

function MenuEmptyState({ operationMode, venueName }) {
  const theme = themeFor(operationMode);
  const dark = isDarkTheme(operationMode);
  const name = typeof venueName === "string" && venueName.trim() ? venueName.trim() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center px-8 py-14 text-center"
      data-testid="menu-empty-state"
      data-venue={operationMode || "RESTAURANT"}
    >
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
        <CookingIllustration accent={theme.accent} dark={dark} />
      </motion.div>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: dark ? "#fff" : "#111827", mt: 1, fontFamily: theme.font }}
      >
        The kitchen is warming up
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: dark ? "rgba(255,255,255,0.75)" : "#6b7280", maxWidth: 460, mt: 1.5 }}
      >
        {name ? `${name} is putting the finishing touches on its menu.` : "This venue is putting the finishing touches on its menu."}{" "}
        Check back soon for something delicious.
      </Typography>
      <span
        className="mt-5 inline-block rounded-full px-4 py-1.5 text-base font-semibold"
        style={{ background: `${theme.accent}22`, color: dark ? "#fff" : theme.accent }}
      >
        {theme.icon} Menu coming soon
      </span>
    </motion.div>
  );
}

export default MenuEmptyState;
