import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useGetAllEstateProperties from "app/configs/data/server-calls/auth/userapp/a_estates/useEstatePropertiesRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";
import NearMeBar from "../../shared-near/NearMeBar";
import useNearMe from "../../shared-near/useNearMe";

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

/**
 * Active Real Estate Page Component
 * This component renders when the real estate service is ACTIVE
 */
function ActiveRealEstatePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  // Filter state management
  const [filters, setFilters] = useState({});

  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  // ── Near me (tracker customer-22; shared with bookings + food venues) ────────────────────────────────────────────
  // goFirstPage is declared below; the hook only calls it from event handlers, so the late binding is safe.
  const goFirstPageRef = useRef(() => {});
  const nm = useNearMe(useCallback(() => goFirstPageRef.current(), []));

  // Near-me adds lat/lng/radiusKm to the very same query (with explicit paging: `filters` is empty until a filter is used),
  // so the other filters and the pagination keep working.
  const queryFilters = useMemo(
    () => (nm.nearParams ? { ...filters, limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage, ...nm.nearParams } : filters),
    [filters, nm.nearParams, itemsPerPage, currentPage],
  );

  // Fetch estate properties with filters
  const { data: estateLists, isLoading, isError } = useGetAllEstateProperties(queryFilters);

  // Handle filter changes from FilterList component. Maps only to query
  // params the gateway's estate-properties/get-listings route actually
  // declares (limit, offset, minPrice, maxPrice, propertyCountry,
  // propertyState, propertyLga, roomCount, sittingroomCount, minSqmArea,
  // maxSqmArea, minReviews, title, propertyUseCase) — no category/
  // bathroomCount/checkedAmenities support exists on the backend at all.
  const handleFilterChange = useCallback(
    (newFilters) => {
      const apiFilters = {};

      // Pagination parameters
      apiFilters.limit = itemsPerPage;
      apiFilters.offset = (currentPage - 1) * itemsPerPage;

      // Keyword search (title, contains match)
      if (newFilters.keyword) {
        apiFilters.title = newFilters.keyword;
      }

      // RENT vs SALE
      if (newFilters.propertyUseCase) {
        apiFilters.propertyUseCase = newFilters.propertyUseCase;
      }

      // Location filters
      if (newFilters.country) {
        apiFilters.propertyCountry = newFilters.country;
      }
      if (newFilters.state) {
        apiFilters.propertyState = newFilters.state;
      }
      if (newFilters.lga) {
        apiFilters.propertyLga = newFilters.lga;
      }

      // Price range
      if (newFilters.priceRange && Array.isArray(newFilters.priceRange)) {
        apiFilters.minPrice = newFilters.priceRange[0];
        apiFilters.maxPrice = newFilters.priceRange[1];
      }

      // Room count
      if (newFilters.roomCount) {
        apiFilters.roomCount = newFilters.roomCount;
      }

      // Sitting room count
      if (newFilters.sittingroomCount) {
        apiFilters.sittingroomCount = newFilters.sittingroomCount;
      }

      // Choosing a Country / State / LGA / District while near-me is on recentres the search on that region's centre.
      nm.applyRegion(newFilters.regionCenter);

      // Update filters state (this will trigger useGetAllEstateProperties to refetch)
      setFilters(apiFilters);
    },
    [itemsPerPage, currentPage, nm.applyRegion],
  );

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const goFirstPage = useCallback(() => setCurrentPage(1), []);
  goFirstPageRef.current = goFirstPage;

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Sync pagination changes with filters
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      }));
    }
  }, [currentPage, itemsPerPage]);

  // Memoize sidebar toggle handlers to prevent re-renders
  const handleLeftSidebarToggle = useCallback(() => {
    setLeftSidebarOpen(!leftSidebarOpen);
  }, [leftSidebarOpen]);

  const handleRightSidebarToggle = useCallback(() => {
    setRightSidebarOpen(!rightSidebarOpen);
  }, [rightSidebarOpen]);

  const handleLeftSidebarClose = useCallback(() => {
    setLeftSidebarOpen(false);
  }, []);

  const handleRightSidebarClose = useCallback(() => {
    setRightSidebarOpen(false);
  }, []);

  // Memoize derived data to avoid recalculation on every render
  const propertyListings = useMemo(
    () => estateLists?.data?.propertyListings,
    [estateLists?.data?.propertyListings],
  );
  const totalItems = useMemo(
    () => estateLists?.data?.pagination?.total || 0,
    [estateLists?.data?.pagination?.total],
  );

  // Memoize header component
  const headerComponent = useMemo(
    () => (
      <DemoHeader
        leftSidebarToggle={handleLeftSidebarToggle}
        rightSidebarToggle={handleRightSidebarToggle}
      />
    ),
    [handleLeftSidebarToggle, handleRightSidebarToggle],
  );

  // Memoize content component
  const contentComponent = useMemo(
    () => (
      <div className="flex flex-col w-full">
        <div className="px-8 pt-6">
          <NearMeBar
            near={nm.near}
            radiusKm={nm.radiusKm}
            status={nm.gps.status}
            total={totalItems}
            isLoading={isLoading}
            onUseMyLocation={nm.useMyLocation}
            onPickPlace={nm.pickPlace}
            onRadius={nm.changeRadius}
            onClear={nm.clear}
          />
        </div>
        <DemoContent
          listings={propertyListings}
          isLoading={isLoading}
          isError={isError}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    ),
    [
      nm.near,
      nm.radiusKm,
      nm.gps.status,
      nm.useMyLocation,
      nm.pickPlace,
      nm.changeRadius,
      nm.clear,
      propertyListings,
      isLoading,
      isError,
      totalItems,
      currentPage,
      itemsPerPage,
      handlePageChange,
      handleItemsPerPageChange,
    ],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(
    () => <DemoSidebar onFilterChange={handleFilterChange} />,
    [handleFilterChange],
  );

  // Memoize right sidebar content — property-location map, visible to
  // guests and logged-in users alike (mirrors bookings, no auth gate).
  const rightSidebarContentComponent = useMemo(
    () => <DemoSidebarRight propertyListings={propertyListings} near={nm.near} radiusKm={nm.radiusKm} userPoint={nm.gps.position} />,
    [propertyListings, nm.near, nm.radiusKm, nm.gps.position],
  );

  return (
    <Root
      header={headerComponent}
      content={contentComponent}
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={handleLeftSidebarClose}
      leftSidebarContent={leftSidebarContentComponent}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={handleRightSidebarClose}
      rightSidebarContent={rightSidebarContentComponent}
      scroll="content"
    />
  );
}

// Memoize ActiveRealEstatePage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveRealEstatePage = memo(ActiveRealEstatePage);

/**
 * Main Real Estate Page Component with Service Status Check
 * Wraps the active real estate page with service status landing pages
 */
function RealestatePageWithSidebarsContentScrollComponent() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the real estate service status - memoized to prevent unnecessary re-renders
  const realEstateServiceStatus = useMemo(
    () => appSettings?.data?.payload?.realEstateServiceStatus,
    [appSettings?.data?.payload?.realEstateServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && realEstateServiceStatus !== undefined) {
      console.log("Real Estate Service Status:", realEstateServiceStatus);
    }
  }, [realEstateServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={realEstateServiceStatus}
      ActiveComponent={MemoizedActiveRealEstatePage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Real Estate"
    />
  );
}

export default RealestatePageWithSidebarsContentScrollComponent;
