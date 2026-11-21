/**
 * F29 3.4: the customer-paid "Payment gateway fee" on a card checkout, as the checkout pages show it. The SERVER prices it (the page only asks and shows):
 * the quote for the CHECKOUT operation says how much is charged on top of the cart, and it is 0 when no fee policy is on, so a page with no fee looks
 * exactly as it always did. ONE line, always labelled "Payment gateway fee": never an itemised breakdown.
 */
export const FEE_LABEL = 'Payment gateway fee';

const wholeKobo = (n) => Number.isSafeInteger(n) && n >= 0;

/** The fee in kobo from a quote response (0 when there is none, or the response is not usable). */
export function feeKoboOfQuote(quote) {
	const fee = Number(quote?.chargeKobo);
	return wholeKobo(fee) ? fee : 0;
}

/** What the customer pays in kobo: the cart plus the fee. */
export const payableKobo = (cartKobo, feeKobo) => (wholeKobo(cartKobo) ? cartKobo : 0) + (wholeKobo(feeKobo) ? feeKobo : 0);

/** Naira text for an amount in kobo: whole naira show no decimals, otherwise two ("10,258.89"). */
export function nairaText(kobo) {
	const k = wholeKobo(kobo) ? kobo : 0;
	const naira = k / 100;

	return naira.toLocaleString('en-NG', { minimumFractionDigits: k % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 });
}

/** The cart total is only quotable when the server would accept it (the quote route takes N100 up to the agreed maximum). */
export const isQuotable = (cartKobo) => Number.isSafeInteger(cartKobo) && cartKobo >= 10000 && cartKobo <= 100000000000;

/** The Pay button's words while a payment is being made (the same wording on every checkout), or `idleText` when nothing is happening. */
export function payButtonLabel(phase, idleText) {
	if (phase === 'starting') return 'Starting your payment...';
	if (phase === 'confirming') return 'Confirming your payment...';
	if (phase === 'pending' || phase === 'unsure') return 'Checking your payment...';

	return idleText;
}
