import { estimateBody, naira, pickDeliveryAddress } from "../shippingEstimateUtils";

describe("product shipping estimate helpers", () => {
  it("prefers the default address that has a delivery location", () => {
    const addresses = [
      { id: "a", isDefault: false, lga: "L1" },
      { id: "b", isDefault: true, lga: "L2" },
      { id: "c", isDefault: true },
    ];
    expect(pickDeliveryAddress(addresses).id).toBe("b");
  });

  it("falls back to any address with a location, and null when none has one", () => {
    expect(pickDeliveryAddress([{ id: "a", isDefault: true }, { id: "b", state: "S1" }]).id).toBe("b");
    expect(pickDeliveryAddress([{ id: "a", isDefault: true }])).toBeNull();
    expect(pickDeliveryAddress([])).toBeNull();
  });

  it("targets the pickup market when saved, else the LGA, else the state", () => {
    const base = { shopId: "shop1", productWeightGrams: 700 };
    expect(estimateBody({ ...base, address: { market: "M", lga: "L", state: "S" } })).toEqual({
      merchantShopId: "shop1", weightKg: 0.7, mode: "LAND", destinationMarketId: "M",
    });
    expect(estimateBody({ ...base, address: { lga: "L", state: "S" } })).toMatchObject({ destinationGeoId: "L", destinationLevel: "LGA" });
    expect(estimateBody({ ...base, address: { state: "S" } })).toMatchObject({ destinationGeoId: "S", destinationLevel: "STATE" });
  });

  it("never sends a zero weight (the server requires at least 0.01 kg)", () => {
    expect(estimateBody({ shopId: "s", productWeightGrams: 0, address: { state: "S" } }).weightKg).toBe(0.01);
    expect(estimateBody({ shopId: "s", productWeightGrams: undefined, address: { state: "S" } }).weightKg).toBe(0.01);
  });

  it("formats kobo as naira", () => {
    expect(naira(756000)).toBe("₦7,560");
  });
});
