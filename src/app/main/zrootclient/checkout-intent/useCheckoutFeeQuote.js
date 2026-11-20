import { useEffect, useState } from 'react';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { feeKoboOfQuote, isQuotable } from './checkoutFee';

/**
 * Asks the server what fee goes on top of this cart (F29 3.4). Waits for the cart to settle, never blocks paying when the answer cannot be had
 * (the server prices the charge itself, so a missing quote only means the page shows no fee line), and returns `isFetching` so Pay can wait for
 * the figure instead of showing a total that is about to change.
 */
export default function useCheckoutFeeQuote(cartKobo) {
	const [state, setState] = useState({ feeKobo: 0, isFetching: false });

	useEffect(() => {
		if (!isQuotable(cartKobo)) {
			setState({ feeKobo: 0, isFetching: false });

			return undefined;
		}

		let alive = true;

		setState((cur) => ({ ...cur, isFetching: true }));

		const timer = setTimeout(async () => {
			try {
				const res = await AuthApi().post('/fintech-accounts/user/fees/quote', { operation: 'CHECKOUT', amountKobo: cartKobo });
				const body = res?.data;

				if (alive) setState({ feeKobo: feeKoboOfQuote(body?.payload ?? body?.data ?? body), isFetching: false });
			} catch {
				if (alive) setState({ feeKobo: 0, isFetching: false });
			}
		}, 400);

		return () => {
			alive = false;
			clearTimeout(timer);
		};
	}, [cartKobo]);

	return state;
}
