import { useQuery } from "react-query";
import { Typography } from "@mui/material";
import { LocalShipping } from "@mui/icons-material";
import { useGetUserAddresses } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-addresses";
import { getProductShippingEstimateApi } from "app/configs/data/client/RepositoryClient";
import { naira, pickDeliveryAddress, estimateBody } from "./shippingEstimateUtils";

/**
 * A real shipping estimate for ONE unit, from the shop's market warehouse to the buyer's saved delivery
 * location. Replaces the old hardcoded "Shipping from ₦1,080" text. Without a saved location it says so
 * honestly instead of guessing.
 */
function ProductShippingEstimate({ productData }) {
  const { data: addresses = [], isLoading: addressesLoading } = useGetUserAddresses();
  const address = pickDeliveryAddress(addresses);
  const shopId = productData?.shop;
  const enabled = Boolean(address && shopId);

  const { data, isLoading, isError } = useQuery(
    ["__productShipping", shopId, productData?.productWeight, address?.id, address?.market, address?.lga, address?.state],
    () => getProductShippingEstimateApi(estimateBody({ shopId, productWeightGrams: productData?.productWeight, address })),
    { enabled, staleTime: 5 * 60 * 1000, retry: 0 },
  );

  const cost = data?.data?.costs?.[0];
  let text;
  if (!enabled) {
    text = addressesLoading
      ? "Checking delivery options…"
      : "Add a delivery location to one of your saved addresses to see the shipping cost here";
  } else if (isLoading) {
    text = "Calculating shipping…";
  } else if (isError || !cost) {
    text = "Shipping is calculated at checkout";
  } else {
    const days = cost.transitDaysMax ? ` · about ${cost.transitDaysMin || 1}–${cost.transitDaysMax} days` : "";
    text = `Shipping to ${address.name}: ${naira(cost.amountKobo)} for 1 item${days}`;
  }

  return (
    <div className="flex items-center gap-3" data-testid="product-shipping-estimate">
      <LocalShipping sx={{ color: "#3b82f6", fontSize: "1.5rem" }} />
      <Typography variant="body2" className="text-gray-600">
        {text}
      </Typography>
    </div>
  );
}

export default ProductShippingEstimate;
