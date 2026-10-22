/**
 * Platform contact line + off-platform trade warning (tracker customer-20).
 *
 * Buyers never see a shop's or venue's own phone number: showing it lets a trade move off the platform. "Call Seller"
 * dials the AfricanShops order line, and a warning sits beside it. One constant per app instead of copies per page.
 */
export const PLATFORM_ORDER_PHONE = "07087200297";

/** `tel:` href for the platform order line. */
export const PLATFORM_ORDER_TEL = `tel:${PLATFORM_ORDER_PHONE}`;

export const PLATFORM_TRADE_WARNING =
	"AfricanShops will not be held liable for any trade that does not go through the platform.";
