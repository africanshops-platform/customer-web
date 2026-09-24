import { createServiceBookingApi } from 'app/configs/data/client/RepositoryAuthClient';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import reportEngineeringApiError from './reportEngineeringApiError';

/**
 * Service bookings (Phase E6c) — a customer books a service against one of
 * their own registered machines, at a chosen shop, either at the shop
 * (AT_SHOP) or with the shop coming out to the machine (ON_SITE, e.g. a
 * roadside breakdown). ownerUserId is resolved server-side from the auth
 * token, never sent from the client.
 */
export function useCreateServiceBooking() {
	const queryClient = useQueryClient();

	return useMutation((formData) => createServiceBookingApi(formData), {
		onSuccess: () => {
			// '__myBookings' doesn't exist yet — reserved for Phase E6d's My
			// Bookings list, invalidated pre-emptively so that page needs no
			// changes here once it lands.
			queryClient.invalidateQueries('__myBookings');
			toast.success('Service booking requested! The shop will confirm it shortly.');
		},
		onError: (error) => reportEngineeringApiError(error, 'Failed to book a service')
	});
}
