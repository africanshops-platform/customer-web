import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import PaystackPop from '@paystack/inline-js';
import { confirmCheckoutIntentApi } from 'app/configs/data/client/RepositoryAuthClient';
import useCheckoutIntentPay from '../useCheckoutIntentPay';
import { clearPendingPayment, savePendingPayment } from '../checkoutIntentFlow';

jest.mock('@paystack/inline-js', () => {
	function Pop() {
		this.resumeTransaction = (code, callbacks) => Pop.calls.push({ code, callbacks });
	}
	Pop.calls = [];
	return { __esModule: true, default: Pop };
});
jest.mock('react-toastify', () => ({ toast: { info: jest.fn(), error: jest.fn(), success: jest.fn() } }));
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({ confirmCheckoutIntentApi: jest.fn() }));
// the real rules, with a 30 ms time limit and 5 ms polling instead of 90 s and 3 s
jest.mock('../checkoutIntentFlow', () => {
	const actual = jest.requireActual('../checkoutIntentFlow');
	return { ...actual, confirmUntilBooked: (o) => actual.confirmUntilBooked({ ...o, maxMs: 30, intervalMs: 5 }) };
});

const intentReply = (data) => Promise.resolve({ data });
const confirmReplies = (...answers) => {
	let i = 0;
	confirmCheckoutIntentApi.mockImplementation(() => {
		const a = answers[Math.min(i, answers.length - 1)];
		i += 1;
		return a instanceof Error ? Promise.reject(a) : Promise.resolve({ data: a });
	});
};

function setup(overrides = {}) {
	const props = {
		cartKey: 'cart1',
		createIntentApi: jest.fn(() => intentReply({ action: 'OPEN', reference: 'AFSHCIFcart1', accessCode: 'ac_1' })),
		buildOrder: () => ({ refOrderId: 'AFSHFMKTcart1', foodCartItems: [{ id: 1 }], reference: 'must-not-be-sent', paymentResult: { x: 1 } }),
		startLegacy: jest.fn(),
		onBooked: jest.fn(),
		onCartRefresh: jest.fn(),
		canPay: () => true,
		...overrides
	};
	const hook = renderHook(() => useCheckoutIntentPay(props));
	return { props, ...hook };
}
const pay = (result) => act(async () => { await result.current.handlePay(); });
const lastPopup = () => PaystackPop.calls[PaystackPop.calls.length - 1];

beforeEach(() => {
	PaystackPop.calls.length = 0;
	jest.clearAllMocks();
	clearPendingPayment();
});

describe('useCheckoutIntentPay', () => {
	it('prices through the server, opens Paystack with the server\'s access code, and never sends a reference or a payment result of its own', async () => {
		confirmReplies({ status: 'BOOKED', orderId: 'o1' });
		const { props, result } = setup();
		await pay(result);
		expect(props.createIntentApi).toHaveBeenCalledWith({ cartSessionId: 'cart1', order: { refOrderId: 'AFSHFMKTcart1', foodCartItems: [{ id: 1 }] } });
		expect(lastPopup().code).toBe('ac_1');
		expect(props.startLegacy).not.toHaveBeenCalled();
	});

	it('after a successful payment it confirms, then places the order', async () => {
		confirmReplies({ status: 'PAID' }, { status: 'BOOKED', orderId: 'o1' });
		const { props, result } = setup();
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onSuccess({ reference: 'x' }); });
		expect(confirmCheckoutIntentApi).toHaveBeenCalledWith('AFSHCIFcart1');
		expect(props.onBooked).toHaveBeenCalledWith('o1');
		expect(result.current.payPhase).toBe('idle');
	});

	it('a CLOSED window is not proof of no payment: it asks the server, and a paid-but-closed payment still becomes an order (the 17 Nov "network error")', async () => {
		confirmReplies({ status: 'BOOKED', orderId: 'o9' });
		const { props, result } = setup();
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onCancel(); });
		expect(props.onBooked).toHaveBeenCalledWith('o9');
		expect(toast.info).not.toHaveBeenCalled();
	});

	it('a window closed WITHOUT paying says nothing scary and lets the customer pay again', async () => {
		confirmReplies({ status: 'WAITING' });
		const { props, result } = setup();
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onCancel(); });
		expect(props.onBooked).not.toHaveBeenCalled();
		expect(toast.info).not.toHaveBeenCalled();
		expect(result.current.payPhase).toBe('idle');
	});

	it('a second Pay opens the SAME transaction (same access code), never a new one', async () => {
		confirmReplies({ status: 'WAITING' });
		const props = { createIntentApi: jest.fn(() => intentReply({ action: 'REOPEN', reference: 'AFSHCIFcart1', accessCode: 'ac_1' })) };
		const { result } = setup(props);
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onCancel(); });
		await pay(result);
		expect(PaystackPop.calls.map((c) => c.code)).toEqual(['ac_1', 'ac_1']);
	});

	it('if Paystack already has the money, Pay never opens Paystack: it confirms and places the order', async () => {
		confirmReplies({ status: 'BOOKED', orderId: 'o2' });
		const { props, result } = setup({ createIntentApi: jest.fn(() => intentReply({ action: 'CONFIRMED', reference: 'AFSHCIFcart1' })) });
		await pay(result);
		expect(PaystackPop.calls).toHaveLength(0);
		expect(props.onBooked).toHaveBeenCalledWith('o2');
	});

	it('runs the old Pay flow only when the server says intents are not switched on', async () => {
		const notOn = Object.assign(new Error('404'), { response: { status: 404, data: { message: 'Checkout intents are not switched on.' } } });
		const { props, result } = setup({ createIntentApi: jest.fn(() => Promise.reject(notOn)) });
		await pay(result);
		expect(props.startLegacy).toHaveBeenCalledTimes(1);
		expect(PaystackPop.calls).toHaveLength(0);
	});

	it('a cart session that cannot pay again (409) refreshes the cart, shows the server\'s words, and opens nothing', async () => {
		const used = Object.assign(new Error('409'), { response: { status: 409, data: { message: 'Your cart changed after you started paying, so we refreshed it.' } } });
		const { props, result } = setup({ createIntentApi: jest.fn(() => Promise.reject(used)) });
		await pay(result);
		expect(props.onCartRefresh).toHaveBeenCalledTimes(1);
		expect(toast.error).toHaveBeenCalledWith('Your cart changed after you started paying, so we refreshed it.');
		expect(PaystackPop.calls).toHaveLength(0);
		expect(props.startLegacy).not.toHaveBeenCalled();
	});

	it('a server that is "confirming" (503) is shown, not turned into the old Pay flow, and the cart is not touched', async () => {
		const busy = Object.assign(new Error('503'), { response: { status: 503, data: { message: 'We are confirming your payment. Please wait a moment; do not pay again.' } } });
		const { props, result } = setup({ createIntentApi: jest.fn(() => Promise.reject(busy)) });
		await pay(result);
		expect(toast.error).toHaveBeenCalledWith('We are confirming your payment. Please wait a moment; do not pay again.');
		expect(props.onCartRefresh).not.toHaveBeenCalled();
		expect(props.startLegacy).not.toHaveBeenCalled();
		expect(result.current.payPhase).toBe('idle');
	});

	it('money there but no order yet is PENDING (do not pay again); an order that could not be placed is FAILED', async () => {
		confirmReplies({ status: 'PAID' });
		const a = setup();
		await pay(a.result);
		await act(async () => { await lastPopup().callbacks.onSuccess(); });
		expect(a.result.current.payPhase).toBe('pending');
		confirmReplies({ status: 'NEEDS_ATTENTION' });
		const b = setup();
		await pay(b.result);
		await act(async () => { await lastPopup().callbacks.onSuccess(); });
		expect(b.result.current.payPhase).toBe('failed');
		expect(b.result.current.payRef).toBe('AFSHCIFcart1');
	});

	it('does nothing when the form is not ready to pay', async () => {
		const { props, result } = setup({ canPay: () => false });
		await pay(result);
		expect(props.createIntentApi).not.toHaveBeenCalled();
	});

	it('a reload after paying resumes the confirming instead of showing a fresh Pay', async () => {
		confirmReplies({ status: 'BOOKED', orderId: 'o3' });
		savePendingPayment('cart1', 'AFSHCIFcart1');
		const { props } = setup();
		await waitFor(() => expect(props.onBooked).toHaveBeenCalledWith('o3'));
		expect(confirmCheckoutIntentApi).toHaveBeenCalledWith('AFSHCIFcart1');
	});

	it('a server that stays unreachable ends as UNSURE: no "payment was not completed" message, no new Pay, the reference is kept', async () => {
		confirmReplies(new Error('Network Error'));
		const { result } = setup();
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onSuccess(); });
		await waitFor(() => expect(result.current.payPhase).toBe('unsure'));
		expect(toast.info).not.toHaveBeenCalled();
		expect(result.current.payRef).toBe('AFSHCIFcart1');
	});

	it('PENDING is not a dead end: the page keeps checking and goes to the order the moment it exists', async () => {
		confirmReplies({ status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'PAID' }, { status: 'BOOKED', orderId: 'o9' });
		const { props, result } = setup();
		await pay(result);
		await act(async () => { await lastPopup().callbacks.onSuccess(); });
		await waitFor(() => expect(props.onBooked).toHaveBeenCalledWith('o9'), { timeout: 3000 });
		expect(result.current.payPhase).toBe('idle');
	});
});
