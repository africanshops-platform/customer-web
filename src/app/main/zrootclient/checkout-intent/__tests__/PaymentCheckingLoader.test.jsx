import { render, screen } from '@testing-library/react';
import PaymentCheckingLoader from '../PaymentCheckingLoader';

describe('PaymentCheckingLoader (the card-sized loading state while a payment is being confirmed)', () => {
	it('renders a status region with the title and subtitle it is given', () => {
		render(<PaymentCheckingLoader title="Confirming your payment..." subtitle="Please do not pay again" testId="x" />);
		const box = screen.getByTestId('x');
		expect(box).toHaveAttribute('role', 'status');
		expect(box).toHaveTextContent('Confirming your payment...');
		expect(box).toHaveTextContent('Please do not pay again');
	});

	it('has sensible words when given none', () => {
		render(<PaymentCheckingLoader />);
		expect(screen.getByTestId('pay-checking-loader')).toHaveTextContent('Confirming your payment...');
	});
});
