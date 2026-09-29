import _ from "@lodash";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { toast } from "react-toastify";
import {
  usePayAndPlaceFoodOrder,
  useCalculateFoodCartShipping,
} from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { useFoodCheckoutReadiness } from "app/configs/data/server-calls/auth/paystack-payments/usePaystackPaymentsRepo";
import { useAppSelector } from "app/store/hooks";
import { useQueryClient } from "react-query";
import { selectUser } from "../../../../auth/user/store/userSlice";
import {
  calculateCartTotalAmount,
  formatCurrency,
  generateClientUID,
} from "../../../vendors-shop/PosUtils";

// Country VAT rates (placeholder — replace with API)
const VAT_RATES = {
  1: { rate: 0.075, name: "Nigeria",      label: "VAT (7.5%)" },
  2: { rate: 0.05,  name: "Ghana",        label: "VAT (5%)" },
  3: { rate: 0.16,  name: "Kenya",        label: "VAT (16%)" },
  4: { rate: 0.18,  name: "South Africa", label: "VAT (18%)" },
};

function FoodCartSummaryAndPay({
  cartSession,
  intemsInCart,
  methodOfPay,
  name,
  phone,
  address,
  orderCountryDestination,
  orderStateProvinceDestination,
  orderLgaDestination,
  orderMarketPickupDestination,
  district,
  dirtyFields,
  isValid,
  setIsProcessingPayment,
}) {
  const user = useAppSelector(selectUser);

  // Food orders are LGA-locked: the vendor's own LGA (real server-side field on the food
  // cart session, cartSession.lgaId — a stale client-side cookie was used here previously
  // and was never populated by the actual add-to-cart flow, silently breaking every food
  // order's foodMart/LGA fields) must match the delivery LGA — food needs to travel fast,
  // so cross-LGA (let alone cross-state) delivery isn't offered.
  const isOutsideVendorLga =
    !!cartSession?.lgaId &&
    !!orderLgaDestination &&
    cartSession.lgaId !== orderLgaDestination;

  const queryClient = useQueryClient();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryError, setDeliveryError] = useState(null);
  const { mutate: calculateFoodCartShipping, isLoading: deliveryLoading } =
    useCalculateFoodCartShipping();

  // A failed Paystack attempt now rotates this food cart session server-side
  // (a fresh session id, so a retry doesn't collide with the already-used
  // AFSHFMKT<sessionId> reference) — block this exact button until the
  // parent's food cart query refetches with the new session.
  const [paymentFailedPermanently, setPaymentFailedPermanently] = useState(false);
  const readiness = useFoodCheckoutReadiness();

  // Build subtotal from cart items
  const checkItemsArray = (intemsInCart || []).map((el) => ({
    quantity: el?.quantity,
    price: el?.martMenu?.price ?? el?.price ?? 0,
  }));
  const subtotal = calculateCartTotalAmount(checkItemsArray);

  // Live shipping estimate — recalculated whenever the customer picks/changes their
  // destination (market pickup point, or a raw LGA for home delivery). Real cost from
  // places-service's rate tables via the food cart's actual vendor, resolved server-side
  // — not a client-side guess. This is the ONLY place the calculation runs pre-payment;
  // onSuccess below just carries the already-computed deliveryFee into the order payload,
  // it never recalculates (the backend re-runs the same calculation itself, authoritatively,
  // at verify time — that's a separate concern from what the customer sees before paying).
  useEffect(() => {
    if (!orderMarketPickupDestination && !orderLgaDestination) {
      setDeliveryFee(0);
      setDeliveryError(null);
      return;
    }

    const destinationPayload = orderMarketPickupDestination
      ? { destinationMarketId: orderMarketPickupDestination }
      : { destinationGeoId: orderLgaDestination, destinationLevel: "LGA" };

    calculateFoodCartShipping(destinationPayload, {
      onSuccess: (response) => {
        const result = response?.data;
        if (result?.success) {
          setDeliveryFee(Math.round((result.amountKobo ?? 0) / 100));
          setDeliveryError(null);
        }
      },
      onError: (error) => {
        setDeliveryFee(0);
        setDeliveryError(
          error?.response?.data?.message ||
            "Delivery isn't available to this location yet — try a different pickup point.",
        );
      },
    });
  }, [orderMarketPickupDestination, orderLgaDestination]);

  // VAT
  const taxInfo =
    VAT_RATES[orderCountryDestination] || VAT_RATES[1];
  const vatAmount = Math.round(subtotal * taxInfo.rate);

  const grandTotal = parseInt(subtotal || 0, 10) + parseInt(deliveryFee, 10) + parseInt(vatAmount, 10);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const { mutate: verifyPaymentAndCreateOrder, isLoading: payFoodLoading } =
    usePayAndPlaceFoodOrder();

  useEffect(() => {
    if (setIsProcessingPayment) setIsProcessingPayment(payFoodLoading);
  }, [payFoodLoading, setIsProcessingPayment]);

  const onSuccess = async (paystackResponse) => {
    try {
      const orderData = {
        //|| generateClientUID()
        refOrderId: `AFSHFMKT${cartSession?.id}`,
        foodCartItems: intemsInCart,
        itemsPrice: parseInt(subtotal, 10),
        shippingPrice: deliveryFee,
        taxPrice: vatAmount,
        totalPrice: grandTotal,
        orderCountryDestination,
        orderStateProvinceDestination,
        orderLgaDestination,
        orderMarketPickupDestination,
        district,
        paymentMethod: methodOfPay,
        shoppingLgaSession: cartSession?.lgaId,
        paymentResult: paystackResponse,
        shippingAddress: { fullName: name, phone, address },
        foodMart: cartSession?.foodmartId,
        reference: paystackResponse?.reference,
      };
      verifyPaymentAndCreateOrder(orderData, {
        onError: (error) => {
          const errorMessage =
            error?.response?.data?.message || error?.message || "Payment verification failed.";
          // Paystack itself confirmed this attempt failed — the food cart
          // session is rotated server-side (new session id, fresh
          // reference), so this exact reference can never be retried.
          // Refetch the food cart so the parent picks up the new session id.
          if (String(errorMessage).toLowerCase().includes("payment not successful")) {
            setPaymentFailedPermanently(true);
            queryClient.invalidateQueries(["__foodcart"]);
            toast.error("Your cart was refreshed after the failed payment. Please review and try again.");
          }
        },
      });
    } catch (err) {
      console.error("Food payment error:", err);
      toast.error("Payment failed. Please try again.");
    }
  };

  const onClose = () => {
    // Handled by parent dialog — no action needed here
  };

  const isFormIncomplete =
    _.isEmpty(dirtyFields) ||
    !isValid ||
    !name ||
    !phone ||
    !address ||
    !orderCountryDestination ||
    !orderStateProvinceDestination ||
    !orderLgaDestination ||
    !district ||
    !orderMarketPickupDestination ||
    isOutsideVendorLga ||
    deliveryLoading ||
    !!deliveryError ||
    paymentFailedPermanently ||
    readiness.data?.healthy === false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
      style={{ border: "2px solid rgba(234,88,12,0.15)" }}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-6 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <span style={{ fontSize: "1.5rem" }}>🍽️</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Food Order Summary</h2>
            <p className="text-xs sm:text-sm text-white/80">Review before placing your order</p>
          </div>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

        {/* Items count badge */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(234,88,12,0.02) 100%)",
            border: "1px solid rgba(234,88,12,0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Items in Cart</span>
            </div>
            <span className="text-base font-bold text-orange-600">
              {intemsInCart?.length || 0}
            </span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">₦{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery fee — live estimate from the real shipping calculator */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-semibold text-gray-800">
              {deliveryLoading ? "Calculating…" : `₦${formatCurrency(deliveryFee)}`}
            </span>
          </div>

          {/* VAT with country tooltip */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{taxInfo.label}</span>
              <div className="group relative">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  Applied based on {taxInfo.name}
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(vatAmount)}</span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          {/* Grand total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">Total</span>
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

        {/* Promo code */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-sm"
          />
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)",
              color: "#ea580c",
              border: "2px solid rgba(234,88,12,0.2)",
            }}
          >
            APPLY
          </button>
        </div>

        {/* Payment buttons */}
        <div className="space-y-3">

          {/* Paystack */}
          {methodOfPay === "PAYSTACK" && (
            <div className="relative">
              <style>{`
                .food-paystack-enabled:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(234,88,12,0.5) !important;
                }
                .food-paystack-enabled:active { transform: translateY(0); }
              `}</style>
              <PaystackButton
                text={`🔒 Pay ₦${formatCurrency(grandTotal)}`}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${isFormIncomplete ? "" : "food-paystack-enabled"}`}
                style={{
                  background: isFormIncomplete
                    ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                    : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: isFormIncomplete ? "#9ca3af" : "white",
                  border: "none",
                  cursor: isFormIncomplete ? "not-allowed" : "pointer",
                  boxShadow: isFormIncomplete ? "none" : "0 4px 15px rgba(234,88,12,0.4)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                reference={`AFSHFMKT${cartSession?.id || generateClientUID()}`}
                email={user?.email}
                amount={grandTotal * 100}
                metadata={{
                  userId: user?.id,
                  foodCartSessionId: cartSession?.id,
                }}
                publicKey={publicKey}
                onSuccess={(ref) => onSuccess(ref)}
                onClose={() => onClose()}
                disabled={isFormIncomplete || payFoodLoading}
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
              {isFormIncomplete && (
                <div className="mt-3 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-700 font-semibold">
                      {isOutsideVendorLga
                        ? "This food mart only delivers within its own L.G.A/County — choose a delivery location in the same L.G.A."
                        : deliveryError || "Please complete all required fields"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flutterwave */}
          {methodOfPay === "FLUTTERWAVE" && (
            <button
              type="button"
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
              }}
            >
              🔒 Pay with Flutterwave ₦{formatCurrency(grandTotal)}
            </button>
          )}

          {/* Pay on Delivery */}
          {methodOfPay === "PAYONDELIVERY" && (
            <button
              type="button"
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
              }}
            >
              Pay on Delivery ₦{formatCurrency(grandTotal)}
            </button>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
}

export default FoodCartSummaryAndPay;
