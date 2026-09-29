import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useCallback, useEffect, useState, useMemo, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContentSingleProduct from "./shared-components/DemoContentSingleProduct";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useGetAllProducts, {
  useAddToCart,
  useGetMyMarketplaceCartByUserCred,
  useGetSingleProduct,
  useMyCart,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../../aapp-settings-from-admin/ServiceStatusLandingPage";
// import { useForm } from "react-hook-form";
// import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
// import {
//   getLgasByStateId,
//   getStateByCountryId,
// } from "app/configs/data/client/RepositoryClient";
// import useGetAllBookingProperties from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
// import useGetAllFoodMarts, {
//   useAddToFoodCart,
//   useGetMyFoodCartByUserCred,
//   useGetSingleMenuItem,
// } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
// import {
//   getFoodVendorSession,
//   getShoppingSession,
//   storeFoodVendorSession,
//   storeShoppingSession,
// } from "src/app/main/vendors-shop/pos/PosUtils";

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
 * Active Single Product Page Component
 * This component renders when the marketplace service is ACTIVE
 */
function ActiveSingleProductPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const routeParams = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { productId: productIdFromRoute, productSlug } = routeParams;

  const { data: product, isLoading, isError } = useGetSingleProduct(productSlug);

  const { mutate: addToart, isLoading: cartLoading } = useAddToCart();
  const [select, setSelect] = useState(0);

  // const [cartloading, setCartLoading] = useState(false);
  const [cart, setCart] = useState([]);
  // const { data: userCartData } =useGetMyMarketplaceCartByUserCred(); //user?.id
  const { data: userCartData } = useMyCart(user?.id); //user?.id

  const onAddToUserCart = useCallback(() => {
    if (!user?.email) {
      navigate("/sign-in");
      return;
    }

    const formData = {
      user: user?.id,
      quantity: 1,
      product: product?.data?.product?.id,
      seller: product?.data?.product?.shop,
      shopID: product?.data?.product?.shop,
      shopCountryOrigin: product?.data?.product?.productCountry,
      shopStateProvinceOrigin: product?.data?.product?.productState,
      shopLgaProvinceOrigin: product?.data?.product?.productLga,
      shopMarketId: product?.data?.product?.market,
      // shoppingSession:''
    };

    // The one-market-per-cart rule is enforced authoritatively by the backend
    // (cart.service.ts addItemToUserCart) and its rejection message is already
    // surfaced as a toast via useAddToCart's onError (handleApiError) — no
    // need to duplicate that check here client-side.
    addToart(formData);
  }, [product?.data?.product?.id, routeParams, user]);

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
  const productData = useMemo(() => product?.data?.product, [product?.data?.product]);
  const productId = useMemo(() => product?.data?.product?.id, [product?.data?.product?.id]);
  const cartItems = useMemo(
    () => userCartData?.data?.cartSession?.cartProducts,
    [userCartData?.data?.cartSession?.cartProducts],
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
      <DemoContentSingleProduct
        productData={productData}
        isLoading={isLoading}
        isError={isError}
        select={select}
        setSelect={setSelect}
        onSubmit={onAddToUserCart}
        loading={cartLoading}
        productId={productId}
        cartItems={cartItems}
      />
    ),
    [productData, isLoading, isError, select, onAddToUserCart, cartLoading, productId, cartItems],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(() => <DemoSidebar />, []);

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () => <DemoSidebarRight productInfo={productData} />,
    [productData],
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

// Memoize ActiveSingleProductPage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveSingleProductPage = memo(ActiveSingleProductPage);

/**
 * Main Single Product Page Component with Service Status Check
 * Wraps the active single product page with service status landing pages
 */


function SingleProductWithContentScrollPage() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the marketplace service status - memoized to prevent unnecessary re-renders
  const marketplaceServiceStatus = useMemo(
    () => appSettings?.data?.payload?.marketplaceServiceStatus,
    [appSettings?.data?.payload?.marketplaceServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && marketplaceServiceStatus !== undefined) {
      console.log("Marketplace Service Status (Single Product):", marketplaceServiceStatus);
    }
  }, [marketplaceServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={marketplaceServiceStatus}
      ActiveComponent={MemoizedActiveSingleProductPage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Marketplace"
    />
  );
}

export default SingleProductWithContentScrollPage;
