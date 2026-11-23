import { paymentSummary } from '../paymentSummary';

describe('paymentSummary', () => {
	it("works out the charge and the gateway fee from Paystack's amount (the 23 Nov 2026 order)", () => {
		expect(paymentSummary(124413, { amount: 12640914 })).toEqual({ chargedNaira: 126409.14, gatewayFeeNaira: 1996.14 });
	});
	it('shows no fee when the card was charged exactly the order total', () => {
		expect(paymentSummary(5000, { amount: 500000 })).toEqual({ chargedNaira: 5000, gatewayFeeNaira: 0 });
	});
	it('returns null with no usable amount, a charge below the order, or an implausible fee', () => {
		expect(paymentSummary(5000)).toBeNull();
		expect(paymentSummary(5000, { amount: 'abc' })).toBeNull();
		expect(paymentSummary(5000, { amount: 400000 })).toBeNull();
		expect(paymentSummary(5000, { amount: 700000 })).toBeNull();
		expect(paymentSummary(undefined, { amount: 500000 })).toBeNull();
	});
});
