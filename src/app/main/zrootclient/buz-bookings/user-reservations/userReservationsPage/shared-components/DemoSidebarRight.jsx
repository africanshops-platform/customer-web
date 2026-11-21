import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Restaurant, LocalBar, SportsEsports, LocationOn, Star, ChevronRight } from "@mui/icons-material";
import useGetAllFoodMarts from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import useNearMe from "src/app/main/zrootclient/shared-near/useNearMe";

/**
 * Explore Nearby (right sidebar of My Reservations / Trips): real restaurants, clubs and spots around the guest, from the same
 * food-mart listing the Restaurants, Clubs & Spots vertical uses, with a card that opens that venue's page.
 * Near the guest's own location when the browser shares it; otherwise the venues the platform lists, without distances.
 */

// The listing's categories, grouped into the three tabs shown here.
const GROUPS = {
  restaurant: ["restaurant", "cafe", "bakery", "fastfood"],
  club: ["club", "bar", "lounge"],
  spot: ["spot"],
};

const CATEGORY_LABEL = {
  restaurant: "Restaurant",
  cafe: "Café",
  bakery: "Bakery",
  fastfood: "Fast food",
  club: "Club",
  bar: "Bar",
  lounge: "Lounge",
  spot: "Spot",
};

function groupOf(category) {
  const c = String(category || "").toLowerCase();
  return Object.keys(GROUPS).find((g) => GROUPS[g].includes(c)) || "restaurant";
}

function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return null;
  const n = Number(km);
  return n < 1 ? `${Math.round(n * 1000)} m` : `${n.toFixed(1)} km`;
}

function DemoSidebarRight() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const nm = useNearMe(undefined);
  const filters = useMemo(() => ({ limit: 24, offset: 0, ...(nm.nearParams || {}) }), [nm.nearParams]);
  const { data, isLoading, isError } = useGetAllFoodMarts(filters);
  const places = useMemo(() => data?.data?.foodmarts ?? data?.data?.foodMarts ?? data?.data?.items ?? [], [data]);

  const categories = [
    { id: "all", label: "All", icon: LocationOn },
    { id: "restaurant", label: "Restaurants", icon: Restaurant },
    { id: "club", label: "Clubs", icon: LocalBar },
    { id: "spot", label: "Spots", icon: SportsEsports },
  ];

  const filtered = selectedCategory === "all" ? places : places.filter((p) => groupOf(p.foodMartCategory) === selectedCategory);
  const open = (p) => navigate(`/foodmarts/${p.slug}/visit-mart/${p.slug}`);

  return (
    <div className="h-full flex flex-col p-6 md:p-8 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="h-1 w-16 rounded-full mb-4" style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }} />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Explore Nearby</h2>
        <p className="text-sm text-gray-600">
          {nm.nearParams ? "Restaurants, clubs and spots around you" : "Restaurants, clubs and spots on AfricanShops"}
        </p>
        {!nm.nearParams && (
          <button
            type="button"
            onClick={() => nm.useMyLocation()}
            className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
          >
            Use my location to see what's close
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#ea580c #f5f5f4" }}
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive ? "text-white shadow-md" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" } : {}}
            >
              <Icon sx={{ fontSize: "1rem" }} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading && <p className="text-sm text-gray-500 text-center py-8">Finding places…</p>}
        {isError && <p className="text-sm text-gray-500 text-center py-8">Couldn't load places right now.</p>}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            {places.length === 0 ? "No places to show yet." : "Nothing in this category nearby."}
          </p>
        )}

        {filtered.map((place, index) => {
          const distance = formatDistance(place.distanceKm);
          const rating = place.rating ? parseFloat(place.rating).toFixed(1) : null;
          return (
            <motion.div
              key={place.id || place._id || place.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group border border-gray-100"
              role="link"
              tabIndex={0}
              onClick={() => open(place)}
              onKeyDown={(e) => e.key === "Enter" && open(place)}
            >
              <div
                className="relative h-32 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)" }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-orange-300 select-none">
                  {String(place.title || "?").charAt(0).toUpperCase()}
                </span>
                {place.imageSrc && (
                  <img
                    src={place.imageSrc}
                    alt=""
                    aria-label={place.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)" }}
                />
                {distance && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <LocationOn sx={{ fontSize: "0.875rem", color: "#ea580c" }} />
                    {distance}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight flex-1 pr-2">{place.title}</h3>
                  {rating && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50">
                      <Star sx={{ fontSize: "0.875rem", color: "#f97316" }} />
                      <span className="text-xs font-semibold text-orange-600">{rating}</span>
                    </div>
                  )}
                </div>
                {place.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{place.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">
                    {CATEGORY_LABEL[String(place.foodMartCategory || "").toLowerCase()] || "Venue"}
                  </span>
                  <div className="flex items-center text-xs font-semibold group-hover:text-orange-600 transition-colors">
                    <span
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      View Details
                    </span>
                    <ChevronRight sx={{ fontSize: "1rem", color: "#ea580c" }} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200"
      >
        <button type="button" onClick={() => navigate("/foodmarts/listings")} className="w-full text-xs text-gray-700 text-center">
          <span className="font-semibold text-orange-700">
            {filtered.length} {filtered.length === 1 ? "place" : "places"}
          </span>{" "}
          {nm.nearParams ? "nearby" : "to explore"} ·{" "}
          <span className="font-semibold text-orange-700 underline">See all restaurants, clubs &amp; spots</span>
        </button>
      </motion.div>
    </div>
  );
}

export default DemoSidebarRight;
