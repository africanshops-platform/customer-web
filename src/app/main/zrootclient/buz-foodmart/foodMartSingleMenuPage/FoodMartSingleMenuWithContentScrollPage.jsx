import { styled } from "@mui/material/styles";
// import FusePageSimple from "@fuse/core/FusePageSimple";
import { useCallback, useEffect, useState, useMemo, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";

import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
// import useGetAllProducts from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
// import { useForm } from "react-hook-form";
// import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
// import { getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";
// import useGetAllBookingProperties from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
import  {
  useAddToFoodCart,
  useGetMartMenu,
  useGetMyFoodCart,
  // useGetMyFoodCartByUserCred,
  useGetSingleMenuItem,
} from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
// import { getFoodVendorSession, storeFoodVendorSession } from "src/app/main/vendors-shop/PosUtils";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";

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
 * Active Food Mart Single Menu Page Component
 * This component renders when the restaurants/clubs/spots service is ACTIVE
 */
function ActiveFoodMartSingleMenuPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const routeParams = useParams();
  const { rcsId, menuSlug } = routeParams;
  const { data: menu, isLoading, isError } = useGetSingleMenuItem(rcsId, menuSlug);
  const { data: martMenuData } = useGetMartMenu(rcsId);

  const { mutate: addToFoodMenuToCart, isLoading: addFoodCartLoading } = useAddToFoodCart();

  const { data: foodCart } = useGetMyFoodCart(user?.id);

  const onAddToFoodCart = useCallback(() => {
    if (!user?.email) {
      navigate("/sign-in");
      return;
    }

    const formData = {
      user: user?.id,
      quantity: 1,
      foodMenuItem: menu?.data?.menu?.id,
      foodMart: menu?.data?.menu?.foodMartVendor,
      shopID: menu?.data?.menu?.shop,
      countryId: menu?.data?.menu?.foodMartMenuCountry,
      stateId: menu?.data?.menu?.foodMartMenuState,
      lgaId: menu?.data?.menu?.foodMartMenuLga,
      districtId: menu?.data?.menu?.foodMartMenuDistrict,
      // shopMarketId: menu?.data?.menu?.market,
      // shoppingSession:''
    };
    // The one-foodmart-per-cart rule is enforced authoritatively by the backend
    // (foodcart.service.ts addItemToUserFoodCart, checked against foodmartId) and its
    // rejection message is already surfaced as a toast via useAddToFoodCart's onError
    // (handleApiError) — no need to duplicate (and mis-scope, by district) that check here.
    addToFoodMenuToCart(formData);
  }, [menu?.data?.menu?.id, routeParams, user]);
  console.log("FOOD CART SESSION", foodCart?.data?.userFoodCartSession);
  console.log("MENU", menu?.data?.menu);

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
  const menuData = useMemo(() => menu?.data?.menu, [menu?.data?.menu]);
  const foodMart = useMemo(() => martMenuData?.data?.foodMart, [martMenuData?.data?.foodMart]);
  const userFoodCartSession = useMemo(
    () => foodCart?.data?.userFoodCartSession,
    [foodCart?.data?.userFoodCartSession],
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
        menuData={menuData}
        isLoading={isLoading}
        isError={isError}
        onAddToFoodCart={onAddToFoodCart}
        addFoodCartLoading={addFoodCartLoading}
        foodCart={userFoodCartSession}
      />
    ),
    [menuData, isLoading, isError, onAddToFoodCart, addFoodCartLoading, userFoodCartSession],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(() => <DemoSidebar />, []);

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () => <DemoSidebarRight menu={menuData} foodMart={foodMart} />,
    [menuData, foodMart],
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

// Memoize ActiveFoodMartSingleMenuPage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveFoodMartSingleMenuPage = memo(ActiveFoodMartSingleMenuPage);

/**
 * Main Food Mart Single Menu Page Component with Service Status Check
 * Wraps the active single menu page with service status landing pages
 */

function FoodMartSingleMenuWithContentScrollPage() {
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
      console.log(
        "Restaurants/Clubs/Spots Service Status (Single Menu):",
        restaurantsClubsSpotsServiceStatus,
      );
    }
  }, [restaurantsClubsSpotsServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={restaurantsClubsSpotsServiceStatus}
      ActiveComponent={MemoizedActiveFoodMartSingleMenuPage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Restaurants/Clubs/Spots"
    />
  );
}

export default FoodMartSingleMenuWithContentScrollPage;
