import {
	addToUserFoodCartApi,
	calculateFoodCartShippingApi,
	createTableReservationApi,
	getEligibleTablesForOrderApi,
	getUserFoodCartApi,
	getUserFoodInvoicesAndItemsByIdEnpoint,
	getUserFoodInvoicesEnpoint,
	payAndPlaceFoodOrderApi,
	updateUserFoodCartApi
} from 'app/configs/data/client/RepositoryAuthClient';
import {
	getAllFoodMarts,
	getFoodMartMenuApi,
	getFoodMartSingleMenuItemApi,
	getMyFoodCartpi,
	getRcsFoodMartMenuItemsApi
} from 'app/configs/data/client/RepositoryClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

/**
 * Handles NestJS and generic API errors and displays appropriate toast messages.
 * Covers: validation arrays, single strings, nested error objects, network errors, fallback.
 *
 * @param {Error} error - The error object from the API call
 * @param {Object} options
 * @param {boolean} options.logError - Whether to log the error to console (default: true)
 * @param {string} options.fallbackMessage - Fallback message when no error message is found
 * @param {Function} options.onErrorCallback - Optional callback after error handling (e.g. rollback)
 */
const handleApiError = (error, options = {}) => {
	const {
		logError = true,
		fallbackMessage = 'An unexpected error occurred. Please try again.',
		onErrorCallback = null
	} = options;

	if (logError) {
		console.error('API Error:', error);
		console.error('Error Response:', error?.response?.data);
	}

	const errorData = error?.response?.data;
	const errorMessage = errorData?.message;

	// Case 1: Array of validation error messages (NestJS class-validator)
	if (Array.isArray(errorMessage)) {
		errorMessage.forEach((msg) => toast.error(msg));
		if (onErrorCallback) onErrorCallback();
		return;
	}

	// Case 2: Single string message
	if (typeof errorMessage === 'string') {
		toast.error(errorMessage);
		if (onErrorCallback) onErrorCallback();
		return;
	}

	// Case 3: Nested error object  { error: 'Bad Request', message: '...' }
	if (errorData?.error) {
		toast.error(`${errorData.error}: ${errorData.message || 'Unknown error'}`);
		if (onErrorCallback) onErrorCallback();
		return;
	}

	// Case 4: Network / timeout errors — keep technical detail out of the UI
	if (error?.message) {
		if (error.message.includes('Network Error') || error.message.includes('timeout')) {
			toast.error('Network error. Please check your connection and try again.');
			if (onErrorCallback) onErrorCallback();
			return;
		}

		toast.error(error.message);
		if (onErrorCallback) onErrorCallback();
		return;
	}

	// Case 5: Fallback
	toast.error(fallbackMessage);
	if (onErrorCallback) onErrorCallback();
};

/** *1) Get All FoodMart/RCS with filters */
export default function useGetAllFoodMarts(filters = {}) {
	return useQuery(['__foodmarts', filters], () => getAllFoodMarts(filters));
} // (Mcsvs => Done)

/** *2) Get single food-mart-SHOP/RCS */
export function useGetMartMenu(martId) {
	return useQuery(['__foodmartsMenu', martId], () => getFoodMartMenuApi(martId), {
		enabled: Boolean(martId)
	});
} // (Mcsvs => Done)

/** *get menu of single food-mart-SHOP/RCS-Listing */
export function useGetRCSMenuItems(martId) {
	return useQuery(['__foodmartRcsMenu', martId], () => getRcsFoodMartMenuItemsApi(martId), {
		enabled: Boolean(martId)
	});
} // (Mcsvs => Done)

export function useGetSingleMenuItem(rcsId, menuId) {
	return useQuery(['__menuitem', rcsId, menuId], () => getFoodMartSingleMenuItemApi(rcsId, menuId), {
		enabled: Boolean(rcsId, menuId)
	});
} // (Mcsvs => Done)

/** *
 * #######################################################################################
 * FOOD CART MANAGEMENT STARTS HERE
 * ###########################################################################################
 */
export function useGetMyFoodCart(userId) {
	if (!userId || userId === 'new') {
		return {};
	}

	return useQuery(['__foodcart'], getUserFoodCartApi);
} // (Mcsvs => Done)

/** *get my food cart by user credentials */
export function useGetMyFoodCartByUserCred(userId) {
	if (!userId || userId === 'new') {
		return {};
	}

	return useQuery(['__foodcart'], getMyFoodCartpi);
} // (Mcsvs => Done)

/** **Create add to foodcart */
export function useAddToFoodCart() {
	const queryClient = useQueryClient();

	return useMutation(
		(foodCartItem) => addToUserFoodCartApi(foodCartItem),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Added to cart successfully!');
					queryClient.invalidateQueries(['__foodcart']);
					queryClient.refetchQueries('__foodcart', { force: true });
				}
			},
			onError: (error, _variables, rollback) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to add item to cart. Please try again.',
					onErrorCallback: rollback
				});
			}
		}
	);
} // (Mcsvs => Done)

/** Live shipping estimate for the food-cart-review page — recalculated as the customer
 * picks/changes their destination. No global error toast: an unresolved route while the
 * user is still mid-selection isn't an error worth interrupting them for — the caller
 * shows an inline "unavailable" state instead (see FoodCartSummaryAndPay.jsx). */
export function useCalculateFoodCartShipping() {
	return useMutation((destinationData) => calculateFoodCartShippingApi(destinationData), {
		onError: (error) => {
			console.warn('Food shipping calculation failed:', error?.response?.data || error?.message);
		}
	});
}

/** Updated Food cart item quantity */
export function useUpdateFoodCartItemQty() {
	const queryClient = useQueryClient();

	return useMutation(
		(foodCartItem) => updateUserFoodCartApi(foodCartItem),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Cart updated successfully!');
					queryClient.invalidateQueries(['__foodcart']);
					queryClient.refetchQueries('__foodcart', { force: true });
				}
			},
			onError: (error, _variables, rollback) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to update cart quantity. Please try again.',
					onErrorCallback: rollback
				});
			}
		}
	);
} // (Mcsvs => Done)

/** *
 * #######################################################################################
 * FOOD CART MANAGEMENT ENDS HERE
 * ###########################################################################################
 * ------------------------------------------------------------------------------------------
 */

/** *
 * #################################################################
 * ORDER FOR FOOD MANAGEMENT STARTS HERE
 * #################################################################
 */

/** ***Pay and place food order */
export function usePayAndPlaceFoodOrder() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation(
		(orderData) => payAndPlaceFoodOrderApi(orderData),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Order placed successfully!');
					queryClient.invalidateQueries(['__foodcart']);
					queryClient.refetchQueries('__foodcart', { force: true });
					navigate(`/foodmarts/${data?.data?.order?.id || data?.data?.order?._id}/payment-success`);
				}
			},
			onError: (error, _variables, rollback) => {
				handleApiError(error, {
					fallbackMessage: 'Failed to place your order. Please try again.',
					onErrorCallback: rollback
				});
			}
		}
	);
} // (Mcsvs => Done)

/** *Get Authenticated user food-orders */
export function useGetAuthUserFoodOrders() {
	return useQuery(['__authuser_orders'], () => getUserFoodInvoicesEnpoint());
} // (Mcsvs => Done)

/** *Get Authenticated user food-orders and ITEMS */
export function useGetAuthUserFoodOrdersAndItems(foodOrderId) {
	if (!foodOrderId || foodOrderId === 'new') {
		return {};
	}

	return useQuery(
		['__authuser_orders_details', foodOrderId],
		() => getUserFoodInvoicesAndItemsByIdEnpoint(foodOrderId),
		{
			enabled: Boolean(foodOrderId)
		}
	);
} // (Mcsvs => Done)

/** *
 * #################################################################
 * TABLE RESERVATIONS (spend-gated by a paid food order)
 * #################################################################
 */

/** Which currently-available tables does this paid order's spend qualify for? */
export function useEligibleTablesForOrder(foodOrderId) {
	return useQuery(
		['__food_order_eligible_tables', foodOrderId],
		() => getEligibleTablesForOrderApi(foodOrderId),
		{ enabled: Boolean(foodOrderId) }
	);
}

/** Reserve one of those tables. */
export function useCreateTableReservation() {
	const queryClient = useQueryClient();
	return useMutation(createTableReservationApi, {
		onSuccess: (data, variables) => {
			if (data?.data?.success) {
				toast.success('Table reserved! We\'ll see you then.');
				queryClient.invalidateQueries(['__food_order_eligible_tables', variables?.triggeringOrderId]);
			}
		},
		onError: (error) => {
			handleApiError(error, { fallbackMessage: 'Failed to reserve this table. Please try again.' });
		}
	});
}

/** *
 * #################################################################
 * ORDER FOR FOOD MANAGEMENT ENDS HERE
 * #################################################################
 */
