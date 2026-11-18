import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
	cancelReservationApi,
	createUserReservations,
	createUserReservationsOnRoom,
	getInViewUseTripByListingId,
	getUseTripByReservationId,
	getUserCancelledTrips,
	getUserTrips,
	getUserSealedTrips,
	requestRefundForReservationApi,
	updateReservationOnMakingPayment
} from 'app/configs/data/client/RepositoryAuthClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getUserReservationsByListingId, getUserReservationsByRoomId } from 'app/configs/data/client/RepositoryClient';

/**
 * Handles NestJS and generic API errors and displays appropriate toast messages
 *
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Configuration options
 * @param {boolean} options.logError - Whether to log the error to console (default: true)
 * @param {string} options.fallbackMessage - Fallback message if no error message is found
 * @param {Function} options.onErrorCallback - Optional callback to execute after error handling (e.g., rollback)
 */
const handleApiError = (error, options = {}) => {
	const {
		logError = true,
		fallbackMessage = 'An unexpected error occurred. Please try again.',
		onErrorCallback = null
	} = options;

	// Log error for debugging
	if (logError) {
		console.error('API Error:', error);
		console.error('Error Response:', error?.response?.data);
	}

	// Extract error data from response
	const errorData = error?.response?.data;
	const errorMessage = errorData?.message;

	// Handle different error message formats
	if (errorMessage) {
		// Case 1: Array of error messages (NestJS validation errors)
		if (Array.isArray(errorMessage)) {
			errorMessage.forEach((msg) => {
				toast.error(msg);
			});

			if (onErrorCallback) onErrorCallback();

			return;
		}

		// Case 2: Single error message string
		if (typeof errorMessage === 'string') {
			toast.error(errorMessage);

			if (onErrorCallback) onErrorCallback();

			return;
		}
	}

	// Case 3: Handle error object with nested message
	if (errorData?.error) {
		toast.error(`${errorData.error}: ${errorData.message || 'Unknown error'}`);

		if (onErrorCallback) onErrorCallback();

		return;
	}

	// Case 4: Network or other errors
	if (error?.message) {
		// Don't show technical error messages to users, use fallback instead
		if (error.message.includes('Network Error') || error.message.includes('timeout')) {
			toast.error('Network error. Please check your connection and try again.');

			if (onErrorCallback) onErrorCallback();

			return;
		}

		toast.error(error.message);

		if (onErrorCallback) onErrorCallback();

		return;
	}

	// Case 5: Fallback for unknown errors
	toast.error(fallbackMessage);

	if (onErrorCallback) onErrorCallback();
};

/** *
 * ==========================================================================
 * BY AUTHENTICATED USERS
 * ==========================================================================
 */

/** ** 1) Create reservation : => Done for Africanshops */ // (Done => Msvs)
export function useCreateReservation() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	return useMutation(
		(newReservation) => {
			return createUserReservations(newReservation);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success && data?.data?.createdReservation) {
					toast.success('reservation  added successfully!');
					queryClient.invalidateQueries(['__reservationsById']);
					queryClient.refetchQueries('__reservationsById', { force: true });
					navigate(`/bookings/reservation/review/${data?.data?.createdReservation?.id}`);
				}
			},
			onError: (error, rollback) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to create reservation. Please try again.',
					onErrorCallback: rollback
				});
			}
		}
	);
} // (Done => Msvs)

/** ** 1.1) Create reservation On Room : => Done for Africanshops */ // (Done => Msvs)
export function useCreateReservationOnRoom() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	return useMutation(
		(newReservation) => {
			return createUserReservationsOnRoom(newReservation);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success && data?.data?.createdReservation) {
					toast.success('reservation  added successfully!');
					queryClient.invalidateQueries(['__reservationsById']);
					queryClient.refetchQueries('__reservationsById', { force: true });
					navigate(`/bookings/reservation/review/${data?.data?.createdReservation?.id}`);
				}
			},
			onError: (error, rollback) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to create room reservation. Please try again.',
					onErrorCallback: rollback
				});
			}
		}
	);
} // (Done => Msvs)

/** ** 2)GET_ All USER _TRIPS Get user : => Done for Africanshops */ // (Done => Msvs)
export function useUserTrips() {
	return useQuery(['__trips'], () => getUserTrips());
} // (Done => Msvs)

/** History: my finished (settled and sealed) reservations */
export function useUserSealedTrips() {
	return useQuery(['__sealedTrips'], () => getUserSealedTrips(), { staleTime: 15000 });
}

/** * 3) GET_USER_SINGLE_TRIP by servaevation_ID =>  Done for Africanshops */ // (Done => Msvs)
export function useGetUserSingleTrip(params) {
	return useQuery(['__tripById', params], () => getUseTripByReservationId(params), {
		enabled: Boolean(params)
		// staleTime: 2000,
	});
} // (Done => Msvs)

/** *** 4) GET_USER_ TRIP IN VIEW */
export function useGetUserTripsInView() {
	return useQuery(['__reservationsById'], () => getInViewUseTripByListingId());
}

/** ** 5) Update new reservation on payment */ // (Done => Msvs)
export function useReservationPaidUpdateMutation() {
	const navigate = useNavigate();

	return useMutation(
		(formData) => {
			return updateReservationOnMakingPayment(formData);
		},
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(`${data?.data?.message ? data?.data?.message : 'reservation added successfully!'}`);
					navigate(`/bookings/${data?.data?.payload?.id}/payment-success`);
				}
			},
			onError: (error) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to update reservation payment. Please try again.'
				});
			}
		}
	);
} // (Done => Msvs)

/** ======================================================================= */
/** *
 * BY AUTH AND GUEST USERS
 * ==============================================================
 */

//* *** 6) get single listing */
export function useGetReservations(params) {
	return useQuery(['__reservationsById', params], () => getUserReservationsByListingId(params), {
		enabled: Boolean(params)
	});
}

/** ** 6.1) get single room  getUserReservationsByRoomId */
export function useGetReservationsOnRoom(params) {
	return useQuery(['__reservationsByIdOnRoom', params], () => getUserReservationsByRoomId(params), {
		enabled: Boolean(params)
	});
} // (Done => Msvs)

/** ** 7) cancel reservation within 48hrs-window before check-in */
export function useCancelUserReservation() {
	const navigate = useNavigate();

	return useMutation(
		(formData) => {
			return cancelReservationApi(formData);
		},
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(
						`${data?.data?.message ? data?.data?.message : 'reservation canceled successfully!'}`
					);
					navigate(`/bookings/my-reservations`);
				} else if (!data?.data?.success) {
					toast.error(`${data?.data?.message ? data?.data?.message : data?.data?.error?.message}`);
				} else {
					toast.info('something unexpected happened');
				}
			},
			onError: (error) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to cancel reservation. Please try again or contact support.'
				});
			}
		}
	);
}

/** ** 8)GET_ All USER CANCELLED_RESERVATIONS/TRIPS */
export function useUserCancelledTrips() {
	return useQuery(['__cancelledtrips'], () => getUserCancelledTrips());
} // (Done => Msvs)

/** ** 9)Request Refund For cancelled reservation */
export function useRequestRefundForUserCancelledReservation() {
	const queryClient = useQueryClient();

	return useMutation(
		(formData) => {
			return requestRefundForReservationApi(formData);
		},
		{
			onSuccess: (data) => {
				console.log('Refund___Response', data);

				if (data?.data?.success) {
					toast.success(
						`${data?.data?.message ? data?.data?.message : 'refund request placed successfully!'}`
					);
					// navigate(`/bookings/my-reservations`)
					queryClient.invalidateQueries(['__cancelledtrips']);
				} else if (!data?.data?.success) {
					toast.error(`${data?.data?.message ? data?.data?.message : data?.data?.error?.message}`);
				} else {
					toast.info('something unexpected happened');
				}
			},
			onError: (error) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to request refund. Please try again or contact support.'
				});
			}
		}
	);
}
