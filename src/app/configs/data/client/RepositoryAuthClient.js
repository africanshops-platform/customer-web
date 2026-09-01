import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { resetSessionForShopUsers } from 'app/configs/utils/authUtils';
import { getAdminAccessToken } from '../utils/opsUtils';
import { API_ENDPOINTS } from './serverEndpoints/endpoints';
import jwtAuthConfig from 'src/app/auth/services/jwt/jwtAuthConfig';

// ─── Token-refresh state (module-level so all AuthApi() instances share it) ──
let isRefreshing = false;
let refreshQueue = [];

function drainQueue(error, token = null) {
	refreshQueue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
	refreshQueue = [];
}

async function doTokenRefresh() {
	const stored = localStorage.getItem(jwtAuthConfig.refreshTokenStorageKey);
	if (!stored) throw new Error('No refresh token stored');

	// Use a fresh instance so the global 401 interceptor does not race with this call.
	const refreshAxios = axios.create();
	const response = await refreshAxios.post(`${import.meta.env.VITE_API_BASE_URL_PROD}/auth-user/refresh-token`, {
		refreshToken: stored
	});

	const { userAccessToken, userRefreshToken } = response.data;
	if (!userAccessToken) throw new Error('Refresh response missing userAccessToken');

	localStorage.setItem(jwtAuthConfig.tokenStorageKey, userAccessToken);
	if (userRefreshToken) localStorage.setItem(jwtAuthConfig.refreshTokenStorageKey, userRefreshToken);

	return userAccessToken;
}

/**
 * ####MAIN ENDPOINTS STARTS
 */

/** ****Digital Ocean : Curent Production Main server starts */

const baseDomain = import.meta.env.VITE_API_BASE_URL_PROD; /** production & dev */

/** ****Digital Ocean : Curent Production Main server ends */
/**
 * ####MAIN ENDPOINTS ENDS
 */

export const baseUrl = `${baseDomain}`;

export const serializeQuery = (query) => {
	return Object.keys(query)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
		.join('&');
};

export function AuthApi() {
	const TOKEN = getAdminAccessToken();
	// console.log("FETCH-Token", TOKEN);

	const Api = axios.create({
		Accept: 'application/json',
		withcredentials: true,
		headers: {
			// 'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		/** ***********Previous for Here starts */
		baseURL: baseUrl,
		// headers: customHeaders,
		/** ***************Previous for Here starts  ends */
		// headers: { accesstoken_x_user: `Bearer ${TOKEN}` },  userauthcredential
		headers: { userauthcredential: `${TOKEN}` }
	});

	Api.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;

			if (error?.response?.status === 401) {
				// Already retried once → the refreshed token is also being rejected.
				// Stop here and log the user out to avoid an infinite loop.
				if (originalRequest._isRetry) {
					userLogOutCall();
					toast.error(
						error.response?.data?.message ?? 'Your session has expired. Please log in again.'
					);
					return Promise.reject(error);
				}

				originalRequest._isRetry = true;

				// Another request is already refreshing — queue this one.
				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						refreshQueue.push({ resolve, reject });
					}).then((token) => {
						originalRequest.headers.userauthcredential = token;
						return Api(originalRequest);
					});
				}

				isRefreshing = true;
				try {
					const newToken = await doTokenRefresh();
					isRefreshing = false;
					drainQueue(null, newToken);
					originalRequest.headers.userauthcredential = newToken;
					return Api(originalRequest);
				} catch (refreshError) {
					isRefreshing = false;
					drainQueue(refreshError);
					userLogOutCall();
					toast.error('Your session has expired. Please log in again.');
					return Promise.reject(refreshError);
				}
			}

			if (error?.response?.status === 403) {
				toast.error(
					error.response?.data?.message ?? 'Access denied. You do not have permission to perform this action.'
				);
				return Promise.reject(error);
			}

			return Promise.reject(error);
		}
	);

	return Api;
}

/** **********************************************************************************************
 * START: USER ACCOUNT/PROFILE SETTINGS OPERATIONS
 * Gateway endpoints for User account/profile settings functionality
 *********************************************************************************************** */

export const getApiAuthUser = () => AuthApi().get(`/auth-user/profile/get-details`); // Msvs => (Done)
export const getApiMinimizedAuthUser = () => AuthApi().get(`/users/minimized/authuser`);

export const clientUpdateUser = (formData) => {
	console.log('UPDATE_USER_FORMDATA', formData);
	return AuthApi().put(`/auth-user/profile/update`, formData);
}; // Msvs => (Done)

export const clientLoggedInResetPassword = (formData) => {
	console.log('resetUserPass_DATA'.formData);
	return AuthApi().put('/auth-user/loggedin/settings/change-password ', formData);
}; // Msvs => (Done)

export const clientLoggedInResetEmail = (formData) =>
	AuthApi().put('/auth-user/loggedin/settings/change-email/initiate ', formData);

export const clientComfirmActivateNewEmail = (formData) =>
	AuthApi().put('/auth-user/loggedin/settings/change-email/confirm ', formData);

export const closeUserAccount = (formData) => AuthApi().put('/auth-user/loggedin/settings/close-account ', formData);

/** **********************************************************************************************
 * END: USER ACCOUNT/PROFILE SETTINGS OPERATIONS
 *********************************************************************************************** */

// SHopPlans Routes
export const updateShopPlanById = (id, planFormData) => AuthApi().put(`/shopplans/${id}`, planFormData);

export const createApiShopPlan = (planFormData) => AuthApi().post('/shopplans', planFormData);

/**
 * ############################################################
 * @param {Market place Users Orders Routesstarts} FormData
 * @returns
 * ############################################################
 */
export const createApiOrder = (FormData) => AuthApi().post('/userorders', FormData);
// export const logOut = async () => {
//     // dispatch({ type: "LOGOUT" });
//     Cookies.remove('authClientUserInfo');
// };

export const getPlacedOrders = (id) => AuthApi().get(`/user-orders/order-item/${id}/view`); // (Done => Msvs)

export const onSuccessPlacedOrders = (id) => AuthApi().put(`/userorders/${id}`);

export const onENairaPlacedOrders = (id, shopFormData) => AuthApi().put(`/userorders/enairapay/${id}`, shopFormData);

export const onSuccessENairaPlacedOrdersPay = (id, shopFormData) =>
	AuthApi().put(`/userorders/successenairapay/${id}`, shopFormData);

export const getUserInvoices = () => AuthApi().get(`/user-orders/my-orders`); // (Msvs => Done)

export const cancelUserItemInInvoiceApi = (id) => {
	return AuthApi().put(`/userorders/${id}/cancel-orderitem`);
};

export const requestRefundOnUserItemInInvoiceApi = (id) => AuthApi().put(`/userorders/${id}/request-refund`);

/**
 * ############################################################
 * @param {Market place Users Orders Ends} FormData
 * @returns
 * ############################################################
 */

/** ***
 * #################################################################
 * DISPUTES (2026-08-12) — self-service, customer side.
 * #################################################################
 */

export const createDisputeApi = (dto) => AuthApi().post('/disputes', dto);

export const getMyDisputesApi = (params = {}) => {
	const query = serializeQuery(
		Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
	);
	return AuthApi().get(query ? `/disputes/my?${query}` : '/disputes/my');
};

export const getMyDisputeDetailApi = (disputeId) => AuthApi().get(`/disputes/${disputeId}`);

export const addMyDisputeNoteApi = (disputeId, note) => AuthApi().post(`/disputes/${disputeId}/note`, { note });

/**
 * ############################################################
 */

/** *****
 *                      FINTEC-PAYMENTS APP
 * #######################################################################################
 *  ACTIVITIES FOR ALL UTULIZING FINTEC-PAYMENTS_APP starts here
 * #######################################################################################
 */
/** *****
 * #######################################################################################
 *  ACTIVITIES FOR USERS UTILIZING FINTEC-PAYMENTS_APP ends here
 * #######################################################################################
 * --------------------------------------------------------------------------------------------------------------------
 */

/** *Verify Paystack Payment => For Bookings */
export const verifyPaystackPaymentFromFintechService = (formData) => {
	return AuthApi().post(`paystack-payment/verify`, formData);
}; // (Done => Msvs)

/** *Pre-flight check: are the services needed to complete this order type up? */
export const getBookingsCheckoutReadiness = () => {
	return AuthApi().get(`checkout-readiness/bookings`);
};

export const getMarketplaceCheckoutReadiness = () => {
	return AuthApi().get(`checkout-readiness/marketplace`);
};

export const getFoodCheckoutReadiness = () => {
	return AuthApi().get(`checkout-readiness/food`);
};

/** *****
 *                      BOOKINGS APP
 * #######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTULIZING BOOKINGS_APP starts here
 * #######################################################################################
 */

/** **Reservations */
/** *Create a new reervation => Done for africanshops */
export const createUserReservations = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.GET_RESERVATIONS_ROOT_ROUTE}/create-reservation-on-room`, formData);
};

export const createUserReservationsOnRoom = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.GET_RESERVATIONS_ROOT_ROUTE}/create-reservation-on-room`, formData);
}; // (Done => Msvs)

/** *Update a reservation on payment => Done for africanshops */
export const updateReservationOnMakingPayment = (formData) => {
	/// ${formData?.reservationToPay
	return AuthApi().post(`${API_ENDPOINTS.UPDATE_RESERVATIONS_ON_PAYMENT}`, formData);
};

export const listingReservationUpdateOnPayment = (reservationId, formData) => {
	return AuthApi().put(`${API_ENDPOINTS.UPDATE_RESERVATIONS_ON_PAYMENT}/${reservationId}`, formData);
};

/** *GET USERS-TRIPS  */
export const getUserTrips = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_USER_TRIPS}`);
}; // (Done => Msvs)

export const getUseTripByReservationId = (reservationId) => {
	return AuthApi().get(`${API_ENDPOINTS.GET_USER_SINGLE_TRIP}/${reservationId}`);
}; // (Done => Msvs)

export const cancelReservationApi = (formData) => {
	// console.log('Canceling reservation....1', formData?.reservationId);
	return AuthApi().put(`${API_ENDPOINTS.CANCEL_USER_RESERVATION}/${formData?.reservationId}`);
};

export const getUserCancelledTrips = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_USER_CANCELLED_TRIPS}`);
}; // (Done => Msvs)

export const requestRefundForReservationApi = (cancelledReservationId) => {
	return AuthApi().put(`/bookings/${cancelledReservationId}/request-refund`);
};

/** *inview/user-trip/:listingid */
export const getInViewUseTripByListingId = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_INVIEW_USER_TRIP}`);
};

/** *****
 * #######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTILIZING BOOKINGS_APP ends here
 * #######################################################################################
 * --------------------------------------------------------------------------------------------------------------------
 */
/** *****
 *                      FOOD MART APP
 * #######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTULIZING FOOD-MART_APP starts here
 * #######################################################################################
 */

export const getUserFoodCartApi = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_FOODCART}`);
};

/** *add a new food menu to FoodCart => Done for africanshops */
export const addToUserFoodCartApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.ADD_TO_FOODCART}`, formData);
};

export const updateUserFoodCartApi = (formData) => {
	return AuthApi().put(`${API_ENDPOINTS.UPDATE_FOODCART_QTY}`, formData);
};

/** Live shipping estimate for the food-cart-review page — server computes the real cost
 * from the authenticated user's actual food cart session, never a client-side guess. */
export const calculateFoodCartShippingApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.CALCULATE_FOOD_CART_SHIPPING}`, formData);
};

/**
 * MANAGE ORDER SECTION
 */

export const payAndPlaceFoodOrderApi = (formData) => {
	// console.log("food cart", formData);
	return AuthApi().post(`${API_ENDPOINTS.CREATE_FOOD_ORDER}`, formData);
}; // (Mcsvs => Done)

export const getUserFoodInvoicesEnpoint = () => AuthApi().get(`${API_ENDPOINTS.GET_USER_FOOD_ORDER_LIST}`); // (Mcsvs => Done)

export const getUserFoodInvoicesAndItemsByIdEnpoint = (foodOrderId) => {
	return AuthApi().get(`/rcs-food-orders/${foodOrderId}/view`);
};

/** *******#######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTULIZING FOOD-MART_APP ends here
 * #######################################################################################
 * --------------------------------------------------------------------------------------------------------
 */
/** *****
 *                      COMMODITY MARKETPLACE APP
 * #######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTULIZING MARKET-PLACE CART starts here
 * #######################################################################################
 */
/** *Get my cart */
export const getUserShoppingCart = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_MY_CART}`);
};
export const getUserShoppingCartForAuthAndGuest = () => {
	// console.log("USER_ID_CART___SESSION", userId)userId
	return AuthApi().get(`${API_ENDPOINTS.GET_MY_CART}`);
	/// ${userId}view-cart-session
}; // (Msvs => Done)

/** *add a new marketplace Cart => Done for africanshops */
export const addToUserCommodityCartApi = (formData) => {
	// console.log("food cart", formData);
	return AuthApi().post(`${API_ENDPOINTS.ADD_TO_CART}`, formData);
}; // (Msvs => Done)

/** Update-decrease commodity cart quantity */
export const updateCommodityCartQtyApi = (formData) => {
	// console.log("food cart", formData);
	return AuthApi().put(`${API_ENDPOINTS.UPDATE_CART_QTY}`, formData);
};
/** remove commodity from cart */
export const removeCommodityFromCartApi = (formData) => {
	// console.log("food cart", formData);
	return AuthApi().put(`${API_ENDPOINTS.REMOVE_CART_ITEM}`, formData);
};

/**
 * MANAGE ORDER SECTION
 */

export const payAndPlaceOrderApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.PAY_AND_PLACE_ORDER}`, formData);
};

/** Live shipping estimate for the cart-review page — server computes real per-shop
 * cost from the authenticated user's actual cart, never trust a client-side guess. */
export const calculateCartShippingApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.CALCULATE_CART_SHIPPING}`, formData);
};

/**
 * MANAGE USER WALLET
 * LOGIS
 */

export const getUserWalletAccountApiDetails = () => AuthApi().get('/users/accounts/get-account-details');

export const updateUserAccountBankDetails = (userAccountFormData) =>
	AuthApi().put(`/users/accounts/update-user-account`, userAccountFormData);

export const GenerateUserAccountBankDetails = () => AuthApi().post(`/users/accounts/generate-user-account`);

export const userWithdrawRequestApi = (withdrawFormData) =>
	AuthApi().post('/users/accounts/place-withdrawal', withdrawFormData);

// export const updateUserAccountBankDetails = (userAccountFormData) =>
// AuthApi().post(`/users/account/update-user-account`, userAccountFormData);
/** *****
 *                      FOOD MART APP
 * #######################################################################################
 * AUTHENTICATED ACTIVITIES FOR USERS UTULIZING MARKET-PLACE CART  ends here
 * #######################################################################################
 * --------------------------------------------------------------------------------------------------------------------
 */

/** List this user's active sessions/devices — GET /auth-user/sessions */
export const getSessionsApi = () => AuthApi().get('/auth-user/sessions');

/** Revoke a specific session on the server — DELETE /auth-user/sessions/:sessionId */
export const revokeSessionApi = (sessionId) => AuthApi().delete(`/auth-user/sessions/${sessionId}`);

/** Generate (or fetch, if already set) this user's own referral code + links — GET /auth-user/loggedin/referral-links */
export const getUserReferralLinksApi = () => AuthApi().get('/auth-user/loggedin/referral-links');

/** Revoke every other session, keeping the current one — DELETE /auth-user/sessions/all */
export const revokeAllSessionsApi = () => AuthApi().delete('/auth-user/sessions/all');

// Users Logout functionality  usersproducts
export const logOut = () => {
	if (typeof window !== 'undefined') {
		// remove logged in user's cookie and redirect to login page 'authUserCookie', state.user, 60 * 24
		try {
			AuthApi()
				.post(`/logout`)
				.then((response) => {});

			window.location.reload();
		} catch (error) {
			console.log(
				'SereverError',
				error?.response && error?.response?.data?.message ? error?.response?.data?.message : error?.message
			);
		}

		Cookies.remove('authClientUserToken');
		Cookies.remove('authClientUserInfo');
		localStorage.removeItem('authClientUserInfo');
		localStorage.clear();
	}
};

/** **Main user logout logic */
export const userLogOutCall = () => {
	if (typeof window !== 'undefined') {
		try {
			/** Fuse admin starts */
			resetSessionForShopUsers();

			Cookies.remove('marketplace_jwt_auth_credentials');
			/** *Fuse admin ends */

			Cookies.remove('authUserInfo');
			Cookies.remove('isloggedin');
			Cookies.remove('_auth');
			Cookies.remove('_auth_state');
			Cookies.remove('_auth_type');
			Cookies.remove('_auth_storage');
			Cookies.remove('_ga');
			Cookies.remove('_ga_WJH9CH067R');
			Cookies.remove('SLG_G_WPT_TO');
			Cookies.remove('ADMIN_AFSP_Show_Hide_tmp_Lead');
			Cookies.remove('ADMIN_AFSP_Show_Hide_tmp_Lead_ARC');

			localStorage.removeItem('marketplace_jwt_auth_credentials');
			localStorage.clear();

			// Cookies.set(
			//   'ADMIN_AFSP_Show_Hide_tmp_Lead',
			//   JSON.stringify(response?.data?.accessToken),
			//   '1h'
			// );

			// window.location.reload(false);
		} catch (error) {
			console.log(error);
		}
	}
};

/**
 * ############################################################
 * @param {Inspection Schedules Routes starts} FormData
 * @returns
 * ############################################################
 */

/** *Create Inspection Schedule */
export const createInspectionScheduleApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.CREATE_INSPECTION_SCHEDULE}`, formData);
};

/** *View My Inspection Schedules */
export const getMyInspectionSchedulesApi = () => {
	return AuthApi().get(`${API_ENDPOINTS.GET_MY_INSPECTION_SCHEDULES}`);
};

/** *View My Inspection Schedules on Calendar */
export const getMyInspectionSchedulesOnCalendarApi = (startDate, endDate) => {
	const params = new URLSearchParams();

	if (startDate) params.append('startDate', startDate);

	if (endDate) params.append('endDate', endDate);

	return AuthApi().get(`${API_ENDPOINTS.GET_MY_INSPECTION_SCHEDULES_CALENDAR}?${params.toString()}`);
};

/** *Cancel Inspection Schedule */
export const cancelInspectionScheduleApi = (scheduleId, reason) => {
	return AuthApi().delete(`${API_ENDPOINTS.CANCEL_INSPECTION_SCHEDULE}/${scheduleId}`, {
		data: { reason }
	});
};

/** *Reschedule Inspection */
export const rescheduleInspectionApi = (scheduleId, formData) => {
	return AuthApi().put(`${API_ENDPOINTS.RESCHEDULE_INSPECTION}/${scheduleId}`, formData);
};

/**
 * ############################################################
 * @param {Inspection Schedules Routes ends} FormData
 * @returns
 * ############################################################
 */

/**
 * ############################################################
 * @param {Realestate Offers Routes starts} FormData
 * @returns
 * ############################################################
 */

/** *Create Property Offer/Bid */
export const createPropertyOfferApi = (formData) => {
	return AuthApi().post(`${API_ENDPOINTS.CREATE_PROPERTY_OFFER}`, formData);
};

/** *View All User Offers with Pagination */
export const getMyOffersApi = (page = 1, limit = 10) => {
	return AuthApi().get(`${API_ENDPOINTS.GET_MY_OFFERS}?page=${page}&limit=${limit}`);
};

/** *Upgrade/Update Offer Bid */
export const updateOfferBidApi = (offerId, formData) => {
	return AuthApi().put(`${API_ENDPOINTS.UPDATE_OFFER_BID}/${offerId}`, formData);
};

/** *Withdraw Offer */
export const withdrawOfferApi = (offerId) => {
	return AuthApi().delete(`${API_ENDPOINTS.WITHDRAW_OFFER}/${offerId}`);
};

/** *Upload a supporting document/photo for an offer (base64 data URI in, Cloudinary url out) */
export const uploadOfferAttachmentApi = (base64) => {
	return AuthApi().post(`${API_ENDPOINTS.UPLOAD_OFFER_ATTACHMENT}`, { base64 });
};

/**
 * ############################################################
 * @param {Realestate Offers Routes ends} FormData
 * @returns
 * ############################################################
 */

/**
 * ############################################################
 * @param {User Addresses CRUD Routes starts} FormData
 * @returns
 * ############################################################
 */

/** *Create User Address */
export const createUserAddressApi = (formData) => {
	return AuthApi().post(`/auth-user/addresses`, formData);
};

/** *Get All User Addresses */
export const getUserAddressesApi = () => {
	return AuthApi().get(`/auth-user/addresses`);
};

/** *Get Single Address */
export const getSingleUserAddressApi = (addressId) => {
	return AuthApi().get(`/auth-user/addresses/${addressId}`);
};

/** *Update User Address */
export const updateUserAddressApi = (addressId, formData) => {
	return AuthApi().put(`/auth-user/addresses/${addressId}`, formData);
};

/** *Delete User Address */
export const deleteUserAddressApi = (addressId) => {
	return AuthApi().delete(`/auth-user/addresses/${addressId}`);
};

/** *Set Default Address */
export const setDefaultUserAddressApi = (addressId) => {
	return AuthApi().put(`/auth-user/addresses/${addressId}/set-default`);
};

/**
 * ############################################################
 * @param {User Addresses CRUD Routes ends} FormData
 * @returns
 * ############################################################
 */
