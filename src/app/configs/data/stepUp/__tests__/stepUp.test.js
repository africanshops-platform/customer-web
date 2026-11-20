import { STEP_UP_HEADER, isSixDigits, registerStepUpHandler, requestStepUp, stepUpChallengeOf, stepUpErrorMessage } from '../stepUp';

const err = (status, data) => ({ response: { status, data } });

describe('stepUp', () => {
	it('recognises only a 403 STEP_UP_REQUIRED that carries a challenge', () => {
		expect(stepUpChallengeOf(err(403, { code: 'STEP_UP_REQUIRED', challengeId: 'c-1', expiresInSeconds: 300 }))).toEqual({ challengeId: 'c-1', expiresInSeconds: 300 });
		expect(stepUpChallengeOf(err(403, { code: 'STEP_UP_REQUIRED' }))).toBeNull();
		expect(stepUpChallengeOf(err(403, { code: 'TWO_FACTOR_SETUP_REQUIRED', challengeId: 'c-1' }))).toBeNull();
		expect(stepUpChallengeOf(err(401, { code: 'STEP_UP_REQUIRED', challengeId: 'c-1' }))).toBeNull();
		expect(stepUpChallengeOf(new Error('Network Error'))).toBeNull();
		expect(stepUpChallengeOf(undefined)).toBeNull();
	});

	it('defaults the lifetime to five minutes when the server did not say', () => {
		expect(stepUpChallengeOf(err(403, { code: 'STEP_UP_REQUIRED', challengeId: 'c-1' })).expiresInSeconds).toBe(300);
	});

	it('accepts exactly six digits', () => {
		expect(isSixDigits('123456')).toBe(true);
		expect(isSixDigits(' 123456 ')).toBe(true);
		['12345', '1234567', '12345a', '', null, undefined].forEach((v) => expect(isSixDigits(v)).toBe(false));
	});

	it('says what went wrong in plain words, and never the raw HTTP text', () => {
		expect(stepUpErrorMessage(err(429, {}))).toMatch(/Too many wrong codes/);
		expect(stepUpErrorMessage(err(401, { message: 'Invalid or expired TOTP code' }))).toBe('Invalid or expired TOTP code');
		expect(stepUpErrorMessage(err(401, {}))).toMatch(/not right/);
		expect(stepUpErrorMessage(err(403, { code: 'STEP_UP_INVALID' }))).toMatch(/expired/);
		expect(stepUpErrorMessage({ message: 'Request failed with status code 500' })).not.toMatch(/status code/);
	});

	it('uses the agreed header name', () => {
		expect(STEP_UP_HEADER).toBe('x-step-up-challenge');
	});

	it('hands the challenge to the registered dialog and returns what it approves; with no dialog it refuses as cancelled', async () => {
		await expect(requestStepUp({ challengeId: 'x' })).rejects.toMatchObject({ cancelled: true });
		const off = registerStepUpHandler(async (c) => c.challengeId);
		await expect(requestStepUp({ challengeId: 'c-9' })).resolves.toBe('c-9');
		off();
		await expect(requestStepUp({ challengeId: 'x' })).rejects.toMatchObject({ cancelled: true });
	});
});
