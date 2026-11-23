import { stayCodeToShow, CHECK_IN, CHECK_OUT } from '../stayCodes';

const paid = { isPaid: true, isCheckIn: false, isCheckOut: false, checkInCode: '7K2X4D', checkOutCode: 'L2VFJ8' };

describe('stayCodeToShow', () => {
	it('shows the check-in code from payment until the guest is checked in', () => {
		expect(stayCodeToShow(paid)).toEqual({ kind: CHECK_IN, code: '7K2X4D' });
	});

	it('shows the check-out code once checked in, and never the check-in code again', () => {
		expect(stayCodeToShow({ ...paid, isCheckIn: true })).toEqual({ kind: CHECK_OUT, code: 'L2VFJ8' });
	});

	it('shows nothing once the guest has checked out', () => {
		expect(stayCodeToShow({ ...paid, isCheckIn: true, isCheckOut: true })).toBeNull();
	});

	it('shows nothing for an unpaid reservation, even if a code exists', () => {
		expect(stayCodeToShow({ ...paid, isPaid: false })).toBeNull();
	});

	it('shows nothing when the server sent no code or a blank one, and never throws on a missing reservation', () => {
		expect(stayCodeToShow({ ...paid, checkInCode: null })).toBeNull();
		expect(stayCodeToShow({ ...paid, checkInCode: '   ' })).toBeNull();
		expect(stayCodeToShow(undefined)).toBeNull();
	});
});
