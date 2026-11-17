/**
 * F28 (docs/designs/F28-paid-order-recovery.md): the customer's Pay flow around a server-made CHECKOUT INTENT. Pure helpers, no React, so the
 * rules can be tested on their own. The server owns the truth (reference, amount, whether the money arrived); the browser only follows it.
 *
 * The rule the whole flow serves: one cart is never charged twice. So Pay never makes its own reference, a second Pay reopens the SAME
 * Paystack transaction, and when anything is unclear the page asks the server and waits instead of asking the customer to pay again.
 */

export const CONFIRM_POLL_MS = 3000;
export const CONFIRM_MAX_MS = 90000;
/** After the first minute and a half the page keeps checking quietly, slowly, for a few more minutes (the webhook or the booking job may still place the order). */
export const LATE_POLL_MS = 15000;
export const LATE_MAX_MS = 600000;
const PENDING_KEY = 'afs.pendingCheckout.v1';

/** What the confirm call returned, as the page's next step. */
export function describeIntent(res) {
	const d = res || {};
	if (d.action === 'CONFIRMED') return { step: 'CONFIRM', reference: d.reference };
	if ((d.action === 'OPEN' || d.action === 'REOPEN') && d.accessCode) return { step: 'OPEN', reference: d.reference, accessCode: d.accessCode };
	return { step: 'UNKNOWN' };
}

/** The server says intents are not switched on (or the route is not there yet): fall back to the old Pay flow, exactly as before. */
export function isIntentNotAvailable(error) {
	const status = error?.response?.status;
	const message = String(error?.response?.data?.message ?? '');
	return status === 404 && (/not switched on/i.test(message) || !message || /Cannot POST/i.test(message));
}

/** What the page sends to price the cart: the order the old confirm call would send, minus what only exists after payment. */
export function buildIntentOrder(orderData) {
	// eslint-disable-next-line no-unused-vars
	const { reference, paymentResult, ...rest } = orderData || {};
	return rest;
}

/**
 * Asks the server whether the payment has become an order, again and again, until it has or the time is up. `confirm()` returns the server's
 * answer for the reference: { status: 'BOOKED', orderId } | { status: 'WAITING' } (Paystack has no payment yet) | { status: 'PAID' | 'BOOKING' }
 * (the money is there, the order is being made) | { status: 'NEEDS_ATTENTION' }.
 *
 *  BOOKED   -> go to the success page
 *  WAITING  -> the customer did not pay (they closed the window); they may pay again and it reopens the same transaction
 *  PENDING  -> the money is there but the order is still being made; do not pay again, we keep trying
 *  UNSURE   -> the server could not be reached for the whole time: we do not know; do not pay again, check My Orders, we keep checking
 *  FAILED   -> the money is there but the order could not be made; a person will review it and refund if needed
 */
export async function confirmUntilBooked({ confirm, wait = (ms) => new Promise((r) => setTimeout(r, ms)), intervalMs = CONFIRM_POLL_MS, maxMs = CONFIRM_MAX_MS, quietWaiting = false }) {
	const started = Date.now();
	let attempt = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		attempt += 1;
		let out;
		try {
			out = await confirm();
		} catch (err) {
			// The server could not say (Paystack unreachable, a service restarting): never treat it as "not paid", keep asking.
			out = { status: 'UNREACHABLE', message: err?.response?.data?.message };
		}
		const status = out?.status;
		if (status === 'BOOKED') return { outcome: 'BOOKED', orderId: out.orderId ?? null };
		if (status === 'NEEDS_ATTENTION') return { outcome: 'FAILED', message: out?.message };
		if (status === 'WAITING') {
			// Right after the popup closes Paystack may not have the result yet: look a few times before saying the customer did not pay.
			if (quietWaiting || attempt >= 3) return { outcome: 'WAITING' };
		}
		if (Date.now() - started >= maxMs) {
			// Out of time. Only a clear "Paystack has no payment" is WAITING. A server that could not answer proves nothing either way (the money may be
			// there), so it is UNSURE: tell the customer exactly that, never "the payment was not completed".
			if (status === 'WAITING') return { outcome: 'WAITING' };
			return { outcome: status === 'UNREACHABLE' ? 'UNSURE' : 'PENDING' };
		}
		await wait(intervalMs);
	}
}

/** A convenience only: remembers the reference so a reload or a return visit resumes the confirming. The server stays the source of truth. */
export function savePendingPayment(cartKey, reference, storage = globalThis.localStorage) {
	try {
		storage?.setItem(PENDING_KEY, JSON.stringify({ cartKey, reference, at: Date.now() }));
	} catch {
		/* private window or storage blocked: the page still works without it */
	}
}

export function loadPendingPayment(cartKey, storage = globalThis.localStorage, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
	try {
		const v = JSON.parse(storage?.getItem(PENDING_KEY) || 'null');
		if (!v || v.cartKey !== cartKey || !v.reference || Date.now() - v.at > maxAgeMs) return null;
		return v;
	} catch {
		return null;
	}
}

export function clearPendingPayment(storage = globalThis.localStorage) {
	try {
		storage?.removeItem(PENDING_KEY);
	} catch {
		/* nothing to clear */
	}
}
