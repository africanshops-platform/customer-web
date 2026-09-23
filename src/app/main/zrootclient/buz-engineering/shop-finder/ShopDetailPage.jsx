import { useParams, useNavigate } from "react-router-dom";
import { Chip, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import useGetEngineeringShop from "app/configs/data/server-calls/engineering/useEngineeringShopRepo";
import EngineeringShopFinderMap from "../components/maps/EngineeringShopFinderMap";

/**
 * ShopDetailPage — real shop info reached from the map/list finder
 * (Phase E6b). Registering a machine and booking a service against this
 * shop lands here once Phase E6c ships.
 */
function ShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: shopResp, isLoading, isError } = useGetEngineeringShop(id);
  const shop = shopResp?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <CircularProgress sx={{ color: "#0f766e" }} />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop not found</h2>
        <p className="text-gray-500 mb-6">This repair shop may have been removed.</p>
        <button
          type="button"
          onClick={() => navigate("/engineering/find-shops")}
          className="text-teal-700 font-semibold"
        >
          ← Back to shop finder
        </button>
      </div>
    );
  }

  const hasCoords = shop.latitude != null && shop.longitude != null;

  return (
    <div className="min-h-full bg-gray-50">
      <div
        className="text-white py-10 px-6 md:px-12"
        style={{ background: "linear-gradient(to bottom right, #0f766e, #134e4a)" }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/engineering/find-shops")}
            className="flex items-center gap-1 text-teal-100 hover:text-white mb-4 text-sm font-semibold"
          >
            <ArrowBackIcon sx={{ fontSize: "1rem" }} /> Back to shop finder
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BuildIcon sx={{ fontSize: "1.75rem" }} />
            <h1 className="text-2xl md:text-3xl font-black">{shop.name}</h1>
          </div>
          {[shop.ward, shop.lga, shop.state, shop.country].filter(Boolean).length > 0 && (
            <p className="text-teal-100 flex items-center gap-1">
              <LocationOnIcon sx={{ fontSize: "1rem" }} />
              {[shop.ward, shop.lga, shop.state, shop.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          {shop.coverImage && (
            <img src={shop.coverImage} alt={shop.name} className="w-full h-56 object-cover rounded-2xl" />
          )}

          {shop.specialties?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {shop.specialties.map((s) => (
                  <Chip key={s} label={s.replace(/_/g, " ")} sx={{ backgroundColor: "#f0fdfa", color: "#0f766e", fontWeight: 600 }} />
                ))}
              </div>
            </div>
          )}

          {shop.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">About this shop</h3>
              <p className="text-gray-600">{shop.description}</p>
            </div>
          )}

          {shop.bays != null && (
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Service bays</h3>
              <p className="text-gray-600">{shop.bays}</p>
            </div>
          )}

          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
            <p className="text-teal-800 text-sm">
              Registering a machine and booking a service with this shop is coming soon to this page.
            </p>
          </div>
        </div>

        <div className="h-72 md:h-full min-h-[280px]">
          {hasCoords ? (
            <EngineeringShopFinderMap shops={[shop]} userPosition={null} />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              Location not set for this shop yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopDetailPage;
