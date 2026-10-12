import { buildVenueProfile, directionsUrl, dishRating, formatOpeningHours, formatTime, shareVenue } from "../venueProfile";

// A real record as the API returns it (Kano Central Kitchen on test).
const REAL = {
  title: "Kano Central Kitchen",
  operationMode: "RESTAURANT",
  foodMartCategory: "Restaurant",
  description: "A real Nigerian restaurant.",
  address: "Kano Central Kitchen Complex",
  phoneNumber: "+2347300337426",
  rating: null,
  numReviews: null,
  busniessOpenPeriod: "1970-01-01T08:00:00.000Z",
  busniessClosePeriod: "1970-01-01T23:00:00.000Z",
  createdAt: "2026-08-16T17:14:09.141Z",
  latitude: null,
  longitude: null,
};

describe("buildVenueProfile: only real fields, never placeholders", () => {
  it("builds from a real record and invents nothing the record does not have", () => {
    const p = buildVenueProfile(REAL);
    expect(p.name).toBe("Kano Central Kitchen");
    expect(p.venueLabel).toBe("Restaurant");
    expect(p.address).toBe("Kano Central Kitchen Complex");
    expect(p.phone).toBe("+2347300337426");
    expect(p.phoneHref).toBe("tel:+2347300337426");
    expect(p.description).toBe("A real Nigerian restaurant.");
    expect(p.listedSince).toBe(2026);
    expect(p.rating).toBeNull(); // no reviews -> no stars
    expect(p.directions).toBeNull(); // no coordinates -> no directions link
    expect(Object.keys(p)).not.toEqual(expect.arrayContaining(["email", "website", "followers", "following", "verified"]));
  });

  it("an empty or missing record yields no fake values at all", () => {
    [undefined, null, {}].forEach((record) => {
      const p = buildVenueProfile(record);
      expect(p.name).toBeNull();
      expect(p.rating).toBeNull();
      expect(p.hours).toBeNull();
      expect(p.address).toBeNull();
      expect(p.phone).toBeNull();
      expect(p.description).toBeNull();
      expect(p.listedSince).toBeNull();
      expect(p.directions).toBeNull();
    });
  });

  it("shows a rating only when real reviews exist behind it", () => {
    expect(buildVenueProfile({ rating: 4, numReviews: 12 }).rating).toEqual({ value: 4, count: 12 });
    expect(buildVenueProfile({ rating: 4, numReviews: 0 }).rating).toBeNull();
    expect(buildVenueProfile({ rating: 0, numReviews: 5 }).rating).toBeNull();
    expect(buildVenueProfile({ rating: null, numReviews: 5 }).rating).toBeNull();
    expect(buildVenueProfile({ rating: "x", numReviews: 5 }).rating).toBeNull();
  });

  it("labels the venue kind from its operation mode, not a hardcoded 'Restaurant & Bar'", () => {
    expect(buildVenueProfile({ operationMode: "CLUB" }).venueLabel).toBe("Club / Lounge");
    expect(buildVenueProfile({ operationMode: "SPOT" }).venueLabel).toBe("Spot");
    expect(buildVenueProfile({ operationMode: "CAFE" }).venueLabel).toBe("Café");
    expect(buildVenueProfile({ operationMode: "SOMETHING_ELSE" }).venueLabel).toBe("Restaurant");
  });

  it("adds the merchant's own category only when it says something the venue kind does not", () => {
    expect(buildVenueProfile({ operationMode: "RESTAURANT", foodMartCategory: "Restaurant" }).extraCategory).toBeNull();
    expect(buildVenueProfile({ operationMode: "CLUB", foodMartCategory: "Club" }).extraCategory).toBeNull();
    expect(buildVenueProfile({ operationMode: "RESTAURANT", foodMartCategory: "Seafood" }).extraCategory).toBe("Seafood");
  });

  it("trims text fields and treats blank strings as missing", () => {
    const p = buildVenueProfile({ title: "  Spot  ", description: "   ", address: "", phoneNumber: " " });
    expect(p.name).toBe("Spot");
    expect(p.description).toBeNull();
    expect(p.address).toBeNull();
    expect(p.phone).toBeNull();
    expect(p.phoneHref).toBeNull();
  });

  it("builds a tel: link with only digits and the plus sign", () => {
    expect(buildVenueProfile({ phoneNumber: "+234 (703) 003-3742" }).phoneHref).toBe("tel:+2347030033742");
  });
});

describe("opening hours", () => {
  it("formats a real open/close pair the same way the listing cards do", () => {
    const expected = `${new Date(REAL.busniessOpenPeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(REAL.busniessClosePeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    expect(formatOpeningHours(REAL.busniessOpenPeriod, REAL.busniessClosePeriod)).toBe(expected);
  });

  it("returns null when either end is missing or not a valid date (never 'Invalid Date')", () => {
    expect(formatOpeningHours(null, "1970-01-01T23:00:00.000Z")).toBeNull();
    expect(formatOpeningHours("1970-01-01T08:00:00.000Z", undefined)).toBeNull();
    expect(formatOpeningHours("garbage", "1970-01-01T23:00:00.000Z")).toBeNull();
    expect(formatTime("garbage")).toBeNull();
    expect(formatTime("")).toBeNull();
  });
});

describe("directionsUrl", () => {
  it("builds a maps link from valid coordinates, including string values from the API", () => {
    expect(directionsUrl("9.0765", "7.3986")).toBe("https://www.google.com/maps/dir/?api=1&destination=9.0765,7.3986");
    expect(directionsUrl(0, 0)).toBe("https://www.google.com/maps/dir/?api=1&destination=0,0");
  });

  it("returns null for missing, non-numeric or out-of-range coordinates", () => {
    expect(directionsUrl(null, null)).toBeNull();
    expect(directionsUrl(undefined, "7")).toBeNull();
    expect(directionsUrl("abc", "7")).toBeNull();
    expect(directionsUrl(95, 7)).toBeNull();
    expect(directionsUrl(9, 190)).toBeNull();
  });
});

describe("shareVenue", () => {
  const venue = { title: "Kano Central Kitchen", url: "https://example.test/v" };

  it("uses the native share sheet when available", async () => {
    const nav = { share: jest.fn().mockResolvedValue(undefined) };
    expect(await shareVenue(venue, nav)).toBe("shared");
    expect(nav.share).toHaveBeenCalledWith(venue);
  });

  it("copies the link when there is no share sheet", async () => {
    const nav = { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } };
    expect(await shareVenue(venue, nav)).toBe("copied");
    expect(nav.clipboard.writeText).toHaveBeenCalledWith(venue.url);
  });

  it("reports failure without throwing when sharing is dismissed, errors, or nothing is supported", async () => {
    expect(await shareVenue(venue, { share: jest.fn().mockRejectedValue(Object.assign(new Error("x"), { name: "AbortError" })) })).toBe("failed");
    expect(await shareVenue(venue, { share: jest.fn().mockRejectedValue(new Error("boom")) })).toBe("failed");
    expect(await shareVenue(venue, {})).toBe("failed");
    expect(await shareVenue(venue, undefined)).toBe("failed");
  });
});

describe("dishRating", () => {
  it("returns the real rating and review count when both exist", () => {
    expect(dishRating({ rating: 4.5, reviews: 12 })).toEqual({ rating: 4.5, count: 12 });
    expect(dishRating({ rating: "4", reviews: "3" })).toEqual({ rating: 4, count: 3 });
  });

  it("accepts the review count as numReviews, a number, or the list of reviews", () => {
    expect(dishRating({ rating: 4, numReviews: 5 })).toEqual({ rating: 4, count: 5 });
    expect(dishRating({ rating: 4, reviews: [{}, {}] })).toEqual({ rating: 4, count: 2 });
    expect(dishRating({ rating: 4, reviews: [] })).toEqual({ rating: null, count: 0 });
  });

  it("never invents a default rating or a random review count for an unreviewed dish", () => {
    expect(dishRating({})).toEqual({ rating: null, count: 0 });
    expect(dishRating(undefined)).toEqual({ rating: null, count: 0 });
    expect(dishRating({ rating: 4.5 })).toEqual({ rating: null, count: 0 });
    expect(dishRating({ rating: 4.5, reviews: 0 })).toEqual({ rating: null, count: 0 });
    expect(dishRating({ rating: 0, reviews: 5 })).toEqual({ rating: null, count: 0 });
    expect(dishRating({ rating: null, reviews: null })).toEqual({ rating: null, count: 0 });
  });

  it("is deterministic (the old code showed a different random count on every render)", () => {
    const item = { rating: 4, reviews: 7 };
    expect(dishRating(item)).toEqual(dishRating(item));
  });
});
