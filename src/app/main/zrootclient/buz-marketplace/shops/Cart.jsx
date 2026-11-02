import _ from "@lodash";
import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button, Divider, Chip, IconButton } from "@mui/material";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
import { useGetMerchantPreview } from "app/configs/data/server-calls/auth/userapp/a_merchants/useMerchantRepo";
import {
  useGetMyFoodCart,
  useUpdateFoodCartItemQty,
} from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { calculateCartTotalAmount, formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import {
  useMyCart,
  useUpdateCartItemQty,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import {
  ShoppingCart,
  Restaurant,
  Add,
  Remove,
  Delete,
  LocalOffer,
  CheckCircle,
  ShoppingBag,
  Fastfood,
  ArrowForward,
  Login,
} from "@mui/icons-material";

/****
 * MARKETPLACE CART ITEM
 */
const CartItem = ({
  id,
  image,
  title,
  sellerId,
  unitsLeft,
  price,
  oldPrice,
  discount,
  cartQuantity,
  cartItem, // full cart item object to check for bulk order
}) => {
  const { mutate: updateCartQty } = useUpdateCartItemQty();
  const { data: sellerPreview } = useGetMerchantPreview(sellerId);
  const sellerName = sellerPreview?.data?.merchant?.shopname;

  const increaseCart = (itemId) => {
    const formData = {
      flag: "increase",
      cartItemId: itemId,
    };
    return updateCartQty(formData);
  };

  const decreaseCart = (itemId) => {
    const formData = {
      flag: "decrease",
      cartItemId: itemId,
    };
    return updateCartQty(formData);
  };

  const removeItemInCart = (itemId) => {
    const formData = {
      flag: "delete",
      cartItemId: itemId,
    };
    return updateCartQty(formData);
  };

  const hasDiscount = oldPrice && oldPrice !== undefined && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mb-4 border-2 border-gray-100 hover:border-orange-200"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {hasDiscount && (
            <div className="absolute top-2 right-2">
              <Chip
                icon={<LocalOffer />}
                label={`${discountPercent}% OFF`}
                size="small"
                sx={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontSize: { xs: "1.125rem", md: "1.25rem" },
              }}
            >
              {title}
            </Typography>
            {sellerName && (
              <Typography variant="body2" className="text-gray-600 mb-2">
                Seller: <span className="font-semibold">{sellerName}</span>
              </Typography>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Chip
                label={`${unitsLeft} units left`}
                size="small"
                sx={{
                  backgroundColor: unitsLeft < 10 ? "#fee2e2" : "#dcfce7",
                  color: unitsLeft < 10 ? "#dc2626" : "#166534",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              {cartItem?.isBulkOrder && (
                <Chip
                  icon={<LocalOffer />}
                  label="Bulk Order"
                  size="small"
                  sx={{
                    backgroundColor: "#ea580c",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    "& .MuiChip-icon": {
                      color: "white",
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-4">
            <div className="flex items-baseline gap-3 mb-2">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(to right, #ea580c, #dc2626)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ₦
                {(() => {
                  let itemPrice = price;

                  if (cartItem?.isBulkOrder && cartItem?.bulkPriceTierId) {
                    // Find the matching price tier from product's priceTiers array
                    const matchingTier = cartItem?.product?.priceTiers?.find(
                      (tier) => (tier?.id || tier?._id) === cartItem?.bulkPriceTierId,
                    );

                    if (matchingTier) {
                      itemPrice = matchingTier?.price;
                    }
                  }

                  return formatCurrency(parseInt(itemPrice));
                })()}
              </Typography>
              {hasDiscount && (
                <Typography variant="body1" className="text-gray-500 line-through">
                  ₦{formatCurrency(oldPrice)}
                </Typography>
              )}
            </div>
            <Typography
              variant="body2"
              sx={{
                color: "#ea580c",
                fontWeight: 700,
              }}
            >
              Subtotal: ₦
              {(() => {
                let itemPrice = price;

                if (cartItem?.isBulkOrder && cartItem?.bulkPriceTierId) {
                  // Find the matching price tier from product's priceTiers array
                  const matchingTier = cartItem?.product?.priceTiers?.find(
                    (tier) => (tier?.id || tier?._id) === cartItem?.bulkPriceTierId,
                  );

                  if (matchingTier) {
                    itemPrice = matchingTier?.price;
                  }
                }

                return formatCurrency(parseInt(itemPrice) * parseInt(cartQuantity));
              })()}
            </Typography>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end justify-between gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={() => removeItemInCart(id)}
              size="small"
              sx={{
                color: "#ef4444",
                "&:hover": {
                  backgroundColor: "#fee2e2",
                },
              }}
            >
              <Delete />
            </IconButton>
          </motion.div>

          <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-300 rounded-xl p-2">
            <motion.div whileTap={{ scale: cartItem?.isBulkOrder ? 1 : 0.9 }}>
              <IconButton
                size="small"
                onClick={() => decreaseCart(id)}
                disabled={cartItem?.isBulkOrder}
                sx={{
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: cartItem?.isBulkOrder ? "white" : "#fee2e2",
                    color: cartItem?.isBulkOrder ? "inherit" : "#dc2626",
                  },
                  opacity: cartItem?.isBulkOrder ? 0.5 : 1,
                  cursor: cartItem?.isBulkOrder ? "not-allowed" : "pointer",
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
            </motion.div>
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#111827",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {cartQuantity}
            </Typography>
            {parseInt(cartQuantity) < parseInt(unitsLeft) && !cartItem?.isBulkOrder && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  onClick={() => increaseCart(id)}
                  sx={{
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#dcfce7",
                      color: "#16a34a",
                    },
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </motion.div>
            )}
            {cartItem?.isBulkOrder && (
              <motion.div whileTap={{ scale: 1 }}>
                <IconButton
                  size="small"
                  disabled={true}
                  sx={{
                    backgroundColor: "white",
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </motion.div>
            )}
          </div>

          {/* Bulk Order Info Message */}
          {cartItem?.isBulkOrder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-lg"
              style={{
                backgroundColor: "rgba(234, 88, 12, 0.1)",
                border: "1px solid rgba(234, 88, 12, 0.3)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#c2410c",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  display: "block",
                  textAlign: "center",
                }}
              >
                Bulk order quantities are fixed. Remove and reorder to change quantity.
              </Typography>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * MARKETPLACE CART SUMMARY
 */
const CartSummary = ({ intemsInCart }) => {
  let checkItemsArrayForTotal = [];
  intemsInCart?.forEach((element) => {
    // Check if item is bulk order and use appropriate price
    let itemPrice = element?.product?.price;

    if (element?.isBulkOrder && element?.bulkPriceTierId) {
      // Find the matching price tier from product's priceTiers array
      const matchingTier = element?.product?.priceTiers?.find(
        (tier) => (tier?.id || tier?._id) === element?.bulkPriceTierId,
      );

      if (matchingTier) {
        itemPrice = matchingTier?.price;
      }
    }

    checkItemsArrayForTotal?.push({
      quantity: element?.quantity,
      price: itemPrice,
    });
  });

  const totalAmount = calculateCartTotalAmount(checkItemsArrayForTotal);
  const delivery = 0;
  const vat = 0;
  const grandTotal = parseInt(totalAmount) + parseInt(delivery) + parseInt(vat);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 p-6 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
        <ShoppingBag sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Cart Summary
        </Typography>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <Typography variant="body1" className="text-gray-700 font-semibold">
            Subtotal
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, color: "#111827" }}>
            ₦{formatCurrency(totalAmount)}
          </Typography>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="body2" className="text-gray-600">
              Delivery
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Not included yet
            </Typography>
          </div>
          <Typography variant="body2" className="font-semibold text-gray-700">
            ₦{formatCurrency(delivery)}
          </Typography>
        </div>
        <div className="flex justify-between items-center">
          <Typography variant="body2" className="text-gray-600">
            V.A.T.
          </Typography>
          <Typography variant="body2" className="font-semibold text-gray-700">
            ₦{formatCurrency(vat)}
          </Typography>
        </div>
      </div>

      <Divider sx={{ marginY: 3 }} />

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border-2 border-orange-200">
        <div className="flex justify-between items-center">
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 900,
              background: "linear-gradient(to right, #ea580c, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ₦{formatCurrency(grandTotal)}
          </Typography>
        </div>
      </div>

      {/* Checkout Button */}
      {intemsInCart?.length > 0 ? (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            component={NavLinkAdapter}
            to={`/marketplace/review-cart`}
            variant="contained"
            fullWidth
            endIcon={<ArrowForward />}
            sx={{
              background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #c2410c 0%, #b91c1c 100%)",
              },
              textTransform: "none",
              fontSize: "1.05rem",
              fontWeight: 700,
              py: 2,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(234, 88, 12, 0.4)",
              marginBottom: "16px",
            }}
          >
            Proceed to Checkout
          </Button>
        </motion.div>
      ) : (
        <Button
          component={NavLinkAdapter}
          to={`/marketplace/shop`}
          variant="outlined"
          fullWidth
          startIcon={<ShoppingCart />}
          sx={{
            borderColor: "#ea580c",
            color: "#ea580c",
            "&:hover": {
              borderColor: "#c2410c",
              backgroundColor: "#fff7ed",
            },
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
            py: 2,
            borderRadius: "12px",
            borderWidth: "2px",
            marginBottom: "16px",
          }}
        >
          Continue Shopping
        </Button>
      )}

      {/* Returns Info */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle sx={{ color: "#10b981", fontSize: "1.25rem" }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#065f46",
            }}
          >
            Easy Returns
          </Typography>
        </div>
        <Typography variant="caption" className="text-gray-600">
          Free return within 7 days for ALL eligible items
        </Typography>
      </div>
    </motion.div>
  );
};

/**
 * FOODMART CART ITEM
 */
const FoodCartItem = ({
  id,
  image,
  title,
  unitsLeft,
  foodCartQuantity,
  price,
  oldPrice,
  discount,
}) => {
  const { mutate: updateFoodCart } = useUpdateFoodCartItemQty();

  const increaseFoodCart = (itemId) => {
    const formData = {
      flag: "increase",
      foodCartItemId: itemId,
    };
    return updateFoodCart(formData);
  };

  const decreaseFoodCart = (itemId) => {
    const formData = {
      flag: "decrease",
      foodCartItemId: itemId,
    };
    return updateFoodCart(formData);
  };

  const removeItemInFoodCart = (itemId) => {
    const formData = {
      flag: "delete",
      foodCartItemId: itemId,
    };
    return updateFoodCart(formData);
  };

  const hasDiscount = oldPrice && oldPrice !== undefined && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mb-4 border-2 border-gray-100 hover:border-orange-200"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Food Image */}
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {hasDiscount && (
            <div className="absolute top-2 right-2">
              <Chip
                icon={<LocalOffer />}
                label={`${discountPercent}% OFF`}
                size="small"
                sx={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Food Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontSize: { xs: "1.125rem", md: "1.25rem" },
              }}
            >
              {title}
            </Typography>
            <Chip
              label={`${unitsLeft} units available`}
              size="small"
              sx={{
                backgroundColor: unitsLeft < 10 ? "#fee2e2" : "#dcfce7",
                color: unitsLeft < 10 ? "#dc2626" : "#166534",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </div>

          {/* Price Section */}
          <div className="mt-4">
            <div className="flex items-baseline gap-3 mb-2">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(to right, #ea580c, #dc2626)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ₦{formatCurrency(price)}
              </Typography>
              {hasDiscount && (
                <Typography variant="body1" className="text-gray-500 line-through">
                  ₦{formatCurrency(oldPrice)}
                </Typography>
              )}
            </div>
            <Typography
              variant="body2"
              sx={{
                color: "#ea580c",
                fontWeight: 700,
              }}
            >
              Subtotal: ₦{formatCurrency(parseInt(price) * parseInt(foodCartQuantity))}
            </Typography>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end justify-between gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={() => removeItemInFoodCart(id)}
              size="small"
              sx={{
                color: "#ef4444",
                "&:hover": {
                  backgroundColor: "#fee2e2",
                },
              }}
            >
              <Delete />
            </IconButton>
          </motion.div>

          <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-300 rounded-xl p-2">
            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton
                size="small"
                onClick={() => decreaseFoodCart(id)}
                sx={{
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                  },
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
            </motion.div>
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#111827",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {foodCartQuantity}
            </Typography>
            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton
                size="small"
                onClick={() => increaseFoodCart(id)}
                sx={{
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                  },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * FOODMART CART SUMMARY
 */
const FoodCartSummary = ({ intemsInFoodCart }) => {
  let checkFoodItemsArrayForTotal = [];
  intemsInFoodCart?.forEach((element) => {
    checkFoodItemsArrayForTotal?.push({
      quantity: element?.quantity,
      price: element?.martMenu?.price,
    });
  });

  const totalAmount = calculateCartTotalAmount(checkFoodItemsArrayForTotal);
  const delivery = 0;
  const vat = 0;
  const grandTotal = parseInt(totalAmount) + parseInt(delivery) + parseInt(vat);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 p-6 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
        <Fastfood sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Food Cart Summary
        </Typography>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <Typography variant="body1" className="text-gray-700 font-semibold">
            Subtotal
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, color: "#111827" }}>
            ₦{formatCurrency(totalAmount)}
          </Typography>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="body2" className="text-gray-600">
              Delivery
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Not included yet
            </Typography>
          </div>
          <Typography variant="body2" className="font-semibold text-gray-700">
            ₦{formatCurrency(delivery)}
          </Typography>
        </div>
        <div className="flex justify-between items-center">
          <Typography variant="body2" className="text-gray-600">
            V.A.T.
          </Typography>
          <Typography variant="body2" className="font-semibold text-gray-700">
            ₦{formatCurrency(vat)}
          </Typography>
        </div>
      </div>

      <Divider sx={{ marginY: 3 }} />

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border-2 border-orange-200">
        <div className="flex justify-between items-center">
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 900,
              background: "linear-gradient(to right, #ea580c, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ₦{formatCurrency(grandTotal)}
          </Typography>
        </div>
      </div>

      {/* Checkout Button */}
      {intemsInFoodCart?.length > 0 ? (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            component={NavLinkAdapter}
            to={`/foodmarts/review-food-cart`}
            variant="contained"
            fullWidth
            endIcon={<ArrowForward />}
            sx={{
              background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #c2410c 0%, #b91c1c 100%)",
              },
              textTransform: "none",
              fontSize: "1.05rem",
              fontWeight: 700,
              py: 2,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(234, 88, 12, 0.4)",
              marginBottom: "16px",
            }}
          >
            Proceed to Checkout
          </Button>
        </motion.div>
      ) : (
        <Button
          component={NavLinkAdapter}
          to={`/foodmarts/listings`}
          variant="outlined"
          fullWidth
          startIcon={<Restaurant />}
          sx={{
            borderColor: "#ea580c",
            color: "#ea580c",
            "&:hover": {
              borderColor: "#c2410c",
              backgroundColor: "#fff7ed",
            },
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
            py: 2,
            borderRadius: "12px",
            borderWidth: "2px",
            marginBottom: "16px",
          }}
        >
          Continue Shopping
        </Button>
      )}

      {/* Returns Info */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle sx={{ color: "#10b981", fontSize: "1.25rem" }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#065f46",
            }}
          >
            Easy Returns
          </Typography>
        </div>
        <Typography variant="caption" className="text-gray-600">
          Free return within 7 days for ALL eligible items
        </Typography>
      </div>
    </motion.div>
  );
};

/**
 * LOADING PLACEHOLDER
 */
const CartLoadingPlaceholder = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200"
        >
          <div className="flex gap-6">
            <div className="w-48 h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * MAIN CART COMPONENT
 */
function Cart() {
  const user = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  // Get saved tab from localStorage or default to "marketplace"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("cartActiveTab") || "marketplace";
  });

  const { data: foodCart, isLoading: foodCartLoading } = useGetMyFoodCart(user?.id);
  const { data: cart, isLoading: cartLoading } = useMyCart(user?.id);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartActiveTab", activeTab);
  }, [activeTab]);

  // console.log("Marketplace Cart:", cart?.data?.cartSession?.cartProducts);
  console.log("Marketplace CartSession:", cart?.data?.cartSession);

  const marketplaceCartCount = cart?.data?.cartSession?.cartProducts?.length || 0;
  const foodmartCartCount = foodCart?.data?.userFoodCartSession?.cartProducts?.length || 0;

  return (
    <FusePageSimple
      content={
        <div
          className="w-full min-h-screen"
          style={{
            background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
          }}
        >
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8">
            {user?.email ? (
              <>
                {/* Page Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      background: "linear-gradient(to right, #ea580c, #dc2626)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "8px",
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    Shopping Cart
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Review your items and proceed to checkout
                  </Typography>
                </motion.div>

                {/* Tabs */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-md border-2 border-gray-200">
                    {/* Marketplace Tab */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab("marketplace")}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 relative ${
                        activeTab === "marketplace"
                          ? "bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <ShoppingCart
                        sx={{
                          fontSize: "1.75rem",
                          color: activeTab === "marketplace" ? "white" : "#ea580c",
                        }}
                      />
                      <div className="text-left">
                        <Typography
                          sx={{
                            fontSize: "1.125rem",
                            fontWeight: 800,
                            color: activeTab === "marketplace" ? "white" : "#111827",
                          }}
                        >
                          Marketplace
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              activeTab === "marketplace" ? "rgba(255,255,255,0.9)" : "#6b7280",
                            fontWeight: 600,
                          }}
                        >
                          {marketplaceCartCount} items
                        </Typography>
                      </div>
                      {activeTab === "marketplace" && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>

                    {/* FoodMart Tab */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab("foodmart")}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 relative ${
                        activeTab === "foodmart"
                          ? "bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Restaurant
                        sx={{
                          fontSize: "1.75rem",
                          color: activeTab === "foodmart" ? "white" : "#ea580c",
                        }}
                      />
                      <div className="text-left">
                        <Typography
                          sx={{
                            fontSize: "1.125rem",
                            fontWeight: 800,
                            color: activeTab === "foodmart" ? "white" : "#111827",
                          }}
                        >
                          FoodMart
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: activeTab === "foodmart" ? "rgba(255,255,255,0.9)" : "#6b7280",
                            fontWeight: 600,
                          }}
                        >
                          {foodmartCartCount} items
                        </Typography>
                      </div>
                      {activeTab === "foodmart" && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === "marketplace" && (
                    <motion.div
                      key="marketplace"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-280px)]"
                    >
                      {/* Left side - Scrollable cart items (60% width) */}
                      <div className="w-full lg:w-[60%] lg:overflow-y-auto lg:pr-4">
                        {cartLoading ? (
                          <CartLoadingPlaceholder />
                        ) : cart?.data?.cartSession?.cartProducts?.length > 0 ? (
                          <AnimatePresence>
                            {cart?.data?.cartSession?.cartProducts?.map((cartItem) => (
                              <CartItem
                                key={cartItem?.id}
                                id={cartItem?.id}
                                title={cartItem?.product?.name}
                                image={cartItem?.product?.imageLinks[0]?.url}
                                sellerId={cartItem?.seller || cartItem?.product?.shop}
                                unitsLeft={cartItem?.product?.quantityInStock}
                                cartQuantity={cartItem?.quantity}
                                price={cartItem?.product?.price}
                                oldPrice={cartItem?.product?.listprice}
                                cartItem={cartItem}
                              />
                            ))}
                          </AnimatePresence>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-8 md:p-12 text-center border-2 border-gray-200"
                          >
                            <ShoppingBag
                              sx={{ fontSize: { xs: "3rem", md: "5rem" }, color: "#d1d5db", mb: 3 }}
                            />
                            <Typography
                              variant="h5"
                              sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                              className="font-bold text-gray-900 mb-2"
                            >
                              Your cart is empty
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 mb-6">
                              Start adding products to your cart
                            </Typography>
                            <Button
                              component={NavLinkAdapter}
                              to="/marketplace/shop"
                              variant="contained"
                              startIcon={<ShoppingCart />}
                              sx={{
                                background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                                textTransform: "none",
                                fontSize: { xs: "0.875rem", md: "1rem" },
                                fontWeight: 700,
                                py: { xs: 1.5, md: 2 },
                                px: { xs: 3, md: 4 },
                                borderRadius: "12px",
                              }}
                            >
                              Start Shopping
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      {/* Right side - Fixed cart summary (30% width) */}
                      <div className="w-full lg:w-[30%] lg:flex-shrink-0">
                        <CartSummary intemsInCart={cart?.data?.cartSession?.cartProducts || []} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "foodmart" && (
                    <motion.div
                      key="foodmart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-280px)]"
                    >
                      {/* Left side - Scrollable cart items (60% width) */}
                      <div className="w-full lg:w-[60%] lg:overflow-y-auto lg:pr-4">
                        {foodCartLoading ? (
                          <CartLoadingPlaceholder />
                        ) : foodCart?.data?.userFoodCartSession?.cartProducts?.length > 0 ? (
                          <AnimatePresence>
                            {foodCart?.data?.userFoodCartSession?.cartProducts?.map((cartItem) => (
                              <FoodCartItem
                                key={cartItem?.id}
                                id={cartItem?.id}
                                image={cartItem?.martMenu?.imageSrcs[0]?.url}
                                title={cartItem?.martMenu?.title}
                                unitsLeft={cartItem?.martMenu?.quantity}
                                foodCartQuantity={cartItem?.quantity}
                                price={cartItem?.martMenu?.price}
                                oldPrice={cartItem?.martMenu?.listprice}
                              />
                            ))}
                          </AnimatePresence>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-8 md:p-12 text-center border-2 border-gray-200"
                          >
                            <Fastfood
                              sx={{ fontSize: { xs: "3rem", md: "5rem" }, color: "#d1d5db", mb: 3 }}
                            />
                            <Typography
                              variant="h5"
                              sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                              className="font-bold text-gray-900 mb-2"
                            >
                              Your food cart is empty
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 mb-6">
                              Discover delicious meals from our restaurants
                            </Typography>
                            <Button
                              component={NavLinkAdapter}
                              to="/foodmarts/listings"
                              variant="contained"
                              startIcon={<Restaurant />}
                              sx={{
                                background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                                textTransform: "none",
                                fontSize: { xs: "0.875rem", md: "1rem" },
                                fontWeight: 700,
                                py: { xs: 1.5, md: 2 },
                                px: { xs: 3, md: 4 },
                                borderRadius: "12px",
                              }}
                            >
                              Browse Restaurants
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      {/* Right side - Fixed cart summary (30% width) */}
                      <div className="w-full lg:w-[30%] lg:flex-shrink-0">
                        <FoodCartSummary
                          intemsInFoodCart={foodCart?.data?.userFoodCartSession?.cartProducts || []}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* Not Logged In State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 text-center border-2 border-orange-200 max-w-2xl mx-auto mt-20"
              >
                <Login sx={{ fontSize: "5rem", color: "#ea580c", mb: 3 }} />
                <Typography variant="h4" className="font-bold text-gray-900 mb-3">
                  Hi There!
                </Typography>
                <Typography variant="body1" className="text-gray-700 mb-6">
                  To view your cart and start shopping, please log in to your account
                </Typography>
                <Button
                  component={NavLinkAdapter}
                  to="/sign-in"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                    textTransform: "none",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    py: 2.5,
                    px: 6,
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(234, 88, 12, 0.4)",
                  }}
                >
                  Sign In Now
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default Cart;
