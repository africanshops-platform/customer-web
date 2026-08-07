import Cookie from 'js-cookie';
import {
	RESOURCE_AUTH_CRED,
	AUTH_RESOURCE_TOKEN,
	RESOURCE_ACTIVATE_CRED,
	FORGOT_PASS_CREDENTIALS,
	MERCHANT_SIGUP_CREDENTIALS,
	RESEND_MERCHANT_SIGUP_OTP,
	LOGGEDIN_RESET_MAIL_CREDENTIALS
} from '../constants';
// import { UerData } from '@/types/types'
// import { CLIENT_ENDPOINTS } from '../dataService/data/clientEndpoints' setShopForgotPasswordPAYLOAD

/**
 *#######################################################################################################
 * @param context SET COOKIES___PARSED__DATAS starts here
 * @returns
 * #####################################################################################################
 */
export function setAuthCredentials(user) {
	Cookie.set(RESOURCE_AUTH_CRED, JSON.stringify({ user }));
} // done

export function setAuthTokens(token) {
	Cookie.set(AUTH_RESOURCE_TOKEN, JSON.stringify({ token }));
} // done

export function setShopForgotPasswordPAYLOAD(userActivationToken) {
	Cookie.set(FORGOT_PASS_CREDENTIALS, JSON.stringify(userActivationToken));
} // done

export function setShopResetMailPAYLOAD(userActivationToken) {
	Cookie.set(LOGGEDIN_RESET_MAIL_CREDENTIALS, JSON.stringify(userActivationToken));
} // done

/** ******COokies Stters up above */

export function setActivateUserPAYLOAD(userActivationToken) {
	// , role: any
	// , role
	Cookie.set(RESOURCE_ACTIVATE_CRED, JSON.stringify(userActivationToken));
}

export function setForgotPasswordPAYLOAD(userActivationToken) {
	// , role: any
	// , role
	Cookie.set(FORGOT_PASS_CREDENTIALS, JSON.stringify(userActivationToken));
}

/** Set coockie for merchant sign-up */
export function setMerchantSignUpStorage(merchantActivationToken) {
	Cookie.set(MERCHANT_SIGUP_CREDENTIALS, JSON.stringify(merchantActivationToken));
}

/** *set coockie to store merchant formData for resending OTP if timer expires */
export function setResendMerchantSignUpOtp(merchantClientData) {
	Cookie.set(RESEND_MERCHANT_SIGUP_OTP, JSON.stringify(merchantClientData));
}
/**
 *#######################################################################################################
 * @param context SET COOKIES___PARSED__DATAS ends here
 * @returns
 * #####################################################################################################
 * ====================================================================================================
 */

/**
 *#######################################################################################################
 * @param context GET COOKIES___PARSED__DATAS starts here
 * @returns
 * #####################################################################################################
 */

export function getAuthAdminCredentials() {
	let authCred;
	authCred = Cookie.get(RESOURCE_AUTH_CRED);

	if (authCred) {
		return JSON.parse(authCred);
	}

	return { user: null };
}

export function getAuthAdminTokens() {
	let authTokenCred;
	authTokenCred = Cookie.get(AUTH_RESOURCE_TOKEN);

	if (authTokenCred) {
		return JSON.parse(authTokenCred);
	}

	return { token: null };
}

export function get_ACTIVATION_USER_TOKEN() {
	let activationTokenCred;
	activationTokenCred = Cookie.get(RESOURCE_ACTIVATE_CRED);

	if (activationTokenCred) {
		return JSON.parse(activationTokenCred);
	}

	return { activationToken: null };
}

export function get_SHOP_FORGOTPASS_TOKEN() {
	let activationTokenCred;
	activationTokenCred = Cookie.get(FORGOT_PASS_CREDENTIALS);

	if (activationTokenCred) {
		return JSON.parse(activationTokenCred);
	}

	return { activationToken: null };
}

export function getMerchantSignUpToken() {
	// Cookie.get(MERCHANT_SIGUP_CREDENTIALS, JSON.parse(merchantActivationToken))
	let merchantSignUpTokenCred;
	merchantSignUpTokenCred = Cookie.get(MERCHANT_SIGUP_CREDENTIALS);

	if (merchantSignUpTokenCred) {
		return JSON.parse(merchantSignUpTokenCred);
	}

	return { merchantActivationToken: null };
}

/** *get coockie to store merchant formData for resending OTP if timer expires setResendMerchantSignUpOtp */
export function getResendMerchantSignUpOtp() {
	let merchantSignResendData;
	merchantSignResendData = Cookie.get(RESEND_MERCHANT_SIGUP_OTP);

	if (merchantSignResendData) {
		return JSON.parse(merchantSignResendData);
	}

	return { merchantClientData: null };
}
/**
 *#######################################################################################################
 * @param context GET COOKIES___PARSED__DATAS ends here
 * @returns
 * #####################################################################################################
 * ==========================================================================================================
 */

/**
 *#####################################################################################################################
 * @param context REMOVE COOKIES___PARSED__DATAS start here
 * @returns
 * ########################################################################################################################
 */

/** **REMOVE SPECIFIC COOKIES */
export function remove_SHOP_FORGOTPASS_TOKEN() {
	Cookie.remove('_FORGOT_SPLAWED_USER_DATA');
	Cookie.remove(FORGOT_PASS_CREDENTIALS);
}

export function logOutRoutHandler() {
	// const router = useRouter()

	Cookie.remove(RESOURCE_AUTH_CRED);
	Cookie.remove(AUTH_RESOURCE_TOKEN);

	Cookie.remove('_AUTH_SPLAW_SESSION_TOKS');
	Cookie.remove('_AUTH_AFSHOP_SPLAW_SESSION_CRED');
	// router.replace(CLIENT_ENDPOINTS.ADMIN_LOGIN);
	window.location.reload();

	// return { router }
}

export function removeUserSignUpToken() {
	Cookie.remove(MERCHANT_SIGUP_CREDENTIALS);
	Cookie.remove('_MERCHANT_SIGNUP_SPLAWED_USER_DATA_TOKEN');
}

export function removeMerchantSignUpToken() {
	Cookie.remove(MERCHANT_SIGUP_CREDENTIALS);
	Cookie.remove('_MERCHANT_SIGNUP_SPLAWED_USER_DATA_TOKEN');
}

export function removeResendMerchantSignUpOtp() {
	Cookie.remove(RESEND_MERCHANT_SIGUP_OTP);
	Cookie.remove('_RESEND_MERCHANT_SIGNUP_SPLAWED_USER_OTP');
}

export const resetSessionForShopUsers = () => {
	localStorage.removeItem('marketplace_jwt_auth_credentials');

	// delete axios.defaults.headers.common.Authorization;
	// delete axios.defaults.headers.common.accessToken;
	localStorage.removeItem('jwt_is_authenticated_status');
	localStorage.removeItem('jwt_is_authStatus');
	// localStorage.removeItem('marketplace_jwt_auth_credentials');
	window.location.reload();
};

/**
 *#####################################################################################################################
 * @param context REMOVE COOKIES___PARSED__DATAS ends here
 * @returns
 * ########################################################################################################################
 * =======================================================================================================================
 */
