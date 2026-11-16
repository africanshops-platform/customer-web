/** Pure helpers for the funding screens (board F18), kept free of React so they are easy to test. */

export const QUOTE_MIN_KOBO = 10000; // ₦100, the smallest top-up
export const QUOTE_MAX_KOBO = 1000000000; // ₦10,000,000, the largest single top-up

/** The gateway's own sentence when there is one, else a plain fallback. Never the raw axios text. */
export function fundingErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const m = err?.response?.data?.message ?? err?.serverMessage;
  if (Array.isArray(m)) return m.join('. ');
  if (typeof m === 'string' && m.trim()) return m;
  return fallback;
}

/** An older backend has no `fund/intent` route and answers 404: only then does the screen fall back to the previous flow. */
export function isIntentRouteMissing(err) {
  return (err?.response?.status ?? err?.status) === 404;
}

/** `AFSHFUND<account><epoch>`: the reference the previous flow made in the browser; used only against an older backend. */
export function legacyFundingReference(accountNumber, now = Date.now()) {
  return `AFSHFUND${accountNumber}${now}`;
}

/** How much cheaper the bank transfer is than the card for the same wallet amount, in kobo. Zero when it is not cheaper or a quote is missing. */
export function transferSaving(card, transfer) {
  if (!card || !transfer) return 0;
  return Math.max(0, card.chargeKobo - transfer.chargeKobo);
}

/** The exact figure to type into a banking app: naira with two decimals, no thousands separators. */
export function exactSendAmount(grossKobo) {
  return (grossKobo / 100).toFixed(2);
}

/** A deposit has landed when the wallet is above the balance seen when the person said they had sent it. */
export function depositArrived(baselineKobo, nowKobo) {
  return Number.isFinite(nowKobo) && nowKobo > baselineKobo;
}
