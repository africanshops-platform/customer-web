import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useState } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import {
  useUserCancelledTrips,
  useUserTrips,
  useUserSealedTrips,
} from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";

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
function UserReservationsWithSidebarsContentScrollPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data: myreservations, isLoading, isError } = useUserTrips();

  const { data: sealedReservations } = useUserSealedTrips();

  const {
    data: cancelledReservations,
    isLoading: isLoadingCanclled,
    isError: isCancelledError,
  } = useUserCancelledTrips();

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
          reservations={myreservations?.data?.myreservations}
          isLoading={isLoading}
          isError={isError}
          cancelledReservations={cancelledReservations?.data?.myreservations}
          sealedReservations={sealedReservations?.data?.sealedreservations}
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

export default UserReservationsWithSidebarsContentScrollPage;
