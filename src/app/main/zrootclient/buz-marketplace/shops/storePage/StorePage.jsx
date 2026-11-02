import { styled } from "@mui/material/styles";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "react-query";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { useAddToCart } from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { getAllProducts } from "app/configs/data/client/RepositoryClient";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useShopSellerInfo } from "app/configs/data/server-calls/auth/userapp/a_merchants/useMerchantRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import { PageSkeleton } from "src/app/shared-components/loading";
import "./store.css";
import ServiceStatusLandingPage from "../../../aapp-settings-from-admin/ServiceStatusLandingPage";
import DemoHeader from "../singleProductPage/shared-components/DemoHeader";
import DemoSidebar from "../singleProductPage/shared-components/DemoSidebar";
import StoreHero from "./StoreHero";
import StoreProducts from "./StoreProducts";
import StoreUpdatesPanel from "./StoreUpdatesPanel";

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

const PAGE_SIZE = 8; // listings per "Load more" step; never close to the 50-row request ceiling
const MAX_PAGES = 12;
const FONT_LINK_ID = "store-page-fonts";

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** The design's two typefaces, loaded once when a store page opens. */
function useStoreFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

/** One merchant's store: the shop's map on the left, its listings in the middle, its updates on the right. */
function ActiveStorePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  useStoreFonts();
  const { shopId } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [searchParams, setSearchParams] = useSearchParams();
  // `page` is how many "Load more" steps are showing; it lives in the URL so a refresh or a shared link keeps the view.
  const pagesShown = Math.min(toInt(searchParams.get("page"), 1), MAX_PAGES);

  const { merchant, market, isLoading: shopLoading } = useShopSellerInfo(shopId);

  const pageQueries = useQueries(
    Array.from({ length: pagesShown }, (_, i) => ({
      queryKey: ["__store_products", shopId, PAGE_SIZE, i * PAGE_SIZE],
      queryFn: () => getAllProducts({ shop: shopId, limit: PAGE_SIZE, offset: i * PAGE_SIZE }),
      enabled: Boolean(shopId),
      keepPreviousData: true,
      staleTime: 20000,
    })),
  );
  const firstPage = pageQueries[0];
  const productsLoading = Boolean(firstPage?.isLoading);
  const productsError = Boolean(firstPage?.isError);
  const loadingMore = pageQueries.slice(1).some((q) => q.isFetching && !q.data);
  const products = pageQueries.flatMap((q) => q.data?.data?.products ?? []);
  const total = firstPage?.data?.data?.pagination?.total ?? 0;
  const hasMore = products.length < total && pagesShown < MAX_PAGES;
  const refetch = useCallback(() => pageQueries.forEach((q) => q.refetch()), [pageQueries]);

  const { mutate: addToCart, isLoading: addingToCart, variables: addingVars } = useAddToCart();
  const onAdd = useCallback(
    (product) => {
      if (!user?.email) {
        navigate("/sign-in");
        return;
      }
      // Same payload as the product page's Add to cart; the backend enforces the one-market-per-cart rule.
      addToCart({
        user: user?.id,
        quantity: 1,
        product: product.id,
        seller: product.shop,
        shopID: product.shop,
        shopCountryOrigin: product.productCountry,
        shopStateProvinceOrigin: product.productState,
        shopLgaProvinceOrigin: product.productLga,
        shopMarketId: product.market,
      });
    },
    [user, navigate, addToCart],
  );

  const loadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pagesShown + 1));
    setSearchParams(params);
  }, [searchParams, setSearchParams, pagesShown]);

  const shopData = useMemo(() => {
    if (!merchant) return null;
    const lat = Number(market?.lat);
    const lng = Number(market?.lng);
    return {
      id: merchant.id,
      shopName: merchant.shopname,
      address: merchant.address || market?.localityaddress,
      marketName: market?.name,
      coordinates: market?.lat && Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null,
      zoom: 14,
      phone: merchant.shopphone,
      isVerified: Boolean(merchant.verified),
      memberSince: merchant.createdAt ? new Date(merchant.createdAt).getFullYear() : null,
    };
  }, [merchant, market]);

  const header = useMemo(
    () => (
      <DemoHeader
        leftSidebarToggle={() => setLeftSidebarOpen((o) => !o)}
        rightSidebarToggle={() => setRightSidebarOpen((o) => !o)}
      />
    ),
    [],
  );

  const content = useMemo(
    () => (
      <div className="sp sp-center">
        {shopLoading && !shopData ? (
          <PageSkeleton />
        ) : (
          <>
            <StoreHero shopData={shopData} listingsTotal={productsLoading ? undefined : total} />
            <StoreProducts
              products={products}
              isLoading={productsLoading}
              isError={productsError}
              onRetry={refetch}
              total={total}
              hasMore={hasMore}
              onLoadMore={loadMore}
              loadingMore={loadingMore}
              onAdd={onAdd}
              addingId={addingToCart ? addingVars?.product : null}
            />
          </>
        )}
      </div>
    ),
    [
      shopLoading,
      shopData,
      productsLoading,
      productsError,
      total,
      products,
      hasMore,
      loadMore,
      loadingMore,
      onAdd,
      refetch,
      addingToCart,
      addingVars,
    ],
  );

  const left = useMemo(
    () => <DemoSidebar shopData={shopData} isLoading={shopLoading} />,
    [shopData, shopLoading],
  );
  const right = useMemo(() => <StoreUpdatesPanel shopId={shopId} />, [shopId]);

  if (!shopId) return <Navigate to="/marketplace/shop" replace />;

  return (
    <Root
      header={header}
      content={content}
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => setLeftSidebarOpen(false)}
      leftSidebarContent={left}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarContent={right}
      scroll="content"
    />
  );
}

const MemoizedActiveStorePage = memo(ActiveStorePage);

/** The route element: respects the admin's marketplace service switch, like every other marketplace page. */
function StorePage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const status = useMemo(
    () => appSettings?.data?.payload?.marketplaceServiceStatus,
    [appSettings?.data?.payload?.marketplaceServiceStatus],
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={status}
      ActiveComponent={MemoizedActiveStorePage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Marketplace"
    />
  );
}

/** The old shop page address now lands on the working store page. */
export function StoreRedirect() {
  const { shopId } = useParams();
  return <Navigate to={`/marketplace/store/${shopId}/view`} replace />;
}

export default StorePage;
