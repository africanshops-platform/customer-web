import { FEE_LABEL, feeKoboOfQuote, isQuotable, nairaText, payableKobo, payButtonLabel } from '../checkoutFee';

describe('checkoutFee', () => {
	it('reads the fee from a quote, and is 0 when there is none or the answer is unusable', () => {
		expect(feeKoboOfQuote({ chargeKobo: 16000 })).toBe(16000);
		expect(feeKoboOfQuote({ chargeKobo: 0 })).toBe(0);
		[undefined, null, {}, { chargeKobo: -5 }, { chargeKobo: 'abc' }, { chargeKobo: 10.5 }].forEach((q) => expect(feeKoboOfQuote(q)).toBe(0));
	});

	it('the payable total is the cart plus the fee, and a missing fee changes nothing', () => {
		expect(payableKobo(1000000, 16000)).toBe(1016000);
		expect(payableKobo(1000000, 0)).toBe(1000000);
		expect(payableKobo(1000000, undefined)).toBe(1000000);
	});

	it('shows whole naira without decimals and the rest with two', () => {
		expect(nairaText(1000000)).toBe('10,000');
		expect(nairaText(1025889)).toBe('10,258.89');
		expect(nairaText(16000)).toBe('160');
		expect(nairaText(undefined)).toBe('0');
	});

	it('only quotes a cart the server would accept', () => {
		expect(isQuotable(10000)).toBe(true);
		expect(isQuotable(9999)).toBe(false);
		expect(isQuotable(1000000.5)).toBe(false);
		expect(isQuotable(NaN)).toBe(false);
	});

	it('the line is always called Payment gateway fee', () => {
		expect(FEE_LABEL).toBe('Payment gateway fee');
	});

	it('the Pay button says what is happening, and its own text when nothing is', () => {
		expect(payButtonLabel('starting', 'Pay')).toBe('Starting your payment...');
		expect(payButtonLabel('confirming', 'Pay')).toBe('Confirming your payment...');
		expect(payButtonLabel('pending', 'Pay')).toBe('Checking your payment...');
		expect(payButtonLabel('unsure', 'Pay')).toBe('Checking your payment...');
		expect(payButtonLabel('idle', 'Pay ₦10')).toBe('Pay ₦10');
	});
});
