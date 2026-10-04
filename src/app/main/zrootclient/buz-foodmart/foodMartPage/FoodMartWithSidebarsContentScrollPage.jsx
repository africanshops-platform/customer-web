import { styled } from "@mui/material/styles";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useGetAllFoodMarts from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";

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
 * Active Food Mart Page Component
 * This component renders when the restaurants/clubs/spots service is ACTIVE
 */
function ActiveFoodMartPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  // Filter inputs as the sidebar reports them; the API query is derived from these plus the page.
  const [filterInputs, setFilterInputs] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  // Map the sidebar's filter names to the listing API's parameters
  const filters = useMemo(() => {
    const f = { limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage };
    const title = filterInputs.title || filterInputs.keyword;
    if (title) f.title = title;
    if (filterInputs.address) f.address = filterInputs.address;
    if (filterInputs.category) f.foodMartCategory = filterInputs.category;
    if (filterInputs.operationMode) f.operationMode = filterInputs.operationMode;
    if (filterInputs.country) f.foodMartCountry = filterInputs.country;
    if (filterInputs.state) f.foodMartState = filterInputs.state;
    if (filterInputs.lga) f.foodMartLga = filterInputs.lga;
    return f;
  }, [filterInputs, itemsPerPage, currentPage]);

  const { data: AllFoodMarts, isLoading, isError } = useGetAllFoodMarts(filters);

  // Stable, so the sidebar is not re-rendered on every page change. A changed filter starts at page 1.
  const handleFilterChange = useCallback((newFilters) => {
    setFilterInputs((prev) => (JSON.stringify(prev) === JSON.stringify(newFilters) ? prev : newFilters));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

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
  const foodMarts = useMemo(() => AllFoodMarts?.data?.foodmarts, [AllFoodMarts?.data?.foodmarts]);
  const totalItems = useMemo(
    () => AllFoodMarts?.data?.pagination?.total || 0,
    [AllFoodMarts?.data?.pagination?.total],
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
      <DemoContent
        foodMarts={foodMarts}
        isLoading={isLoading}
        isError={isError}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    ),
    [
      foodMarts,
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

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () => <DemoSidebarRight listingsData={foodMarts} />,
    [foodMarts],
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

// Memoize ActiveFoodMartPage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveFoodMartPage = memo(ActiveFoodMartPage);

/**
 * Main Food Mart Page Component with Service Status Check
 * Wraps the active food mart page with service status landing pages
 */
function FoodMartWithSidebarsContentScrollPage() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the restaurants/clubs/spots service status - memoized to prevent unnecessary re-renders
  const restaurantsClubsSpotsServiceStatus = useMemo(
    () => appSettings?.data?.payload?.restaurantsClubsSpotsServiceStatus,
    [appSettings?.data?.payload?.restaurantsClubsSpotsServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      restaurantsClubsSpotsServiceStatus !== undefined
    ) {
      console.log("Restaurants/Clubs/Spots Service Status:", restaurantsClubsSpotsServiceStatus);
    }
  }, [restaurantsClubsSpotsServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={restaurantsClubsSpotsServiceStatus}
      ActiveComponent={MemoizedActiveFoodMartPage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Restaurants/Clubs/Spots"
    />
  );
}

export default FoodMartWithSidebarsContentScrollPage;
