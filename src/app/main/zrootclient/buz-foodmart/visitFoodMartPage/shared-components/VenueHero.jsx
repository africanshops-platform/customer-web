import { motion } from "framer-motion";
import { themeFor } from "../venueThemes";

/**
 * The first thing a guest sees: the venue's own photo under a treatment that matches what kind of place it is.
 */
function VenueHero({ foodMart }) {
  const theme = themeFor(foodMart?.operationMode);
  const image = foodMart?.imageSrc || foodMart?.imageSrcs?.[0]?.url;
  const place = [foodMart?.address, foodMart?.city].filter(Boolean).join(" · ");

  return (
    <header
      className="venue-hero relative overflow-hidden"
      style={{ background: theme.hero, color: "#fff", fontFamily: theme.font }}
      data-testid="venue-hero"
      data-venue={foodMart?.operationMode || "RESTAURANT"}
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.28, mixBlendMode: "luminosity" }}
        />
      )}
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-6 py-12 sm:px-10 sm:py-16">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-base font-semibold"
          style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)" }}
        >
          <span aria-hidden>{theme.icon}</span>
          {theme.label}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="m-0 font-extrabold leading-tight"
          style={{ fontSize: "clamp(3.2rem, 6vw, 5.6rem)" }}
        >
          {foodMart?.title || "Welcome"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="m-0 max-w-3xl"
          style={{ fontSize: "clamp(1.7rem, 2.4vw, 2.2rem)", opacity: 0.95 }}
        >
          {theme.headline}. {theme.tagline}
        </motion.p>
        <div className="mt-2 flex flex-wrap gap-3">
          {theme.chips.map((c) => (
            <span key={c} className="rounded-full px-4 py-1.5 text-base font-medium" style={{ background: "rgba(0,0,0,0.28)" }}>
              {c}
            </span>
          ))}
        </div>
        {place && <p className="m-0 text-lg" style={{ opacity: 0.9 }}>📍 {place}</p>}
      </div>
    </header>
  );
}

export default VenueHero;
