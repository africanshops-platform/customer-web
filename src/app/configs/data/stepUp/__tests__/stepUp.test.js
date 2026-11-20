import { CODE_LENGTH, STEP_UP_HEADER, fillDigits, isSixDigits, isValidLoginCode, registerStepUpHandler, requestStepUp, stepUpChallengeOf, stepUpErrorMessage } from '../stepUp';

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

describe('fillDigits (the six single-digit boxes)', () => {
	it('typing one digit sets that box and keeps the rest', () => {
		expect(fillDigits('', 0, '4')).toBe('4');
		expect(fillDigits('4', 1, '2')).toBe('42');
		expect(fillDigits('4263', 1, '9')).toBe('4963');
	});

	it('a pasted code fills every box from the first, whatever it contains around the digits', () => {
		expect(fillDigits('', 0, '123456')).toBe('123456');
		expect(fillDigits('', 0, ' 123 456 ')).toBe('123456');
		expect(fillDigits('99', 0, '123456')).toBe('123456');
		expect(fillDigits('', 0, '1234567890')).toBe('123456');
	});

	it('several digits arriving at one box (autofill) fill from that box onwards, never beyond six', () => {
		expect(fillDigits('12', 2, '3456')).toBe('123456');
		expect(fillDigits('1234', 4, '5678')).toBe('123456');
	});

	it('letters and symbols are dropped, and an empty input changes nothing', () => {
		expect(fillDigits('12', 2, 'ab-')).toBe('12');
		expect(fillDigits('12', 2, '')).toBe('12');
		expect(fillDigits('12', 2, null)).toBe('12');
		expect(fillDigits('1a2', 0, '')).toBe('12');
	});

	it('the length is six', () => {
		expect(CODE_LENGTH).toBe(6);
	});
});

describe('isValidLoginCode', () => {
	it('accepts a 6-digit app code or an 8-character backup code, nothing else', () => {
		['123456', ' 123456 ', 'A1B2C3D4', 'a1b2c3d4', '12345678'].forEach((v) => expect(isValidLoginCode(v)).toBe(true));
		['12345', '1234567', 'A1B2C3D', 'A1B2C3D45', '12-456', '', null, undefined].forEach((v) => expect(isValidLoginCode(v)).toBe(false));
	});
});
