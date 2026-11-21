import { apiErrorMessage, isLimitMessage, moneyErrorMessage } from '../apiErrorMessage';

const res = (data, status = 400) => ({ response: { status, data } });

describe('apiErrorMessage (a refusal shows its real reason)', () => {
	it('reads a plain string message', () => {
		expect(apiErrorMessage(res({ message: 'Amount exceeds your per-transaction limit of ₦10,000. Raise it in Settings (takes 24h to apply).' }), 'Transfer failed')).toMatch(/per-transaction limit of ₦10,000/);
	});

	it('reads a list (validation) and joins it', () => {
		expect(apiErrorMessage(res({ message: ['amount must not be less than 100', 'narration must be a string'] }), 'x')).toBe('amount must not be less than 100 narration must be a string');
	});

	it('reads a message nested in an object and an `error` string', () => {
		expect(apiErrorMessage(res({ message: { message: 'Account is frozen: review' } }), 'x')).toBe('Account is frozen: review');
		expect(apiErrorMessage(res({ error: 'Bad Request' }), 'x')).toBe('Bad Request');
	});

	it('uses the fallback only when nothing readable is there (including the raw axios text)', () => {
		expect(apiErrorMessage({ message: 'Request failed with status code 400' }, 'Transfer failed')).toBe('Transfer failed');
		expect(apiErrorMessage(undefined, 'Transfer failed')).toBe('Transfer failed');
		expect(apiErrorMessage(res({}), 'Transfer failed')).toBe('Transfer failed');
	});

	it('recognises limit messages', () => {
		expect(isLimitMessage('Amount exceeds your per-transaction limit of ₦10,000')).toBe(true);
		expect(isLimitMessage('Account is frozen')).toBe(false);
	});

	it('a limit refusal also says who can raise it (KYC) and an ordinary refusal is left alone', () => {
		expect(moneyErrorMessage(res({ message: 'Amount exceeds your per-transaction limit of ₦10,000.' }), 'Transfer failed')).toMatch(/identity verification \(KYC\)/);
		expect(moneyErrorMessage(res({ message: 'Account is frozen: review' }), 'Transfer failed')).toBe('Account is frozen: review');
	});
});
