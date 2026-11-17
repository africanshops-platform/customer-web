import { useEffect, useRef, useState } from 'react';
import PaystackPop from '@paystack/inline-js';
import { toast } from 'react-toastify';
import { confirmCheckoutIntentApi } from 'app/configs/data/client/RepositoryAuthClient';
import {
	buildIntentOrder,
	clearPendingPayment,
	confirmUntilBooked,
	describeIntent,
	isIntentNotAvailable,
	LATE_MAX_MS,
	LATE_POLL_MS,
	loadPendingPayment,
	savePendingPayment
} from './checkoutIntentFlow';

/**
 * F28 (docs/designs/F28-paid-order-recovery.md): the Pay flow for a food or marketplace cart through a server-made CHECKOUT INTENT. One hook, used by
 * both pages, so the money-safety rules live in one tested place.
 *
 * The rules: the server makes the Paystack transaction (one reference per CART SESSION for its whole life, derived from the cart session id), so
 *  - a second Pay reopens the SAME transaction and can never charge the cart twice;
 *  - if Paystack already has the money, Pay never opens Paystack: it confirms and places the order;
 *  - a closed window or a "network error" is never read as "not paid": the page asks the server and waits;
 *  - if the cart changed after payment was started, the server refuses (409) and moves the customer to a NEW cart session.
 * When the server has intents switched off it answers "not switched on" and `startLegacy` runs the old Pay flow exactly as before.
 *
 * phases: idle | starting | confirming | pending (money there, order still being placed) | unsure (server unreachable, nothing known) | failed (money there, order could not be placed)
 * pending and unsure are not dead ends: the page keeps checking every 15 s for 10 more minutes and goes to the order the moment it exists.
 */
export default function useCheckoutIntentPay({ cartKey, createIntentApi, buildOrder, startLegacy, onBooked, onCartRefresh, canPay = () => true }) {
	const [payPhase, setPayPhase] = useState('idle');
	const [payRef, setPayRef] = useState(null);
	const latest = useRef({});
	const alive = useRef(true);
	useEffect(() => () => { alive.current = false; }, []);
	latest.current = { cartKey, createIntentApi, buildOrder, startLegacy, onBooked, onCartRefresh, canPay };

	const runConfirm = async (reference, { silentWaiting = false } = {}) => {
		setPayPhase('confirming');
		setPayRef(reference);
		savePendingPayment(latest.current.cartKey, reference);
		const result = await confirmUntilBooked({ confirm: async () => (await confirmCheckoutIntentApi(reference))?.data });
		if (result.outcome === 'BOOKED') {
			clearPendingPayment();
			setPayPhase('idle');
			latest.current.onBooked?.(result.orderId);
			return;
		}
		if (result.outcome === 'WAITING') {
			// Paystack has no payment for it: the customer closed the window. They may pay again and it reopens the same transaction.
			clearPendingPayment();
			setPayPhase('idle');
			if (!silentWaiting) toast.info('The payment was not completed. You can try again; you will not be charged twice.');
			return;
		}
		// The money is there but the order is not placed yet (PENDING), the server could not say (UNSURE), or the order could not be placed (FAILED):
		// never ask the customer to pay again.
		if (result.outcome === 'FAILED') {
			setPayPhase('failed');
			return;
		}
		setPayPhase(result.outcome === 'UNSURE' ? 'unsure' : 'pending');
		keepChecking(reference);
	};

	// Not a dead end: keep asking slowly after the first minute and a half, and move on as soon as the order exists.
	const keepChecking = async (reference) => {
		const result = await confirmUntilBooked({
			confirm: async () => (await confirmCheckoutIntentApi(reference))?.data,
			intervalMs: LATE_POLL_MS,
			maxMs: LATE_MAX_MS,
			quietWaiting: true
		});
		if (!alive.current) return;
		if (result.outcome === 'BOOKED') {
			clearPendingPayment();
			setPayPhase('idle');
			latest.current.onBooked?.(result.orderId);
		} else if (result.outcome === 'FAILED') {
			setPayPhase('failed');
		}
		// otherwise it stays as it is: the banner already says what to do, and a reload resumes from the saved reference
	};

	const openPaystack = (intent) => {
		new PaystackPop().resumeTransaction(intent.accessCode, {
			onSuccess: () => runConfirm(intent.reference),
			// A closed window is NOT proof of no payment (a "network error" can hide a paid one): ask the server before saying anything.
			onCancel: () => runConfirm(intent.reference, { silentWaiting: true }),
			onError: (err) => {
				toast.error(err?.message || 'We could not open the payment window. Please try again.');
				setPayPhase('idle');
			}
		});
	};

	const handlePay = async () => {
		const c = latest.current;
		if (!c.canPay()) return;
		setPayPhase('starting');
		try {
			const res = await c.createIntentApi({ cartSessionId: c.cartKey, order: buildIntentOrder(c.buildOrder()) });
			const next = describeIntent(res?.data);
			if (next.step === 'OPEN') return openPaystack(next);
			if (next.step === 'CONFIRM') return runConfirm(next.reference); // already paid: never open Paystack again
			toast.error('We could not start the payment. Please try again.');
			setPayPhase('idle');
		} catch (error) {
			if (isIntentNotAvailable(error)) {
				setPayPhase('idle');
				c.startLegacy();
				return;
			}
			if (error?.response?.status === 409) c.onCartRefresh?.(); // the server moved the customer to a new cart session
			toast.error(error?.response?.data?.message || 'We could not start the payment. Please try again.');
			setPayPhase('idle');
		}
	};

	// A reload or a return visit after paying resumes the confirming instead of showing a fresh Pay button.
	useEffect(() => {
		const pending = loadPendingPayment(cartKey);
		if (pending?.reference) runConfirm(pending.reference, { silentWaiting: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cartKey]);

	return { payPhase, payRef, handlePay };
}
