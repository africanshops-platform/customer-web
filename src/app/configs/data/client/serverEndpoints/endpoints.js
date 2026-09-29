export const API_ENDPOINTS = {
	USER_LOGIN: '/user/login',
	USER_REGISTER: '/user/register',
	USER_ACTIVATION: '/user/activate-user',
	USER_FORGOT_PASSWORD: '/user/forgot-password',

	USER_RESET_PASSWORD_WITHCODE: '/user/reset-password-withcode',
	USER_RESET_PASSWORD: '/user/reset-password',
	USER_LOGOUT: 'admin/logout',
	ATTRIBUTES: 'attributes',

	/**
	 * auth pages
	 */

	/** *UNAUTHENTICATED REQUESTS */
	LIST_ALL_PROPERTIES: '/listing',

	/** *Program service types */
	LIST_ALL_PROGRAMTYPES: '/sevice-type',

	/** *Property service types */
	LIST_ALL_PROPERTYTYPES: '/property-type',

	/** *AUTHENTICATED REQUESTS BELOW HERE */
	/** Chariz my propert */
	CHARIZ_A_PROPERTY: '/listing/chariz-my-property',
	CHARIZ_VENDORS_GET_PROPERTIES: '/listing/managers/properties',
	GET_CHARIZ_VENDORS_GET_PROPERTIES: '/vendorlisting/get/listings',

	LIKE_A_PROPERTY: '/user/favorite-list',
	UNLIKE_A_PROPERTY: '/user/unfavorite-list',

	/** creatinf reservertion on a properties */
	RESERVE_A_PROPERTY: '/bookings/listing/reserve-a-stay',

	/** Get Reservations of Vendors */
	GET_RESERVATIONS: '/bookings*/listing/get-reservations',
	GET_RESERVATIONS_BY_LISTING_ID: '/reservations', // (Done => Msvs)
	GET_RESERVATIONS_ROOT_ROUTE: '/reservations', // (Done => Msvs)

	// Managing Users-booked trips and reservations  get-listing-reservations/:id
	GET_MY_TRIPS_BY: '/listing/get-mytrips',

	GET_USER_TRIPS: '/reservations/get-user-reservations', // (Done => Msvs)
	GET_USER_CANCELLED_TRIPS: '/reservations/get-my-cancelled-reservations', // (Done => Msvs)
	GET_USER_SINGLE_TRIP: '/reservations/get-reservation', // (Done => Msvs)
	GET_INVIEW_USER_TRIP: '/inview/user-trip',

	UPDATE_RESERVATIONS_ON_PAYMENT: '/reservations/update-reservation-on-payment', // (Done => Msvs)
	CANCEL_USER_RESERVATION: '/reservations/cancel-reservation',

	/** ****
	 * ############FOOD MART APP SERVER_URLs Start Here##############
	 */
	/** Add to food mart */
	GET_FOODCART: '/rcs-cart-session', // (Done => Msvs)
	ADD_TO_FOODCART: '/rcs-cart-session/add-to-cart', // (Done => Msvs)
	UPDATE_FOODCART_QTY: '/rcs-cart-session/update-cart-item', // (Done => Msvs)

	CREATE_FOOD_ORDER: '/paystack-payment/verify-and-create-rcs-order', // (Done => Msvs)
	CALCULATE_FOOD_CART_SHIPPING: '/buzshipping/calculate-food-cart', // (Done => Msvs)

	GET_USER_FOOD_ORDER_LIST: '/rcs-food-orders', // (Done => Msvs)
	/** ****
	 * ########################FOOD MART APP SERVER_URLs EDNs Here===========
	 * ----------------------------------------------------------------------------------------------
	 */

	/** ****
	 * ############FOOD MART APP SERVER_URLs Start Here##############
	 */
	/** Add to commodity mart */
	GET_MY_CART: '/cart-session', // (Msvs => Done)
	ADD_TO_CART: '/cart-session/add-to-cart', // (Msvs => Done)
	UPDATE_CART_QTY: '/cart-session/update-cart-item',
	REMOVE_CART_ITEM: '/cart/remove-item',

	PAY_AND_PLACE_ORDER: '/paystack-payment/verify-and-create-marketplace-order', // (Msvs => Done)
	CALCULATE_CART_SHIPPING: '/buzshipping/calculate-cart', // (Msvs => Done)
	/** ****
	 * ########################FOOD MART APP SERVER_URLs EDNs Here===========
	 * ----------------------------------------------------------------------------------------------
	 */

	/** Wishlist + Product Reviews (2026-09-27, customer-10/customer-9) */
	GET_MY_WISHLIST: '/wishlist',
	CREATE_PRODUCT_REVIEW: '/reviews',

	/** ****
	 * ############INSPECTION SCHEDULES APP SERVER_URLs Start Here##############
	 */
	CREATE_INSPECTION_SCHEDULE: '/inspection-schedules/create',
	GET_MY_INSPECTION_SCHEDULES: '/inspection-schedules/my-schedules',
	GET_MY_INSPECTION_SCHEDULES_CALENDAR: '/inspection-schedules/my-calendar',
	CANCEL_INSPECTION_SCHEDULE: '/inspection-schedules/cancel',
	RESCHEDULE_INSPECTION: '/inspection-schedules/reschedule',
	/** ****
	 * ########################INSPECTION SCHEDULES APP SERVER_URLs ENDs Here===========
	 * ----------------------------------------------------------------------------------------------
	 */

	/** ****
	 * ############REALESTATE OFFERS APP SERVER_URLs Start Here##############
	 */
	CREATE_PROPERTY_OFFER: '/realestate-offers/create',
	GET_MY_OFFERS: '/realestate-offers/my-offers',
	UPDATE_OFFER_BID: '/realestate-offers/update',
	WITHDRAW_OFFER: '/realestate-offers/withdraw',
	UPLOAD_OFFER_ATTACHMENT: '/realestate-offers/upload-attachment'
	/** ****
	 * ########################REALESTATE OFFERS APP SERVER_URLs ENDs Here===========
	 * ----------------------------------------------------------------------------------------------
	 */
};
