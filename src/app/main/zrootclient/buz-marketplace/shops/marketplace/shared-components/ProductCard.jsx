import { useState } from "react";
import { Typography, IconButton, Button } from "@mui/material";
// import {
//   FavoriteBorder,
//   Favorite,
//   NavigateBefore,
//   NavigateNext,
// } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { toast } from "react-toastify";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistItemStatus,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";

/**
 * ProductCard Component
 * Displays hotel/apartment listing with image slider
 */
function ProductCard({ id, slug, image, name, price, address, listprice, unitweight }) {
  const user = useAppSelector(selectUser);
  const isAuthenticated = Boolean(user?.email);
  const { data: wishlistStatus } = useWishlistItemStatus(isAuthenticated ? id : undefined);
  const isWishlisted = Boolean(wishlistStatus?.data?.isWishlisted);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  function handleToggleWishlist() {
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your wishlist.");
      return;
    }
    if (isWishlisted) {
      removeFromWishlist.mutate(id);
    } else {
      addToWishlist.mutate(id);
    }
  }

  return (
    <>
      <div
        // key={index}
        className="bg-white p-6 rounded shadow flex flex-col relative"
      >
        <div className="relative">
          <img
            src={image}
            alt="MacBook Pro"
            className="w-full h-[160px] rounded-lg transition ease-in-out delay-150  hover:scale-105 object-cover"
            height={70}
          />
          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
            Black Friday deal
          </span>
        </div>
        <div className="mt-4 ">
          {/* <Typography
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded w-fit"
                    component={NavLinkAdapter}
                    to={`/marketplace/merchant/${product?.shop?._id}/portal`}
                  >
                    {product?.shop?.shopname}
                  </Typography>
                  <br /> */}

          <Typography
            className="mt-2 text-sm font-bold cursor-pointer"
            component={NavLinkAdapter}
            to={`/marketplace/product/${slug}/view`}
          >
            {name}
            {/* .slice(0,20) */}
          </Typography>
          <p className="text-orange-500 font-bold mt-2">
            ₦ {formatCurrency(price)} <span className="text-[10px]"> per {unitweight}</span>
          </p>

          {listprice && (
            <>
              <p className="text-gray-500 line-through">₦ {formatCurrency(listprice)}</p>
            </>
          )}

          {/* <p className="text-green-500">-70%</p> */}
        </div>
        <div className="flex justify-between items-center mt-4 bottom-0">
          <Button
            size="small"
            className="text-black  border-orange-500 bg-orange-500 hover:bg-orange-800 px-4 py-2 rounded w-full mb-2 absolute bottom-0 right-0 left-0"
          >
            ADD TO CART
          </Button>

          <IconButton
            size="small"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i
              className={`${isWishlisted ? "fas" : "far"} fa-heart text-xl`}
              style={{ color: isWishlisted ? "#ea580c" : undefined }}
            />
          </IconButton>
        </div>
      </div>
    </>
  );
}

export default ProductCard;
