import _ from "@lodash";
// import { Button, Typography, Divider } from "@mui/material";
import { motion } from "framer-motion";
import {
  usePayAndPlaceOrder,
  useCalculateCartShipping,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { useMarketplaceCheckoutReadiness } from "app/configs/data/server-calls/auth/paystack-payments/usePaystackPaymentsRepo";
import { useAppSelector } from "app/store/hooks";
import { PaystackButton } from "react-paystack";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  calculateCartTotalAmount,
  formatCurrency,
  // generateClientUID,
  // getShoppingSession,
} from "src/app/main/vendors-shop/PosUtils";
import { useState, useEffect } from "react";

/**
 * Placeholder country tax rates
 * This will be replaced with API call to fetch tax rates by country
 */
const PLACEHOLDER_TAX_RATES = {
  1: { rate: 0.075, name: "Nigeria", label: "VAT (7.5%)" }, // Nigeria - 7.5% VAT
  2: { rate: 0.05, name: "Ghana", label: "VAT (5%)" }, // Ghana - 5% VAT
  3: { rate: 0.16, name: "Kenya", label: "VAT (16%)" }, // Kenya - 16% VAT
  4: { rate: 0.18, name: "South Africa", label: "VAT (18%)" }, // South Africa - 18% VAT
  // Add more countries as needed
};

const CartSummaryAndPay = ({
  cartSessionPayload,
  methodOfPay,
  name,
  phone,
  address,
  orderCountryDestination,
  orderStateProvinceDestination,
  orderLgaDestination,
  orderMarketPickupDestination,
  dirtyFields,
  isValid,
  setIsProcessingPayment,
}) => {
  console.log("CartSummaryAndPay render with cartSessionPayload:", cartSessionPayload);
  const user = useAppSelector(selectUser);

  const queryClient = useQueryClient();

  // State for calculated delivery fee
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState("");
  const [deliveryError, setDeliveryError] = useState(null);

  // A failed Paystack attempt now rotates this cart session server-side (a
  // fresh session id, so a retry doesn't collide with the already-used
  // AFSH<sessionId>REF reference) — block this exact button until the
  // parent's cart query refetches with the new session.
  const [paymentFailedPermanently, setPaymentFailedPermanently] = useState(false);
  const readiness = useMarketplaceCheckoutReadiness();
  const {
    mutate: calculateCartShipping,
    isLoading: deliveryLoading,
  } = useCalculateCartShipping();

  // Calculate cart subtotal
  let checkItemsArrayForTotal = [];
  cartSessionPayload?.cartProducts?.forEach((element) => {
    // Check if this is a bulk order and use the bulk price tier
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

  const subtotal = calculateCartTotalAmount(checkItemsArrayForTotal);

  // Live shipping estimate — recalculated whenever the customer picks/changes their
  // market pickup point. Real per-shop cost from places-service's rate tables, not a
  // client-side guess (the backend recomputes this authoritatively at checkout anyway,
  // this is purely for showing the customer an accurate number before they pay).
  useEffect(() => {
    if (!orderMarketPickupDestination || !cartSessionPayload?.cartProducts?.length) {
      setDeliveryFee(0);
      setDeliveryMode("");
      setDeliveryError(null);
      return;
    }

    calculateCartShipping(
      { destinationMarketId: orderMarketPickupDestination },
      {
        onSuccess: (response) => {
          const result = response?.data;
          if (result?.success) {
            setDeliveryFee(Math.round((result.totalAmountKobo ?? 0) / 100));
            setDeliveryMode(result.mode ?? "");
            setDeliveryError(null);
          }
        },
        onError: (error) => {
          setDeliveryFee(0);
          setDeliveryMode("");
          setDeliveryError(
            error?.response?.data?.message ||
              "Shipping isn't available to this location yet — try a different pickup point.",
          );
        },
      },
    );
  }, [orderMarketPickupDestination, cartSessionPayload?.cartProducts?.length]);

  // Calculate VAT based on country (placeholder - will be from API)
  const getTaxRate = () => {
    if (orderCountryDestination) {
      return PLACEHOLDER_TAX_RATES[orderCountryDestination] || PLACEHOLDER_TAX_RATES[1]; // Default to Nigeria
    }
    return PLACEHOLDER_TAX_RATES[1]; // Default to Nigeria
  };

  const taxInfo = getTaxRate();
  const vatAmount = Math.round(subtotal * taxInfo.rate);

  // Calculate grand total
  const grandTotal = parseInt(subtotal) + parseInt(deliveryFee) + parseInt(vatAmount);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const { mutate: verifyPaymentAndCreateOrder, isLoading: loadingWhilePaying } =
    usePayAndPlaceOrder();

  // Shared across the button's class/style/disabled + the "complete fields" warning below —
  // extracted so adding the two delivery-fee checks doesn't mean editing 5 duplicate copies.
  const isPayDisabled =
    _.isEmpty(dirtyFields) ||
    !isValid ||
    !name ||
    !phone ||
    !address ||
    !orderCountryDestination ||
    !orderStateProvinceDestination ||
    !orderLgaDestination ||
    !orderMarketPickupDestination ||
    deliveryLoading ||
    !!deliveryError ||
    paymentFailedPermanently ||
    readiness.data?.healthy === false;

  // Update the processing payment state when mutation is loading
  useEffect(() => {
    if (setIsProcessingPayment) {
      setIsProcessingPayment(loadingWhilePaying);
    }
  }, [loadingWhilePaying, setIsProcessingPayment]);

  const onSuccess = async (paystackResponse) => {
    try {
      const oderData = {
        refOrderId: "AFSH" + cartSessionPayload?.id + "MKT",
        cartItems: cartSessionPayload?.cartProducts,

        itemsPrice: parseInt(subtotal),
        shippingPrice: deliveryFee,
        taxPrice: vatAmount,
        totalPrice: grandTotal,

        orderCountryDestination: orderCountryDestination,
        orderStateProvinceDestination: orderStateProvinceDestination,
        orderLgaDestination: orderLgaDestination,
        orderMarketPickupDestination: orderMarketPickupDestination,

        paymentMethod: methodOfPay,
        shoppingCountrySession: cartSessionPayload?.countryId,
        shoppingStateSession: cartSessionPayload?.stateId,
        shoppingLgaSession: cartSessionPayload?.lgaId,
        shoppingDistrictSession: cartSessionPayload?.districtId,
        paymentResult: paystackResponse,
        shippingAddress: {
          fullName: name,
          phone: phone,
          address: address,
        },
        reference: paystackResponse?.reference,
      };

      verifyPaymentAndCreateOrder(oderData, {
        onError: (error) => {
          const errorMessage =
            error?.response?.data?.message || error?.message || "Payment verification failed.";
          // Paystack itself confirmed this attempt failed — the cart session
          // is rotated server-side (new session id, fresh reference), so this
          // exact reference can never be retried. Refetch the cart so the
          // parent picks up the new session id, and block this stale button.
          if (String(errorMessage).toLowerCase().includes("payment not successful")) {
            setPaymentFailedPermanently(true);
            queryClient.invalidateQueries(["__cart"]);
            toast.error("Your cart was refreshed after the failed payment. Please review and try again.");
          }
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const onClose = () => {
    // This will be handled by the payment close dialog in CartReview
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
      style={{
        border: "2px solid rgba(234, 88, 12, 0.15)",
      }}
    >
      {/* Header with Gradient */}
      <div
        className="p-4 sm:p-6"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Order Summary</h2>
            <p className="text-xs sm:text-sm text-white/80">Review your cart before payment</p>
          </div>
        </div>
      </div>

      {/* Summary Details - Scrollable */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
        {/* Items Count */}
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)",
            border: "1px solid rgba(234, 88, 12, 0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Items in Cart</span>
            </div>
            <span className="text-base font-bold text-orange-600">
              {cartSessionPayload?.cartProducts?.length || 0}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">₦{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery Fees with Mode Info */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Delivery Fee</span>
              {deliveryMode && !deliveryLoading && (
                <div className="group relative">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    {deliveryMode} delivery
                  </div>
                </div>
              )}
            </div>
            {deliveryLoading ? (
              <span className="text-xs text-gray-400 italic">calculating…</span>
            ) : (
              <span className="font-semibold text-gray-800">₦{formatCurrency(deliveryFee)}</span>
            )}
          </div>

          {/* Shipping error, if the calculator couldn't resolve a route */}
          {deliveryError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">{deliveryError}</p>
            </div>
          )}

          {/* VAT with Country Info */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{taxInfo.label}</span>
              <div className="group relative">
                <svg
                  className="w-4 h-4 text-gray-400 cursor-help"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  Applied based on {taxInfo.name}
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(vatAmount)}</span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <div className="text-right">
              <span
                className="text-2xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ₦{formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-sm"
          />
          <button
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
              color: "#ea580c",
              border: "2px solid rgba(234, 88, 12, 0.2)",
            }}
          >
            APPLY
          </button>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          {/* Paystack Payment */}
          {methodOfPay === "PAYSTACK" && (
            <div className="relative">
              <style>
                {`
                  .paystack-button-enabled:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(234, 88, 12, 0.5) !important;
                  }
                  .paystack-button-enabled:active {
                    transform: translateY(0px);
                  }
                `}
              </style>
              <PaystackButton
                text={`🔒 Pay ₦${formatCurrency(grandTotal)}`}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${
                  isPayDisabled ? "" : "paystack-button-enabled"
                }`}
                style={{
                  background: isPayDisabled
                    ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                    : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: isPayDisabled ? "#9ca3af" : "white",
                  border: "none",
                  cursor: isPayDisabled ? "not-allowed" : "pointer",
                  boxShadow: isPayDisabled ? "none" : "0 4px 15px rgba(234, 88, 12, 0.4)",
                  filter: isPayDisabled ? "grayscale(20%)" : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                reference={"AFSH" + cartSessionPayload?.id + "REF"}
                email={user?.email}
                amount={grandTotal * 100}
                metadata={{
                  userId: user?.id,
                  cartSessionId: cartSessionPayload?.id,
                }}
                publicKey={publicKey}
                onSuccess={(reference) => onSuccess(reference)}
                onClose={() => onClose()}
                disabled={isPayDisabled || loadingWhilePaying}
              />
              {paymentFailedPermanently && (
                <p className="mt-3 text-center text-sm font-semibold" style={{ color: "#dc2626" }}>
                  Your cart was refreshed after the failed payment. Please review your cart and try again.
                </p>
              )}
              {!paymentFailedPermanently && readiness.data?.healthy === false && (
                <p className="mt-3 text-center text-sm font-semibold" style={{ color: "#dc2626" }}>
                  We can't confirm order services are ready to process payment right now. Please try again shortly.
                </p>
              )}
              {isPayDisabled && !deliveryError && (
                <div className="mt-3 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-red-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-xs text-red-700 font-semibold">
                      {deliveryLoading
                        ? "Calculating shipping cost…"
                        : "Please complete all required fields to proceed"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flutterwave Payment */}
          {methodOfPay === "FLUTTERWAVE" && (
            <button
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
              }}
            >
              🔒 Pay with Flutterwave ₦{formatCurrency(grandTotal)}
            </button>
          )}

          {/* Pay on Delivery */}
          {methodOfPay === "PAYONDELIVERY" && (
            <button
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
              }}
            >
              Pay on Delivery ₦{formatCurrency(grandTotal)}
            </button>
          )}
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Protected</span>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          By proceeding, you agree to our{" "}
          <span className="text-orange-600 hover:underline cursor-pointer font-medium">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-orange-600 hover:underline cursor-pointer font-medium">
            Privacy Policy
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default CartSummaryAndPay;
