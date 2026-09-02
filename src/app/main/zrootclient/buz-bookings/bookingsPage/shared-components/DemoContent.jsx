import { motion } from "framer-motion";
import { Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import BookingCard from "./BookingCard";
import PaginationBar from "./PaginationBar";
import ContentLoadingPlaceholder from "./ContentLoadingPlaceholder";

/**
 * Demo Content
 */
function DemoContent(props) {
  const {
    isLoading,
    isError,
    listings,
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
  } = props;

  // Fallback: if totalItems is not provided by backend, estimate based on listings length
  // This assumes if we get less than itemsPerPage, we're on the last page
  const estimatedTotal = totalItems > 0 ? totalItems : listings?.length || 0;

  // Show loading placeholder
  if (isLoading) {
    return <ContentLoadingPlaceholder />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retriving listings"} />
      </motion.div>
    );
  }
  /***No listings found */

  if (!listings?.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        className="flex flex-col flex-1 items-center justify-center min-h-screen"
        style={{
          background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)",
        }}
      >
        <div className="flex flex-col items-center justify-center max-w-2xl px-8 text-center">
          {/* Icon/Visual Element */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            className="mb-8"
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity="0.3"
              />
              <path d="M80 35L95 55H65L80 35Z" fill="currentColor" opacity="0.2" />
              <rect
                x="50"
                y="55"
                width="60"
                height="50"
                rx="4"
                fill="currentColor"
                opacity="0.15"
              />
              <rect
                x="60"
                y="70"
                width="15"
                height="20"
                rx="2"
                fill="currentColor"
                opacity="0.25"
              />
              <rect
                x="85"
                y="70"
                width="15"
                height="20"
                rx="2"
                fill="currentColor"
                opacity="0.25"
              />
              <circle cx="80" cy="115" r="15" fill="currentColor" opacity="0.2" />
            </svg>
          </motion.div>

          {/* Heading */}
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
              No Listings Available
            </Typography>
          </motion.div>

          {/* Description */}
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
              There are currently no property listings available at this time. Please check back
              later or adjust your search filters to discover new opportunities.
            </Typography>
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
            className="flex items-center gap-2 mt-4"
          >
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex-auto p-24 sm:p-40"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="mb-8">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: "8px",
              fontSize: "2rem",
            }}
          >
            Available Properties
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              fontSize: "1.125rem",
            }}
          >
            Find your perfect accommodation from our curated listings
          </Typography>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg mb-8">
          {listings?.map((property) => (
            <BookingCard
              key={property?.id || property?._id}
              id={property?.id || property?._id}
              slug={property?.slug}
              images={property?.listingImages || []}
              title={property?.title}
              address={property?.address}
              price={property?.price}
              roomCount={property?.roomCount}
              rating={property?.rating || 4.5}
              reviewCount={property?.reviewCount || 9}
              category={property?.category}
              bookingPeriod={property?.bookingPeriod}
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
