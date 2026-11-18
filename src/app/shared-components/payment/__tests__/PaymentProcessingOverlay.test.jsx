import { render, screen } from '@testing-library/react';
import PaymentProcessingOverlay from '../PaymentProcessingOverlay';

describe('PaymentProcessingOverlay (the full-screen cover while a card payment is confirmed)', () => {
	it('is closed unless told to open', () => {
		render(<PaymentProcessingOverlay />);
		// MUI keeps a closed Backdrop mounted but hidden
		const text = screen.queryByText('Processing Payment...');
		if (text) expect(text).not.toBeVisible();
	});

	it('without a stage it is exactly the hotel booking cover: no steps', () => {
		render(<PaymentProcessingOverlay open />);
		expect(screen.getByText('Processing Payment...')).toBeInTheDocument();
		expect(screen.getByText('Please wait while we verify your payment')).toBeInTheDocument();
		expect(screen.queryByTestId('pay-overlay-steps')).toBeNull();
	});

	it('with a stage (food and marketplace) it adds the three steps and says where the payment is', () => {
		const { rerender } = render(<PaymentProcessingOverlay open stage="checking" />);
		const states = () => [...screen.getByTestId('pay-overlay-steps').querySelectorAll('li')].map((li) => li.getAttribute('data-state'));
		expect(states()).toEqual(['active', 'todo', 'todo']);
		expect(screen.getByTestId('pay-overlay-title')).toHaveTextContent('Confirming your payment...');
		rerender(<PaymentProcessingOverlay open stage="received" />);
		expect(states()).toEqual(['done', 'active', 'todo']);
		expect(screen.getByTestId('pay-overlay-title')).toHaveTextContent('Payment received');
		rerender(<PaymentProcessingOverlay open stage="placing" />);
		expect(states()).toEqual(['done', 'active', 'todo']);
		expect(screen.getByTestId('pay-overlay-title')).toHaveTextContent('Placing your order...');
		expect(screen.getByText('Order confirmed')).toBeInTheDocument();
	});

	it('when the server cannot be reached it shows the words but no steps (we do not know where the payment is)', () => {
		render(<PaymentProcessingOverlay open stage="unsure" />);
		expect(screen.getByTestId('pay-overlay-title')).toHaveTextContent('Still checking your payment...');
		expect(screen.queryByTestId('pay-overlay-steps')).toBeNull();
	});
});
