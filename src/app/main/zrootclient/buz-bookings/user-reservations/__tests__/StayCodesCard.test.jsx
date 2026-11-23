import { render, screen, fireEvent } from '@testing-library/react';
import StayCodesCard from '../StayCodesCard';

const paid = { isPaid: true, isCheckIn: false, isCheckOut: false, checkInCode: '7K2X4D', checkOutCode: 'L2VFJ8' };

describe('StayCodesCard', () => {
	it('keeps the code hidden until the guest asks for it, then shows it', () => {
		render(<StayCodesCard reservation={paid} />);
		expect(screen.queryByText('7K2X4D')).toBeNull();
		fireEvent.click(screen.getByText(/show my check-in code/i));
		expect(screen.getByText('7K2X4D')).toBeTruthy();
		fireEvent.click(screen.getByText('Hide'));
		expect(screen.queryByText('7K2X4D')).toBeNull();
	});

	it('asks for the check-out code after check-in', () => {
		render(<StayCodesCard reservation={{ ...paid, isCheckIn: true }} />);
		expect(screen.getByText(/show my check-out code/i)).toBeTruthy();
	});

	it('renders nothing when there is no code to give', () => {
		const { container } = render(<StayCodesCard reservation={{ ...paid, isPaid: false }} />);
		expect(container.firstChild).toBeNull();
	});
});
