import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useState } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useGetAllProducts, {
  useGetAuthUserOrders,
  useGetAuthUserSealedOrders,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { useForm } from "react-hook-form";

import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

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
 * The SimpleWithSidebarsContentScroll page.
 */
function MarketplaceOrdersWithSidebarsContentScrollPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const user = useAppSelector(selectUser);

  const { data: userOrders, isLoading, isError } = useGetAuthUserOrders();
  const { data: sealedOrders } = useGetAuthUserSealedOrders();

  // console.log("USER__ORDERS__DATA", userOrders?.data?.orders);

  return (
    <Root
      header={
        <DemoHeader
          leftSidebarToggle={() => {
            setLeftSidebarOpen(!leftSidebarOpen);
          }}
          rightSidebarToggle={() => {
            setRightSidebarOpen(!rightSidebarOpen);
          }}
        />
      }
      content={
        <DemoContent
          userCreatedOrders={userOrders?.data?.orders}
          sealedItems={sealedOrders?.data?.sealedOrders}
          isLoading={isLoading}
          isError={isError}
        />
      }
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => {
        setLeftSidebarOpen(false);
      }}
      leftSidebarContent={<DemoSidebar />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
      }}
      rightSidebarContent={<DemoSidebarRight />}
      scroll="content"
    />
  );
}

export default MarketplaceOrdersWithSidebarsContentScrollPage;
