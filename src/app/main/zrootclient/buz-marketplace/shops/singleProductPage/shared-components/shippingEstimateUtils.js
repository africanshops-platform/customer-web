export const naira = (kobo) => `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;

/** The most precise place we know to ship to: the default address if it has a delivery location, else any that does. */
export function pickDeliveryAddress(addresses = []) {
  const hasLocation = (a) => a?.market || a?.lga || a?.state;
  return addresses.find((a) => a.isDefault && hasLocation(a)) || addresses.find(hasLocation) || null;
}

/** Request body for the public estimate route: the market if saved, else LGA, else state. */
export function estimateBody({ shopId, productWeightGrams, address }) {
  const weightKg = Math.max(0.01, (Number(productWeightGrams) || 0) / 1000);
  const base = { merchantShopId: shopId, weightKg, mode: "LAND" };
  if (address.market) return { ...base, destinationMarketId: address.market };
  if (address.lga) return { ...base, destinationGeoId: address.lga, destinationLevel: "LGA" };
  return { ...base, destinationGeoId: address.state, destinationLevel: "STATE" };
}

