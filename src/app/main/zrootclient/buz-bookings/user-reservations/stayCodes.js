// The guest's check-in and check-out codes. They used to arrive only by email, so a mail outage left a paid guest unable to check in (found 23 Nov 2026:
// the provider accepted the booking mails and never delivered them). The server already returns both codes to the reservation's own guest, so the
// screen shows them: the check-in code from payment until the guest is checked in, the check-out code from check-in until check-out, nothing after.

export const CHECK_IN = 'check-in';
export const CHECK_OUT = 'check-out';

const clean = (code) => (typeof code === 'string' && code.trim() !== '' ? code.trim() : null);

/** The code the guest needs right now, or null (not paid, no code, or the stay is over). */
export function stayCodeToShow(reservation) {
	if (!reservation || !reservation.isPaid) return null;

	if (!reservation.isCheckIn) {
		const code = clean(reservation.checkInCode);

		return code ? { kind: CHECK_IN, code } : null;
	}

	if (!reservation.isCheckOut) {
		const code = clean(reservation.checkOutCode);

		return code ? { kind: CHECK_OUT, code } : null;
	}

	return null;
}

export const STAY_CODE_COPY = {
	[CHECK_IN]: {
		title: 'Your check-in code',
		hint: 'Give this code to the property when you arrive, never before. They enter it to check you in.'
	},
	[CHECK_OUT]: {
		title: 'Your check-out code',
		hint: 'Give this code to the property when you leave. They enter it to check you out.'
	}
};
