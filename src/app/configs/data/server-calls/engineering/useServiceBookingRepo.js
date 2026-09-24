import {
	createServiceBookingApi,
	getMyServiceBookingsApi,
	getServiceBookingByIdApi,
	getRepairJobForBookingApi,
	cancelServiceBookingApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
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

/**
 * My Bookings (Phase E6d) — a customer's own bookings list/detail. `enabled`
 * defaults to true for MyBookingsPage (which redirects guests to /sign-in
 * on mount, same as MyMachinesPage) but MUST be passed false for any
 * component that can render for a logged-out guest — see the reload-loop
 * fix in useMyMachinesRepo.js for why an unconditional authenticated fetch
 * here is dangerous, not just wasteful.
 */
export function useGetMyServiceBookings(enabled = true) {
	return useQuery(['__myBookings'], () => getMyServiceBookingsApi(), {
		enabled,
		staleTime: 15000,
		onError: (error) => reportEngineeringApiError(error, 'Failed to fetch your bookings')
	});
}

/** *Get a single booking (own) */
export function useGetServiceBooking(bookingId) {
	return useQuery(['__myBooking', bookingId], () => getServiceBookingByIdApi(bookingId), {
		enabled: Boolean(bookingId),
		onError: (error) => reportEngineeringApiError(error, 'Failed to fetch this booking')
	});
}

/** *Get the repair job for a booking, once the shop has logged one (null until then) */
export function useGetRepairJobForBooking(bookingId) {
	return useQuery(['__repairJob', bookingId], () => getRepairJobForBookingApi(bookingId), {
		enabled: Boolean(bookingId),
		onError: (error) => reportEngineeringApiError(error, 'Failed to fetch the repair job')
	});
}

/** *Cancel one of the current user's own bookings */
export function useCancelServiceBooking() {
	const queryClient = useQueryClient();

	return useMutation(
		({ bookingId, cancellationReason }) => cancelServiceBookingApi(bookingId, cancellationReason),
		{
			onSuccess: (_response, variables) => {
				queryClient.invalidateQueries('__myBookings');
				queryClient.invalidateQueries(['__myBooking', variables.bookingId]);
				toast.success('Booking cancelled');
			},
			onError: (error) => reportEngineeringApiError(error, 'Failed to cancel booking')
		}
	);
}
