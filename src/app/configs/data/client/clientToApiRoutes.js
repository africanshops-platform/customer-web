import axios from 'axios';
import Cookies from 'js-cookie';
// import { message } from 'antd'
import { resetSessionForShopUsers } from 'app/configs/utils/authUtils';
import { toast } from 'react-toastify';
import { getAdminAccessToken } from '../utils/opsUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_PROD; /** production & dev */

/** *================================================================================================================= */
export const customHeaders = {
	Accept: 'application/json'
};

export const baseUrl = `${API_BASE_URL}`;

export function Api() {
	// const TOKEN = JSON.parse(Cookies.get('authClientUserInfo')).accessToken;

	const Api = axios.create({
		baseURL: baseUrl,
		headers: customHeaders
	});

	return Api;
}

export function AuthApi() {
	// const TOKEN = JSON.parse(Cookies.get('authClientUserToken')); getAdminAccessToken
	// const { token } = getAuthAdminTokens()
	const token = getAdminAccessToken();

	const customHeaders = {
		Accept: 'application/json',
		withcredentials: true,
		headers: {
			// 'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		},
		credentials: 'include'
		// token: `Bearer ${TOKEN}`,
	};

	const Api = axios.create({
		/** ***********Previous for Here starts */
		baseURL: baseUrl,
		// headers: customHeaders,
		/** ***************Previous for Here starts  ends */

		// headers: { accesstoken: `${token}` },
		headers: { shoparccreed: `Bearer ${token}` }
	});

	Api.interceptors.response.use(
		(response) => response,
		(error) => {
			// if (error?.response?.status === 403) {
			//     // logOutUser();

			//     return Promise.reject({
			//         status: 401,
			//         errors: ['Unauthorized'],
			//     });
			// }

			if (error?.response?.status === 403) {
				const errors = Object.values(error?.response?.data?.errors || {});
				merchantLogOutCall();

				return Promise.reject({
					status: 403,
					errorsRaw: errors,
					errors: errors.reduce((error) => error)
				});
			}

			toast.error(
				error?.response && error?.response?.data?.message ? error?.response?.data?.message : error?.message
			);

			return Promise.reject({
				status: error.response?.status,
				errors: ['Oops!']
			});
		}
	);

	return Api;
}

export const adminSignIn = (formData) => {
	console.log('DATA_IN_FORM', formData);
	return Api().post(`/api/shop/login`, formData);
};

export const shopForgotPasswordInit = (formData) => {
	console.log('DATA_IN_FORM', formData);
	return Api().post(`/api/shop/forgot-password-withcode`, formData);
};

export const resetshopPasswordWithcode = (formData) => {
	console.log('RESETPASS_DATA_INTORM', formData);
	return Api().post(`/api/shop/reset-password-withcode`, formData);
};

export const logOutAdmin = () => {
	// Api().post(`${CONTROL_API_ENDPOINTS.ADMIN_LOGIN}`, formData);
	const ok = true;
	return ok;
};

/** ==============================================================|
 *   Shop authenticated settings start routes    
================================================================ */
export const authShopResetPasword = (formData) => AuthApi().put(`/api/shop/settings/reset-password`, formData);

export const authShopChangeEmail = (formData) => AuthApi().put(`/api/shop/settings/change-email`, formData);

export const authShopCloseAccountCall = () => AuthApi().post(`/api/shop/close-shop-account`);

/** ==============================================================|
 *   Shop authenticated settings start routes   
================================================================ */

/**
 * =============================================================
 * GUEST ROUTES AND CTIVITIES STARTS HERE
 * ==========================================================
 */

/** *Post categories */
export const getPostcats = () => Api().get('/postcats'); // done
// Posts
export const getBlogPosts = () => Api().get('/posts');
export const getBlogPostsById = (slug) => Api().get(`/posts/by/${slug}`);

// Tradehubs
export const getTradehubs = () => Api().get('/tradehubs');
export const getTradehubById = (id) => Api().get(`/tradehubs/${id}`);

// Country Routes
export const getCountries = () => Api().get('/buzcountries/operational'); // (Msvs => done)
export const getCountryDataById = (id) => Api().get(`/buzcountries/${id}`);

// State Routes
export const getBStates = () => Api().get('/buzstates');
export const getStateById = (id) => Api().get(`/buzstates/${id}/operational`); // (Msvs => done)

export const getStateByCountryId = (cid) => Api().get(`/buzstates/in-country/${cid}/operational`); // (Msvs => done)

// lgas Routes''
export const getBLgas = () => Api().get('/buz-lgas'); // done
export const getLgaById = (id) => Api().get(`/buz-lgas/${id}`); // done
export const getLgaByStateId = (sid) => Api().get(`/buz-lgas/in-state/${sid}/operational`); // (Msvs => done)

//= =======================================Market Routes starts
export const getAfMarkets = () => Api().get('/markets');
export const getMarketById = (id) => Api().get(`/markets/${id}`);
export const getMarketsByStateId = (id) => Api().get(`/markets/states/${id}`);
export const getMarketsByLgaId = (id) => Api().get(`/markets/in-state/${id}/operational`); //  (Mcsvs => Done)

//= =======================================Market Routes ends

/**
 * =============================================================
 * GUEST ROUTES AND CTIVITIES STARTS HERE
 * ==========================================================
 */
/** ================================================================================================================== */

/**
 * =============================================================
 * AUTH ROUTES AND ACTIVITIES STARTS HERE
 * ==========================================================
 */

// Product Categories Routes
export const getProdCats = () => AuthApi().get('/productcats');

export const getProdCatById = (id) => AuthApi().get(`/productcats/${id}`);

// Product Units Routes
export const getProdUnits = () => AuthApi().get('/productunits');
export const getProdUnitByShopPlan = (id) => Api().get(`/productunits/by-shopplan/${id}`);
export const getProdUnitById = (id) => AuthApi().get(`/productunits/${id}`);

// Product Shipping Weight Units Routes
export const getProdShippingWeightUnit = () => Api().get('/shippingweights');

// {===============================shop product handling starts=======================================}
export const storeProductImages = (formData) => AuthApi().post('/api/usersprodimages/uploadimages', formData);

export const removeProductImagesById = (formData) => AuthApi().post('/api/usersprodimages/removeimage', formData);

export const getShopProducts = () => AuthApi().get('/api/myshop/get-my-products'); // newDashboard

export const storeShopProduct = (formData) => AuthApi().post('/api/myshop/create-product', formData);

// export const getMyShopProductById = (id) =>
//   AuthApi().get(`/api/myshop-products/${id}`);
export const getMyShopProductById = (id) => AuthApi().get(`/api/myshop-products/${id}`);

export const updateMyShopProductById = (productFormData) =>
	AuthApi().put(`/api/myshop/update-product/${productFormData?._id}`, productFormData);

// pushing for export
export const pushMyShopProductByIdToExport = (productFormData) =>
	AuthApi().put(`/myshop/push-product-to-export/${productFormData}`);
// pulling product from export
export const pullMyShopProductByIdFromExport = (productFormData) =>
	AuthApi().put(`/myshop/pull-product-from-export/${productFormData}`);

export const deleteShopProductImage = (imageData) => {
	console.log('imageDataPayload', imageData);
	return AuthApi().delete(`/api/myshop/delete-product-image/${imageData?.id}/${imageData?.public_id}`);
};

export const deleteShopProduct = (id) => {
	console.log('productToDelete', id);
	return AuthApi().delete(`/api/myshop/delete-product/${id}`);
};

// {===============================shop product handling ends   =======================================}

// {===============================shop detals handling starts   =======================================}
export const getJustMyShopDetails = () => AuthApi().get('/api/myshop/get-just-details');

export const getMinimizedJustMyShopDetails = () => AuthApi().get('/api/myshop/get-minimized-just-details');

export const getJustMyShopDetailsAndPlan = () => AuthApi().get('/api/myshop/get-just-details/plan');

export const getMyShopDetails = () => AuthApi().get('/api/myshop/get-details'); //*

export const getMyOtherShopsList = () => AuthApi().get('/api/myshop/get-my-other-shops');

export const createMyShopBranch = (shopFormData) => AuthApi().post(`/api/myshop/create-branch`, shopFormData);

export const updateMyShopBranch = (shopFormData) =>
	AuthApi().put(`/api/myshop/update-branch/${shopFormData?._id}`, shopFormData); // newDashboard Not-done

export const updateMyShopDetails = (shopFormData) => AuthApi().put(`/api/myshop/update-details`, shopFormData); // newDashboard done /${shopFormData?._id}

export const deleteMyShopCompletely = (id, shopFormData) =>
	AuthApi().post(`/api/myshop/delete-myshop-completely/${id}`, shopFormData);

//= =====handle shop bank account updates and withdrawals id, /${id}
export const updateMyShopBankAccount = (shopFormData) =>
	AuthApi().put(`/api/myshop/update-finance-details`, shopFormData); // newDashboard done

export const updateMyShopBankAccountPin = (shopFormData) =>
	AuthApi().put(`/api/myshop/update-account-pin`, shopFormData); // newDashboard done

export const getMyShopWithdrawals = () => AuthApi().get('/api/myshop/get-my-Withdrawals'); // newDashboard done

/** *##########################################################################
 * Handle shop acoount tasks for separate "AACOUNT" model
 *############################################################################# */
export const getMyShopAccountApiDetails = () => AuthApi().get('/api/myshop/get-account-details'); // newDashboards //done
export const updateMyShopAccountBankDetails = (shopFormData) =>
	AuthApi().put(`/api/myshop/update-account-details`, shopFormData);

export const transferToWalletEndpoint = (productFormData) =>
	AuthApi().post('/api/myshop/transfer-funds-to-wallet', productFormData);

export const withdrawFromMyShopNow = (productFormData) =>
	AuthApi().post('/api/myshop/place-myshop-withdrawal', productFormData);

// {===============================user shop transferlogs handling starts=======================================}

// {===============================user shop transferlogs handling ends=======================================}
export const getMyShopTransactionsLogs = () => AuthApi().get('/api/myshop/get-myshop-transfertransactions');

// {===============================shop orders handling starts=======================================}
// user order Items Routes
export const GetShopOrderItems = () => AuthApi().get(`/api/myshop/get-my-orders`); // newDashboard

export const myShopOrderByShopId = (id) => AuthApi().get(`/api/myshop/find-one-order/${id}`); // newDashboard

export const GetShopItemsInOrders = () => AuthApi().get(`/api/myshop/items-in-orders`); // newDashboard

export const myShopItemsInOrdersByShopId = (id) => {
	// console.log('ID_TO_FIND1', id)

	return AuthApi().get(`/api/myshop/find-one-orderitems/${id}`); // newDashboard
};

export const MyShopCashOutOrderByOrderIdShopId = (id) => AuthApi().post(`/api/myshop/cashout-order/${id}`);

export const MyShopCashOutOrderItemsByOrderItemsIdShopId = (id) => {
	console.log('ItemToCashout ID', id);
	return AuthApi().post(`/api/myshop/cashout-order-items/${id}`);
};

/** ****HAndle SHop Point of Sale Activities below  myshop/create-invoiceorder */
export const GetShopPointOfSalesItems = () => AuthApi().get(`/api/myshop/get-sealed-invoiceorder`); // newDashboard
export const CreateShopPointOfSales = (invoiceFormData) =>
	AuthApi().post(`/api/myshop/create-invoiceorder`, invoiceFormData); // newDashboard

/**
 *
 * @returns HANDLE SHOP_PLANS
 */
// SHopPlans Routes
export const getShopPlans = () => Api().get('/shopplans'); // done
export const getShopPlanById = (id) => Api().get(`/shopplans/${id}`); // done

// {===============================shop orders handling ends =======================================}
// export const createProduct = (productFormData) =>
//   AuthApi().post('/usersproducts', productFormData);

/** **
 *
 * HANDLE MERCHANT UNBOADING STARTS
 */
export const newShopSignup = (formData) => Api().post('/api/pre-shop-signup', formData);
export const newShopSignupWithOtp = (formData) => Api().post('/api/pre-shop-signup/with-otp', formData);
// export const getAfPostById = (id) => Api().get(`/posts/${id}`);
export const storePreShopUserData = (formData) => Api().post('/api/register-preshop-user', formData);
export const storePreShopUserDataWithOtp = (formData) => Api().post('/api/register-preshop-user/with-otp', formData);

/** **
 *
 * HANDLE MERCHANT UNBOADING ENDS
 */

/** *
 * #############################################################################################
 * HANDLE SHOP ESTATE PRPERTIES STARTS HERE
 * ############################################################################################
 */
// {===============================shop estate property handling starts=======================================}
export const getShopEstateProperties = () => AuthApi().get('/api/myshop/get-my-estate-properties'); // newDashboard

export const storeShopEstateProperty = (formData) => AuthApi().post('/api/myshop/create-estate-property', formData);

export const getMyShopEstatePropertyBySlug = (id) => AuthApi().get(`/api/myshop-estateproperty/${id}`);

export const updateMyShopEstatePropertyById = (productFormData) =>
	AuthApi().put(`/api/myshop/update-estateproperty/${productFormData?._id}`, productFormData);

export const deleteShopEstateProperty = (id) => AuthApi().delete(`/myshop/delete-estateproperty/${id}`);
// {===============================shop estate handling ends   =======================================}
/** *
 * #############################################################################################
 * HANDLE SHOP ESTATE PRPERTIES ENDS HERE
 * ############################################################################################
 */

/** *
 * #############################################################################################
 * HANDLE SHOP HOMES, HOTELS and APARTMENT BOOKINGS STARTS HERE
 * ############################################################################################
 */
// {===============================shop estate property handling starts=======================================}
export const getShopBookingsProperties = () => AuthApi().get('/api/myshop/get-my-booking-properties'); // newDashboard

export const storeShopBookingsProperty = (formData) => AuthApi().post('/api/myshop/create-booking-property', formData);

export const getMyShopBookingsPropertyBySlug = (id) => AuthApi().get(`/api/myshop-bookingproperty/${id}`);

export const updateMyShopBookingsPropertyById = (productFormData) =>
	AuthApi().put(`/api/myshop/update-bookingproperty/${productFormData?._id}`, productFormData);

export const deleteShopBookingsProperty = (id) => AuthApi().delete(`/myshop/delete-bookingproperty/${id}`);
// {===============================shop estate handling ends   =======================================}
/** *
 * #############################################################################################
 * HANDLE SHOP HOMES, HOTELS and APARTMENT BOOKINGS ENDS HERE
 * ############################################################################################
 */

/** *
 * #############################################################################################
 * HANDLE SHOP FOOD MART STARTS HERE
 * ############################################################################################
 */
// {===============================shop estate property handling starts=======================================}
export const getShopFoodMarts = () => AuthApi().get('/api/myshop/food-mart/get-my-food-marts'); // newDashboard

export const storeShopFoodMart = (formData) => AuthApi().post('/api/myshop/food-mart/create-new-food-mart', formData);

export const getMyShopFoodMartBySlug = (slug) => AuthApi().get(`/api/myshop-foodmart/${slug}`);

export const updateMyShopFoodMartById = (productFormData) =>
	AuthApi().put(`/api/myshop/update-foodmart/${productFormData?._id}`, productFormData);

export const deleteShopFoodMart = (id) => AuthApi().delete(`/myshop/delete-foodmart/${id}`);
// {===============================shop estate handling ends   =======================================}
/** *
 * #############################################################################################
 * HANDLE SHOP FOOD MART ENDS HERE
 * ############################################################################################
 */

/** *
 * #############################################################################################
 * HANDLE SHOP FOOD MART-MENUS ITEMS STARTS HERE
 * ############################################################################################
 */
// {===============================shop estate property handling starts /myshop/food-mart/get-my-menu/:foodMartId=======================================}
export const getShopFoodMartMenus = (foodMartId) => AuthApi().get(`/api/myshop/food-mart/get-my-menu/${foodMartId}`); // newDashboard

export const getMyShopFoodMartMenuBySlug = (slug) => AuthApi().get(`/myshop/foodmart-menu/${slug}`);

export const storeShopFoodMartMenu = (formData) =>
	AuthApi().post(`/api/myshop/food-mart/create-menu/${formData?.martId}`, formData);

/** *
 * #############################################################################################
 * HANDLE SHOP FOOD  MART-MENUS ITEMS ENDS HERE
 * ############################################################################################
 */

/** *
 * #############################################################################################
 * HANDLE USER AUTHENTICATED SESSION STARTS HERE
 * ############################################################################################
 */
// Shop Users Logout functionality  usersproducts
export const MyShopLogOutSession = () => AuthApi().post(`/shop/logout`);
export const logOut = () => {
	if (typeof window !== 'undefined') {
		// remove logged in user's cookie and redirect to login page 'authUserCookie', state.user, 60 * 24
		// try {
		// AuthApi();
		MyShopLogOutSession()
			.then((response) => {
				console.log('logged out successfully', response);

				Cookies.remove('_auth');
				Cookies.remove('_auth_storage');
				Cookies.remove('_auth_state');
				Cookies.remove('AMD_AFSP_Show_Hide_tmp_Lead_ARC');
				Cookies.remove('SLG_GWPT_Show_Hide_tmp');

				window.location.reload();
			})
			.catch((error) => {
				console.log(
					error.response && error.response.data.message ? error.response.data.message : error.message
				);
			});
	}
};

export const merchantLogOutCall = () => {
	if (typeof window !== 'undefined') {
		// Cookies.set(
		//   'AMD_AFSP_Show_Hide_tmp_Lead_ARC',
		//   JSON.stringify(response?._nnip_shop_ASHP_ALOG),
		//   '1h'
		// );

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
