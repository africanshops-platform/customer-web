/**
 * F30: the authenticator step-up, client side.
 *
 * When a payment needs a code, the gateway answers 403 { code: 'STEP_UP_REQUIRED', challengeId }. The shared API client asks this broker for
 * an approval (which opens the code dialog), then repeats the SAME request with the approved challenge in the `x-step-up-challenge` header.
 * The challenge is bound to that exact payment on the server, so it cannot approve a different one.
 */
export const STEP_UP_HEADER = 'x-step-up-challenge';

/** The challenge to approve, or null when this error is not a step-up request. */
export function stepUpChallengeOf(error) {
	const data = error?.response?.data;
	if (error?.response?.status !== 403 || data?.code !== 'STEP_UP_REQUIRED' || !data?.challengeId) return null;

	return { challengeId: String(data.challengeId), expiresInSeconds: Number(data.expiresInSeconds) || 300 };
}

/** Only a 6-digit authenticator code is accepted by the dialog. */
export const isSixDigits = (value) => /^\d{6}$/.test(String(value ?? '').trim());

/** A plain sentence for a failed approval, never the raw HTTP text. */
export function stepUpErrorMessage(error) {
	const status = error?.response?.status;
	const message = error?.response?.data?.message;

	if (status === 429) return 'Too many wrong codes. Wait a few minutes and try again.';
	if (status === 401 || status === 400) return typeof message === 'string' && message ? message : 'That code is not right. Check the app and try again.';
	if (status === 403 && error?.response?.data?.code === 'STEP_UP_INVALID') return 'This approval has expired. Close this and start the payment again.';

	return 'We could not check the code. Nothing was moved. Please try again.';
}

let handler = null;

/** The dialog registers itself here once; returns a function that removes it. */
export function registerStepUpHandler(fn) {
	handler = fn;

	return () => {
		if (handler === fn) handler = null;
	};
}

/** Resolves with the approved challenge id; rejects with { cancelled: true } when the person closes the dialog. */
export function requestStepUp(challenge) {
	if (!handler) return Promise.reject(Object.assign(new Error('No step-up dialog is mounted'), { cancelled: true }));

	return handler(challenge);
}
