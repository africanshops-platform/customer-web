import {
	verifyPaystackPaymentFromFintechService,
	getBookingsCheckoutReadiness,
	getMarketplaceCheckoutReadiness,
	getFoodCheckoutReadiness
} from 'app/configs/data/client/RepositoryAuthClient';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

/** **1) Verify payments made to company paystack from web and mobile platforms */

export function useVerifyPaystackPaymentMutation() {
	const navigate = useNavigate();
	return useMutation(
		(postPayload) => verifyPaystackPaymentFromFintechService(postPayload),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(`${data?.data?.message ? data?.data?.message : 'reservation added successfully!'}`);
					navigate(`/bookings/${data?.data?.payload?.id}/payment-success`);
				}
			},
			onError: (error) => {
				handleApiError(error);
			}
		}
	);
}

/**
 * **2) Pre-flight readiness checks — call right before enabling "Pay" on each
 * checkout type. The gateway caches its answer for ~10s, so polling here is
 * cheap; still keep the interval well above that so most polls hit cache.
 */
const READINESS_QUERY_OPTIONS = {
	refetchInterval: 15000,
	refetchOnWindowFocus: true,
	retry: 1,
	staleTime: 5000
};

export function useBookingsCheckoutReadiness(enabled = true) {
	return useQuery(['__checkoutReadiness', 'bookings'], () => getBookingsCheckoutReadiness(), {
		...READINESS_QUERY_OPTIONS,
		enabled,
		select: (res) => res?.data
	});
}

export function useMarketplaceCheckoutReadiness(enabled = true) {
	return useQuery(['__checkoutReadiness', 'marketplace'], () => getMarketplaceCheckoutReadiness(), {
		...READINESS_QUERY_OPTIONS,
		enabled,
		select: (res) => res?.data
	});
}

export function useFoodCheckoutReadiness(enabled = true) {
	return useQuery(['__checkoutReadiness', 'food'], () => getFoodCheckoutReadiness(), {
		...READINESS_QUERY_OPTIONS,
		enabled,
		select: (res) => res?.data
	});
}
