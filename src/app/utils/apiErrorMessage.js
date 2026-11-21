/**
 * The reason a request failed, in words a person can act on. The server answers refusals as { message } but the message can arrive as a string, a
 * list of strings (validation), an object with its own message, or under `error`; a plain "Transfer failed" hid the real reason (for example the
 * account's per-transaction limit). Falls back to `fallback` only when nothing readable is there.
 */
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
	const data = error?.response?.data;
	const pick = (v) => {
		if (typeof v === 'string' && v.trim()) return v.trim();
		if (Array.isArray(v)) {
			const parts = v.map(pick).filter(Boolean);

			return parts.length ? parts.join(' ') : null;
		}
		if (v && typeof v === 'object') return pick(v.message) || pick(v.error) || null;

		return null;
	};

	return pick(data?.message) || pick(data?.error) || pick(data) || (typeof error?.message === 'string' && !/^Request failed with status code/.test(error.message) && error.message.trim()) || fallback;
}

/** True when the reason is the account's own spending limit, so the screen can point to where it is changed. */
export const isLimitMessage = (message) => /per-transaction limit|daily limit|monthly (allowance|cap)/i.test(String(message ?? ''));

/**
 * The reason for a failed money move. When the reason is one of the account's own limits, say where the way up is: limits above N100,000 are only
 * for accounts that completed identity verification (KYC); a verified account raises them in Settings and a raise takes 24 hours to apply.
 */
export function moneyErrorMessage(error, fallback) {
	const message = apiErrorMessage(error, fallback);

	return isLimitMessage(message) ? `${message} Limits above ₦100,000 are only for accounts with identity verification (KYC).` : message;
}
