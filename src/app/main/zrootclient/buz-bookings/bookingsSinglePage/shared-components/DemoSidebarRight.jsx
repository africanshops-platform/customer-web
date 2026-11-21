import { motion } from "framer-motion";
import { Typography, Card, CardContent } from "@mui/material";
import { CalendarMonth, Star, VerifiedUser, TrendingUp } from "@mui/icons-material";
import DetailsRight from "../../bookings-components/DetailsRight";

/**
 * DemoSidebarRight Component - REDESIGNED
 * Professional booking sidebar with compelling UX
 */

function DemoSidebarRight(props) {
  const {
    isLoading,
    listing,
    locationValue,
    coordinates,
    price,
    totalPrice,
    onChangeDate,
    dateRange,
    onSubmit,
    disabled,
    disabledDates,
  } = props;

  return (
    <div
      className="flex flex-col h-screen p-6 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <CalendarMonth
              sx={{
                color: "white",
                fontSize: "2rem",
              }}
            />
            <Typography
              sx={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "white",
              }}
            >
              Book Your Stay
            </Typography>
          </div>
          <Typography
            sx={{
              fontSize: "1.325rem",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Select dates and reserve this amazing property
          </Typography>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <Star sx={{ color: "#fbbf24", fontSize: "1.75rem", mb: 0.5 }} />
            <Typography sx={{ fontSize: "1rem", color: "#6b7280", textAlign: "center" }}>
              Highly Rated
            </Typography>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <VerifiedUser sx={{ color: "#10b981", fontSize: "1.75rem", mb: 0.5 }} />
            <Typography sx={{ fontSize: "1rem", color: "#6b7280", textAlign: "center" }}>
              Verified
            </Typography>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <TrendingUp sx={{ color: "#3b82f6", fontSize: "1.75rem", mb: 0.5 }} />
            <Typography sx={{ fontSize: "1rem", color: "#6b7280", textAlign: "center" }}>
              Popular
            </Typography>
          </div>
        </div>
      </motion.div>

      {/* Rating Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
          }}
        >
          <CardContent sx={{ padding: "20px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.75rem",
                      fontWeight: 900,
                      color: "white",
                    }}
                  >
                    4.3
                  </Typography>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        sx={{
                          fontSize: "1.25rem",
                          color: star <= 4 ? "#fbbf24" : "#d1d5db",
                        }}
                      />
                    ))}
                  </div>
                  <Typography
                    sx={{
                      fontSize: "1.125rem",
                      color: "#6b7280",
                    }}
                  >
                    Based on 45 reviews
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1"
      >
        <Card
          sx={{
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ padding: "0" }}>
            {isLoading ? (
              <div className="p-8 text-center">
                <Typography sx={{ fontSize: "1.125rem", color: "#6b7280" }}>
                  Loading booking information...
                </Typography>
              </div>
            ) : listing ? (
              <DetailsRight
                listing={listing}
                locationValue={locationValue}
                coordinates={coordinates}
                price={price}
                totalPrice={totalPrice}
                onChangeDate={onChangeDate}
                dateRange={dateRange}
                onSubmit={onSubmit}
                disabled={disabled}
                disabledDates={disabledDates}
              />
            ) : (
              <div className="p-8 text-center">
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    color: "#6b7280",
                  }}
                >
                  Booking information not available
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        // className="mt-2"
      >
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-start gap-3">
            <VerifiedUser sx={{ color: "#10b981", fontSize: "1.5rem" }} />
            <div>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#047857",
                  marginBottom: "4px",
                }}
              >
                Secure Booking Guarantee
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#059669",
                  lineHeight: 1.5,
                }}
              >
                Your payment is protected.
              </Typography>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DemoSidebarRight;

/*
 * OLD COMPONENT BACKUP (before redesign)
 * Located at: DemoSidebarRight_OLD_BACKUP.jsx
 */
