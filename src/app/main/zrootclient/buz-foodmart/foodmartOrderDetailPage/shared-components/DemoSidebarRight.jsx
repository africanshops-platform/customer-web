import { Suspense, lazy } from "react";
import { Typography } from "@mui/material";
import { DeliveryDining, LocationOn, Store } from "@mui/icons-material";
import { useGetMartMenu } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";

const DeliveryRouteMap = lazy(() =>
  import("../../components/maps/DeliveryRouteMap")
);

function MapLoadingPlaceholder() {
  return (
    <div
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-3"
      style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", minHeight: 200 }}
    >
      <div
        className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500"
        style={{ animation: "spin 1s linear infinite" }}
      />
      <Typography variant="body2" sx={{ color: "#ea580c", fontWeight: 600 }}>
        Loading map…
      </Typography>
    </div>
  );
}

function DemoSidebarRight({ orderData }) {
  // The order only carries the restaurant's id, so the record (with its pin) is looked up, cached.
  const { data: martRes } = useGetMartMenu(typeof orderData?.foodMart === "string" ? orderData.foodMart : "");
  const restaurant  = typeof orderData?.foodMart === "object" && orderData?.foodMart ? orderData.foodMart : martRes?.data?.foodMart;
  const hasRestaurant = !!restaurant;
  const destination = orderData?.destinationLat != null && orderData?.destinationLng != null
    ? { lat: Number(orderData.destinationLat), lng: Number(orderData.destinationLng) }
    : null;

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)" }}
    >
      {/* Header */}
      <div
        className="m-4 mb-3 p-4 rounded-2xl flex items-center gap-3 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
        }}
      >
        <DeliveryDining sx={{ color: "white", fontSize: "1.75rem" }} />
        <div>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "white", lineHeight: 1.2 }}>
            Delivery Route
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)" }}>
            Restaurant → Your location
          </Typography>
        </div>
      </div>

      {/* Map */}
      <div className="mx-4 rounded-2xl overflow-hidden shadow-xl flex-1 min-h-0">
        <Suspense fallback={<MapLoadingPlaceholder />}>
          {hasRestaurant ? (
            <DeliveryRouteMap restaurant={restaurant} destination={destination} />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", minHeight: 200 }}
            >
              <span style={{ fontSize: "3rem" }}>📍</span>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "#ea580c" }}>
                Location Unavailable
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Restaurant location data is not yet available for this order.
              </Typography>
            </div>
          )}
        </Suspense>
      </div>

      {/* Restaurant info card */}
      {hasRestaurant && (
        <div
          className="mx-4 mt-3 mb-4 p-4 rounded-2xl flex-shrink-0"
          style={{
            background: "white",
            border: "1px solid rgba(229,231,235,1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.08) 100%)" }}
            >
              <Store sx={{ fontSize: "1.2rem", color: "#ea580c" }} />
            </div>
            <div className="flex-1 min-w-0">
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", mb: 0.5 }}>
                {restaurant?.title || "Restaurant"}
              </Typography>
              {(restaurant?.address || restaurant?.lga || restaurant?.state) && (
                <div className="flex items-start gap-1">
                  <LocationOn sx={{ fontSize: "0.95rem", color: "#9ca3af", mt: 0.15, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    {[restaurant?.address, restaurant?.lga, restaurant?.state].filter(Boolean).join(", ")}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoSidebarRight;
