import { styled } from "@mui/material/styles";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import useGetAllProducts from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { useShopSellerInfo } from "app/configs/data/server-calls/auth/userapp/a_merchants/useMerchantRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import { PageSkeleton } from "src/app/shared-components/loading";
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

const DEFAULT_LIMIT = 20; // the pager offers 20, 30, 40 and 50
const MAX_LIMIT = 50; // list requests never ask the backend for more than 50 rows

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** One merchant's store: the shop's map on the left, its listings in the middle, its updates on the right. */
function ActiveStorePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { shopId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = toInt(searchParams.get("page"), 1);
  const limit = Math.min(toInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);

  const { merchant, market, isLoading: shopLoading } = useShopSellerInfo(shopId);
  const {
    data: productsRes,
    isLoading: productsLoading,
    isError: productsError,
    refetch,
  } = useGetAllProducts({ shop: shopId, limit, offset: (page - 1) * limit });

  const products = productsRes?.data?.products ?? [];
  const total = productsRes?.data?.pagination?.total ?? 0;

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

  const setPaging = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(next.page ?? page));
      params.set("limit", String(next.limit ?? limit));
      setSearchParams(params, { replace: false });
    },
    [searchParams, setSearchParams, page, limit],
  );

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
      <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full">
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
              page={page}
              limit={limit}
              onPageChange={(p) => setPaging({ page: p })}
              onLimitChange={(l) => setPaging({ page: 1, limit: Math.min(l, MAX_LIMIT) })}
            />
          </>
        )}
      </div>
    ),
    [
      shopLoading,
      shopData,
      productsLoading,
      total,
      products,
      productsError,
      refetch,
      page,
      limit,
      setPaging,
    ],
  );

  const left = useMemo(
    () => <DemoSidebar shopData={shopData} isLoading={shopLoading} />,
    [shopData, shopLoading],
  );
  const right = useMemo(() => <StoreUpdatesPanel />, []);

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
