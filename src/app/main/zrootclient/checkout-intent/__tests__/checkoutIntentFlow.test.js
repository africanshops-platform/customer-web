import {
	buildIntentOrder,
	clearPendingPayment,
	confirmUntilBooked,
	describeIntent,
	isIntentNotAvailable,
	loadPendingPayment,
	savePendingPayment
} from '../checkoutIntentFlow';

const noWait = () => Promise.resolve();
const sequence = (...answers) => {
	const calls = jest.fn();
	let i = 0;
	const confirm = async () => {
		calls();
		const a = answers[Math.min(i, answers.length - 1)];
		i += 1;
		if (a instanceof Error) throw a;
		return a;
	};
	return { confirm, calls };
};
const memoryStorage = () => {
	const m = {};
	return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => (m[k] = String(v)), removeItem: (k) => delete m[k] };
};

describe('describeIntent', () => {
	it('OPEN and REOPEN both open Paystack with the stored access code; CONFIRMED never does', () => {
		expect(describeIntent({ action: 'OPEN', reference: 'R', accessCode: 'ac' })).toEqual({ step: 'OPEN', reference: 'R', accessCode: 'ac' });
		expect(describeIntent({ action: 'REOPEN', reference: 'R', accessCode: 'ac' })).toEqual({ step: 'OPEN', reference: 'R', accessCode: 'ac' });
		expect(describeIntent({ action: 'CONFIRMED', reference: 'R' })).toEqual({ step: 'CONFIRM', reference: 'R' });
		expect(describeIntent({ action: 'OPEN', reference: 'R' })).toEqual({ step: 'UNKNOWN' }); // no access code: never guess
		expect(describeIntent(undefined)).toEqual({ step: 'UNKNOWN' });
	});
});

describe('isIntentNotAvailable', () => {
	it('is true only for the "not switched on" 404, so the old Pay flow carries on; real refusals are shown, never hidden', () => {
		expect(isIntentNotAvailable({ response: { status: 404, data: { message: 'Checkout intents are not switched on.' } } })).toBe(true);
		expect(isIntentNotAvailable({ response: { status: 404, data: { message: 'Cannot POST /paystack-payment/checkout-intents/food' } } })).toBe(true);
		expect(isIntentNotAvailable({ response: { status: 503, data: { message: 'We are confirming your payment.' } } })).toBe(false);
		expect(isIntentNotAvailable({ response: { status: 422, data: { message: 'A food order can only hold items from one restaurant.' } } })).toBe(false);
		expect(isIntentNotAvailable(new Error('Network Error'))).toBe(false);
	});
});

describe('buildIntentOrder', () => {
	it('drops the reference and the payment result, keeps the rest', () => {
		expect(buildIntentOrder({ reference: 'x', paymentResult: { a: 1 }, foodCartItems: [1], shippingAddress: { a: 1 } })).toEqual({ foodCartItems: [1], shippingAddress: { a: 1 } });
	});
});

describe('confirmUntilBooked', () => {
	it('stops at BOOKED and returns the order', async () => {
		const { confirm, calls } = sequence({ status: 'PAID' }, { status: 'BOOKED', orderId: 'o1' });
		expect(await confirmUntilBooked({ confirm, wait: noWait })).toEqual({ outcome: 'BOOKED', orderId: 'o1' });
		expect(calls).toHaveBeenCalledTimes(2);
	});

	it('a server that cannot answer is never read as "not paid": it keeps asking', async () => {
		const { confirm } = sequence(new Error('Network Error'), new Error('Network Error'), { status: 'BOOKED', orderId: 'o2' });
		expect(await confirmUntilBooked({ confirm, wait: noWait })).toEqual({ outcome: 'BOOKED', orderId: 'o2' });
	});

	it('says WAITING (the customer did not pay) only after looking a few times, or at once when asked quietly', async () => {
		const a = sequence({ status: 'WAITING' });
		expect(await confirmUntilBooked({ confirm: a.confirm, wait: noWait })).toEqual({ outcome: 'WAITING' });
		expect(a.calls).toHaveBeenCalledTimes(3);
		const b = sequence({ status: 'WAITING' });
		expect(await confirmUntilBooked({ confirm: b.confirm, wait: noWait, quietWaiting: true })).toEqual({ outcome: 'WAITING' });
		expect(b.calls).toHaveBeenCalledTimes(1);
	});

	it('NEEDS_ATTENTION is a failure the customer is told about, not a retry loop', async () => {
		const { confirm, calls } = sequence({ status: 'NEEDS_ATTENTION' });
		expect(await confirmUntilBooked({ confirm, wait: noWait })).toMatchObject({ outcome: 'FAILED' });
		expect(calls).toHaveBeenCalledTimes(1);
	});

	it('money there but no order yet after the time limit is PENDING (do not pay again), never WAITING', async () => {
		const { confirm } = sequence({ status: 'PAID' });
		expect(await confirmUntilBooked({ confirm, wait: noWait, maxMs: 0 })).toEqual({ outcome: 'PENDING' });
	});
});

describe('pending payment memory', () => {
	it('remembers a reference for its own cart only, and forgets it', () => {
		const s = memoryStorage();
		savePendingPayment('cart1', 'R1', s);
		expect(loadPendingPayment('cart1', s)).toMatchObject({ reference: 'R1' });
		expect(loadPendingPayment('cart2', s)).toBeNull();
		clearPendingPayment(s);
		expect(loadPendingPayment('cart1', s)).toBeNull();
	});

	it('survives storage that throws (private window)', () => {
		const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
		expect(() => savePendingPayment('c', 'R', broken)).not.toThrow();
		expect(loadPendingPayment('c', broken)).toBeNull();
		expect(() => clearPendingPayment(broken)).not.toThrow();
	});
});
