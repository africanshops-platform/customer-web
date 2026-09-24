import { useMemo } from "react";
import { motion } from "framer-motion";
import { Typography, CircularProgress, Chip } from "@mui/material";
import { MapOutlined, LocationOn } from "@mui/icons-material";
import { useGetBookingProperty } from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
import useCountries from "src/app/hooks/useCountries";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom orange marker icon
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQ4QzE2IDQ4IDMyIDI5LjMzMzMgMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOS4zMzMzIDE2IDQ4IDE2IDQ4WiIgZmlsbD0iI0VBNTgwQyIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

/**
 * DemoSidebarRight Component
 * Beautiful map showing the location of the booked apartment
 */
function DemoSidebarRight(props) {
  const { reservation, isLoading: reservationLoading, isError: reservationError } = props;
  // Get the property ID from the reservation
  const propertyId = reservation?.bookingPropertyId;

  // Fetch property details using the property ID
  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useGetBookingProperty(propertyId);

  const { getByValue } = useCountries();

  // Get coordinates from the property location
  const coordinates = useMemo(() => {
    if (!booking?.data?.listing?.locationValue) {
      return null;
    }
    return getByValue(booking.data.listing.locationValue)?.latlng;
  }, [booking?.data?.listing?.locationValue, getByValue]);

  const property = booking?.data?.listing;
  const isLoading = reservationLoading || bookingLoading;
  const isError = reservationError || bookingError;

  // Loading State
  if (isLoading) {
    return (
      <div
        className="flex flex-col h-screen p-6"
        style={{
          background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <CircularProgress size={60} thickness={4} sx={{ color: "#ea580c" }} />
            <Typography
              variant="h6"
              className="font-semibold"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Loading map...
            </Typography>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !coordinates) {
    return (
      <div
        className="flex flex-col h-screen p-6"
        style={{
          background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <MapOutlined sx={{ fontSize: "4rem", color: "#d1d5db", mb: 2 }} />
            <Typography variant="h6" className="text-gray-600">
              Unable to load location
            </Typography>
            <Typography variant="body2" className="text-gray-500 mt-2">
              Location data not available for this property
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
        }}
      >
        <MapOutlined sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
          }}
        >
          Property Location
        </Typography>
      </motion.div>

      {/* Property Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 p-4 bg-white rounded-xl shadow-md"
      >
        <div className="flex items-start gap-3">
          <LocationOn sx={{ color: "#ea580c", fontSize: "1.5rem", mt: 0.5 }} />
          <div className="flex-1">
            <Typography variant="h6" className="font-bold text-gray-900 mb-1">
              {property?.title || "Your Booked Property"}
            </Typography>
            {property?.address && (
              <Typography variant="body2" className="text-gray-600">
                {property.address}
              </Typography>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Map Badge Overlay */}
        <div
          className="absolute top-4 left-4 z-[1000]"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            padding: "8px 16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Chip
            label="Your Property"
            sx={{
              backgroundColor: "#ea580c",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
          />
        </div>

        <MapContainer
          center={coordinates}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={true}
          className="w-full h-full"
          style={{ minHeight: "100%" }}
        >
          {/* Tile Layer */}
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
          {/* Esri splits the light canvas into a base fill layer and a separate
              roads/borders/labels overlay -- CARTO's light_all bundled both into
              one tile. Added for parity/clarity (founder feedback 2026-09-24). */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />

          {/* Property Marker */}
          <Marker position={coordinates} icon={customIcon}>
            <Popup maxWidth={300} className="custom-popup">
              <div className="flex flex-col gap-3 p-3">
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "#111827",
                    lineHeight: 1.3,
                  }}
                >
                  {property?.title}
                </Typography>

                {property?.address && (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    📍 {property.address}
                  </Typography>
                )}

                {property?.roomCount && (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    🛏️ {property.roomCount} {property.roomCount === 1 ? "Bedroom" : "Bedrooms"}
                  </Typography>
                )}

                <div
                  className="mt-2 p-2 rounded-lg text-center"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    Your Booked Property
                  </Typography>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Custom CSS for popup styling */}
        <style jsx global>{`
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
            padding: 0;
            overflow: hidden;
          }

          .custom-popup .leaflet-popup-content {
            margin: 0;
            min-width: 250px;
            max-width: 300px;
          }

          .custom-popup .leaflet-popup-tip {
            background: white;
          }

          .leaflet-container {
            font-family: inherit;
          }

          .custom-popup .leaflet-popup-close-button {
            font-size: 24px;
            font-weight: bold;
            color: #6b7280;
            padding: 8px 12px;
            transition: all 0.3s ease;
          }

          .custom-popup .leaflet-popup-close-button:hover {
            color: #ea580c;
            background-color: rgba(234, 88, 12, 0.1);
            border-radius: 8px;
          }
        `}</style>
      </motion.div>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md"
      >
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          📍 Location of your booked property
        </Typography>
      </motion.div>
    </div>
  );
}

export default DemoSidebarRight;
