import ImprovedFoodMartMap from "../../components/maps/ImprovedFoodMartMap";
import FoodMartMapLoadingPlaceholder from "./FoodMartMapLoadingPlaceholder";
import { Typography } from "@mui/material";
import { MapOutlined } from "@mui/icons-material";

function DemoSidebarRight({ listingsData, near, radiusKm, userPoint }) {
  // With near-me on, "no results" is a real answer (the map still shows the search point and radius), not a load state.
  const isLoading = !listingsData || (listingsData.length === 0 && !near);

  if (isLoading) {
    return <FoodMartMapLoadingPlaceholder />;
  }

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
        }}
      >
        <MapOutlined sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
          Restaurant Locations
        </Typography>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
        <ImprovedFoodMartMap items={listingsData} near={near} radiusKm={radiusKm} userPoint={userPoint} />
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Typography
          sx={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}
        >
          Click on markers to view restaurant details
        </Typography>
      </div>
    </div>
  );
}

export default DemoSidebarRight;
