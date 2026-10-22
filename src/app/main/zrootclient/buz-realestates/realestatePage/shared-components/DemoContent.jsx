import { motion } from "framer-motion";
import { Skeleton, Card, CardContent, Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import BookingCard from "./BookingCard";
import PaginationBar from "./PaginationBar";

/**
 * Demo Content — real-estate property grid, styled to match the bookings
 * listings page (gradient background, header copy, same card/pagination
 * treatment) since both are meant to feel like one product.
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
  const estimatedTotal = totalItems > 0 ? totalItems : listings?.length || 0;

  if (isLoading) {
    return (
      <div className="flex-auto p-24 sm:p-40">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Card key={index} className="rounded-2xl shadow-lg overflow-hidden">
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={280}
                  animation="wave"
                  sx={{ bgcolor: "grey.200" }}
                />
                <CardContent className="p-6">
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={32}
                    animation="wave"
                    sx={{ bgcolor: "grey.200", marginBottom: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={24}
                    animation="wave"
                    sx={{ bgcolor: "grey.200", marginBottom: 2 }}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton
                      variant="text"
                      width={120}
                      height={36}
                      animation="wave"
                      sx={{ bgcolor: "grey.200" }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={36}
                      animation="wave"
                      sx={{ bgcolor: "grey.200", borderRadius: 2 }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message="Error occurred while retrieving properties" />
      </motion.div>
    );
  }

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
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "16px",
              fontSize: { xs: "1.875rem", sm: "2.25rem" },
            }}
          >
            No Properties Found
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              lineHeight: 1.7,
            }}
          >
            There are currently no property listings matching your search. Try adjusting your
            filters or check back later for new listings.
          </Typography>
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
            sx={{ fontWeight: 800, color: "#1f2937", marginBottom: "8px", fontSize: "2rem" }}
          >
            Available Properties
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280", fontSize: "1.125rem" }}>
            Find your next home or investment from our curated real-estate listings
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
              price={property?.price}
              roomCount={property?.roomCount}
              sittingroomCount={property?.sittingroomCount}
              rating={property?.rating || 0}
              reviewCount={property?.numReviews || 0}
              propertyUseCase={property?.propertyUseCase}
              leaseTerm={property?.leaseTerm}
              propertyCountryName={property?.propertyCountryName}
              propertyStateName={property?.propertyStateName}
              propertyLgaName={property?.propertyLgaName}
              distanceKm={property?.distanceKm}
            />
          ))}
        </div>

        {/* Pagination Bar */}
        <PaginationBar
          totalItems={estimatedTotal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
}

export default DemoContent;
