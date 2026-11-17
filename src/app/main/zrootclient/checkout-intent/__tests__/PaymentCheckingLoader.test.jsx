import { render, screen } from '@testing-library/react';
import PaymentCheckingLoader, { stepStates } from '../PaymentCheckingLoader';

describe('PaymentCheckingLoader (the card-sized state while a payment is followed to an order)', () => {
	it('says where the payment is: checking, received, placing, and shows no steps when the server cannot be reached (we do not know)', () => {
		const { rerender } = render(<PaymentCheckingLoader stage="checking" testId="x" />);
		expect(screen.getByTestId('x')).toHaveAttribute('role', 'status');
		expect(screen.getByTestId('x')).toHaveTextContent('Confirming your payment...');
		rerender(<PaymentCheckingLoader stage="received" testId="x" />);
		expect(screen.getByTestId('x')).toHaveTextContent('Payment received');
		rerender(<PaymentCheckingLoader stage="placing" testId="x" />);
		expect(screen.getByTestId('x')).toHaveTextContent('Placing your order...');
		rerender(<PaymentCheckingLoader stage="unsure" testId="x" />);
		expect(screen.getByTestId('x')).toHaveTextContent('Still checking your payment...');
		expect(screen.queryByTestId('x-steps')).toBeNull();
	});

	it('draws the three steps with the right one active', () => {
		expect(stepStates('checking')).toEqual(['active', 'todo', 'todo']);
		expect(stepStates('received')).toEqual(['done', 'active', 'todo']);
		expect(stepStates('placing')).toEqual(['done', 'active', 'todo']);
		expect(stepStates('unsure')).toBeNull();
		render(<PaymentCheckingLoader stage="placing" testId="y" />);
		const items = screen.getByTestId('y-steps').querySelectorAll('li');
		expect([...items].map((li) => li.getAttribute('data-state'))).toEqual(['done', 'active', 'todo']);
		expect(items[0]).toHaveTextContent('Payment received');
		expect(items[2]).toHaveTextContent('Order confirmed');
	});

	it('has sensible words when given none', () => {
		render(<PaymentCheckingLoader />);
		expect(screen.getByTestId('pay-checking-loader')).toHaveTextContent('Confirming your payment...');
	});
});
