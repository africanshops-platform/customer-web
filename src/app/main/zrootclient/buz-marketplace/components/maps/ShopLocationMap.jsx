import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Typography, Chip, Divider } from "@mui/material";
import { LocationOnOutlined, Store, Phone, Verified } from "@mui/icons-material";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom shop location marker icon (orange/red)
const shopIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI2VhNTgwYyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

/**
 * MapBounds Component
 * Automatically adjusts map view to fit the shop location
 */
function MapBounds({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

/**
 * ShopLocationMap Component
 * Shows the exact location of the product shop
 * Uses dummy data for demonstration - will be replaced with API data
 */
function ShopLocationMap({ shopData }) {
  // Dummy data for shop location
  // This will be replaced with actual shop data from API
  const shopLocation = useMemo(() => {
    // Use provided shopData or fallback to dummy data
    return (
      shopData || {
        id: "shop-123",
        shopName: "Premium Electronics Store",
        address: "123 Marina Road, Lagos Island",
        city: "Lagos",
        state: "Lagos State",
        country: "Nigeria",
        coordinates: [6.4541, 3.3947], // Lagos Island coordinates
        zoom: 14,
        phone: "+234 803 123 4567",
        isVerified: true,
        rating: 4.8,
        totalSales: 1234,
      }
    );
  }, [shopData]);
  

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-lg">
      {/* Map Header Overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] p-4"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Store sx={{ color: "white", fontSize: "1.5rem" }} />
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "white",
                textShadow: "0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              Shop Location
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              label={shopLocation.state}
              icon={<LocationOnOutlined />}
              sx={{
                backgroundColor: "rgba(234, 88, 12, 0.95)",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.875rem",
                backdropFilter: "blur(10px)",
                maxWidth: "fit-content",
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />
            {shopLocation.isVerified && (
              <Chip
                label="Verified"
                icon={<Verified />}
                size="small"
                sx={{
                  backgroundColor: "rgba(16, 185, 129, 0.95)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  backdropFilter: "blur(10px)",
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Shop Info Badge */}
      <div
        className="absolute bottom-4 left-4 right-4 z-[1000]"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          {shopLocation.shopName}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          {shopLocation.address}
        </Typography>
        <Divider sx={{ marginBottom: "12px" }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone sx={{ fontSize: "1rem", color: "#10b981" }} />
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#10b981",
              }}
            >
              Call Seller
            </Typography>
          </div>
          <div className="text-right">
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              {shopLocation.totalSales.toLocaleString()} sales
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#f59e0b",
              }}
            >
              ⭐ {shopLocation.rating}
            </Typography>
          </div>
        </div>
      </div>

      <MapContainer
        center={shopLocation.coordinates}
        zoom={shopLocation.zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        {/* Custom Tile Layer - Using CartoDB Positron for better aesthetics */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          subdomains="abcd"
          maxZoom={16}
        />

        {/* Auto-adjust bounds */}
        <MapBounds center={shopLocation.coordinates} zoom={shopLocation.zoom} />

        {/* Shop Location Marker */}
        <Marker position={shopLocation.coordinates} icon={shopIcon}>
          <Popup maxWidth={320} className="shop-popup">
            <div className="flex flex-col gap-3 p-3">
              <div className="flex items-center gap-2">
                <Store sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "#111827",
                  }}
                >
                  {shopLocation.shopName}
                </Typography>
              </div>

              {shopLocation.isVerified && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <Verified sx={{ color: "#10b981", fontSize: "1.25rem" }} />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#065f46",
                      fontWeight: 600,
                    }}
                  >
                    Verified Seller
                  </Typography>
                </div>
              )}

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <LocationOnOutlined sx={{ color: "#ea580c", fontSize: "1.25rem" }} />
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      color: "#c2410c",
                      fontWeight: 600,
                    }}
                  >
                    Address
                  </Typography>
                </div>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  {shopLocation.address}
                  <br />
                  {shopLocation.city}, {shopLocation.state}
                  <br />
                  {shopLocation.country}
                </Typography>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>Rating</Typography>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#f59e0b",
                    }}
                  >
                    ⭐ {shopLocation.rating}
                  </Typography>
                </div>
                <div className="text-right">
                  <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    Total Sales
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#10b981",
                    }}
                  >
                    {shopLocation.totalSales.toLocaleString()}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <Phone sx={{ color: "#3b82f6", fontSize: "1.25rem" }} />
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: "#1e40af",
                    fontWeight: 600,
                  }}
                >
                  {shopLocation.phone}
                </Typography>
              </div>

              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  fontStyle: "italic",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                Click the phone number to call the seller
              </Typography>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .shop-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          padding: 0;
          overflow: hidden;
        }

        .shop-popup .leaflet-popup-content {
          margin: 0;
          min-width: 300px;
        }

        .shop-popup .leaflet-popup-tip {
          background: white;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .shop-popup .leaflet-popup-close-button {
          font-size: 24px;
          font-weight: bold;
          color: #6b7280;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }

        .shop-popup .leaflet-popup-close-button:hover {
          color: #ea580c;
          background-color: rgba(234, 88, 12, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default ShopLocationMap;
