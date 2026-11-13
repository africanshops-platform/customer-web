import { depositArrived, exactSendAmount, fundingErrorMessage, isIntentRouteMissing, legacyFundingReference, transferSaving } from '../fundingHelpers';

describe('fundingHelpers', () => {
	it('uses the gateway sentence, joins a list, never leaks the raw axios text', () => {
		expect(fundingErrorMessage({ response: { data: { message: 'Wallet funding is under maintenance.' } } })).toBe('Wallet funding is under maintenance.');
		expect(fundingErrorMessage({ response: { data: { message: ['a', 'b'] } } })).toBe('a. b');
		expect(fundingErrorMessage({ message: 'Request failed with status code 429' })).toBe('Something went wrong. Please try again.');
		expect(fundingErrorMessage(undefined, 'fallback')).toBe('fallback');
	});

	it('only a 404 means the backend has no intent route', () => {
		expect(isIntentRouteMissing({ response: { status: 404 } })).toBe(true);
		[400, 403, 409, 429, 500, 503].forEach((status) => expect(isIntentRouteMissing({ response: { status } })).toBe(false));
		expect(isIntentRouteMissing(new Error('Network Error'))).toBe(false);
	});

	it('legacy reference keeps its previous shape', () => {
		expect(legacyFundingReference('1234567890', 1700000000000)).toBe('AFSHFUND12345678901700000000000');
	});

	it('the saving is card charge minus transfer charge, never negative', () => {
		expect(transferSaving({ chargeKobo: 25889 }, { chargeKobo: 10607 })).toBe(15282);
		expect(transferSaving({ chargeKobo: 86803 }, { chargeKobo: 30500 })).toBe(56303);
		expect(transferSaving({ chargeKobo: 100 }, { chargeKobo: 500 })).toBe(0);
		expect(transferSaving(null, { chargeKobo: 1 })).toBe(0);
	});

	it('the exact send figure is plain naira with two decimals', () => {
		expect(exactSendAmount(505556)).toBe('5055.56');
		expect(exactSendAmount(1010607)).toBe('10106.07');
		expect(exactSendAmount(5030500)).toBe('50305.00');
	});

	it('a deposit has arrived only when the balance is above where it started', () => {
		expect(depositArrived(100, 100)).toBe(false);
		expect(depositArrived(100, 101)).toBe(true);
		expect(depositArrived(100, NaN)).toBe(false);
	});
});
