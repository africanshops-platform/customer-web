// import MarketplaceMap from '../../components/maps/MarketplaceMap';
import { Typography } from "@mui/material";
import { ShoppingCartOutlined } from "@mui/icons-material";
import MarketplaceMapLoadingPlaceholder from "./MarketplaceMapLoadingPlaceholder";
import MarketplaceMap from "../../../components/maps/MarketplaceMap";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useMyCart } from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { useMemo } from "react";

/**
 * The MarketplaceDemoSidebarRight component.
 * Enhanced with marketplace map showing active shopping cart state
 */
function MarketplaceDemoSidebarRight(props) {
  const user = useAppSelector(selectUser);
  const { data: userCartData, isLoading: cartLoading } = useMyCart(user?.id);

  const cartItems = useMemo(
    () => userCartData?.data?.cartSession,
    [userCartData?.data?.cartSession],
  );

  // const { cartData, isLoading } = props;

  // Show loading placeholder while data is being fetched
  // For now, we'll always show the map with dummy data
  // This will be replaced with actual cart state data from API
  const showLoading = cartLoading || false;

  if (showLoading) {
    return <MarketplaceMapLoadingPlaceholder />;
  }

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
        }}
      >
        <ShoppingCartOutlined sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
          }}
        >
          Shopping Region
        </Typography>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
        <MarketplaceMap cartData={cartItems} />
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          You can only shop from one market at a time
        </Typography>
      </div>
    </div>
  );
}

export default MarketplaceDemoSidebarRight;
