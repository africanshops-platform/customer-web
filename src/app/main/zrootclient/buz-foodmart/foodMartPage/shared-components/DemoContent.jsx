import { motion } from "framer-motion";
import { Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import FoodMartCard from "./FoodMartCard";
import PaginationBar from "./PaginationBar";
import FoodMartContentLoadingPlaceholder from "./FoodMartContentLoadingPlaceholder";

function DemoContent({
  isLoading,
  isError,
  foodMarts,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const estimatedTotal = totalItems > 0 ? totalItems : foodMarts?.length || 0;

  if (isLoading) {
    return <FoodMartContentLoadingPlaceholder />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message="Error occurred while retrieving restaurants" />
      </motion.div>
    );
  }

  if (!foodMarts || foodMarts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen"
        style={{
          background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fff7ed 100%)",
        }}
      >
        <div className="flex flex-col items-center justify-center max-w-2xl px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            className="mb-8"
          >
            <span style={{ fontSize: "7rem", lineHeight: 1 }}>🍽️</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "16px",
                fontSize: { xs: "1.875rem", sm: "2.25rem" },
              }}
            >
              No Restaurants Found
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#6b7280",
                fontSize: { xs: "1rem", sm: "1.125rem" },
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              There are no restaurants or dining spots matching your filters right now. Try adjusting
              your search criteria or check back later.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
            className="flex items-center gap-2 mt-4"
          >
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex-auto p-24 sm:p-40"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fff7ed 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="mb-8">
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#1f2937", marginBottom: "8px", fontSize: "3.2rem" }}
          >
            Available Restaurants
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280", fontSize: "1.8rem" }}>
            Discover great dining spots, bars, and food experiences near you
          </Typography>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg mb-8">
          {foodMarts?.map((foodMart) => (
            <FoodMartCard
              key={foodMart?.id || foodMart?._id}
              id={foodMart?.id || foodMart?._id}
              slug={foodMart?.slug}
              imageSrc={foodMart?.imageSrc || ""}
              title={foodMart?.title}
              description={foodMart?.description}
              address={foodMart?.address}
              phoneNumber={foodMart?.phoneNumber}
              rating={foodMart?.rating}
              numReviews={foodMart?.numReviews}
              foodMartCategory={foodMart?.foodMartCategory}
              operationMode={foodMart?.operationMode}
              busniessOpenPeriod={foodMart?.busniessOpenPeriod}
              busniessClosePeriod={foodMart?.busniessClosePeriod}
              isFeatured={foodMart?.isFeatured}
            />
          ))}
        </div>

        {/* Pagination Bar */}
        {estimatedTotal > itemsPerPage && (
          <PaginationBar
            totalItems={estimatedTotal}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
}

export default DemoContent;
