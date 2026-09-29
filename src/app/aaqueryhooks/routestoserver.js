import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import homesServerConfig from './configServerRoutes/homesServerConfig';
import { getAdminAccessToken } from './utils/opsUtils';
import config from '../auth/services/jwt/jwtAuthConfig';

// const API_BASE_URL = `${process.env.API_BASE_URL}`
// https://sea-turtle-app-c6p3o.ondigitalocean.app/listing/chariz-my-property

// const API_BASE_URL = `http://localhost:8007`;
const API_BASE_URL = `https://sea-turtle-app-c6p3o.ondigitalocean.app`;

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
	const token = getAdminAccessToken();

	// console.log("ACCESS__TOKEN", token)
	// const { signOut } = UseJwtAuth();

	const Api = axios.create({
		/** ***********Previous for Here starts */
		baseURL: baseUrl,
		// headers: customHeaders,
		/** ***************Previous for Here starts  ends */

		headers: { accesstoken: `${token}` }
	});

	Api.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error?.response?.status === 401) {
				// logOutUser();
				// signOut();
				// window.location.reload()
				logOutAdmin();

				return Promise.reject({
					status: 401,
					errors: ['Unauthorized']
				});
			}

			if (error?.response?.status === 403) {
				const errors = Object.values(error?.response?.data?.errors || {});
				// logOutUser();

				return Promise.reject({
					status: 403,
					errorsRaw: errors,
					errors: errors.reduce((error) => error)
				});
			}

			toast.error(
				error?.response && error?.response?.data?.message ? error?.response?.data?.message : error?.message
			);

			console.log(
				error?.response && error?.response?.data?.message ? error?.response?.data?.message : error?.message
			);

			// alert(
			//   error?.response && error?.response?.data?.message
			//     ? error?.response?.data?.message
			//     : error?.message
			// );

			return Promise.reject({
				status: error.response?.status,
				errors: ['Oops!']
			});
		}
	);

	return Api;
}

export const userSignIn = (formData) => Api().post(`${homesServerConfig.siggnInBravortStudentUrl}`, formData);

export const userForgotPassword = (formData) => {
	return Api().post(`${homesServerConfig.fogotPassBravortStudentUrl}`, formData);
};

export const userResetPasswordWithCode = (formData) =>
	Api().post(`${homesServerConfig.resetPassBravortStudentUrl}`, formData);
/** *
 * Handle USERS: Get All Users on Homes
 */
export const getAllUsers = () => {
	return AuthApi().get(`${homesServerConfig.getAllUsers}`);
};

/** Get a single user data */
export const getSingleUserAndListings = (userId) => {
	console.log('Getting Single-User-DATA', userId);
	return AuthApi().get(`${homesServerConfig.getAllUsers}/${userId}`);
};

/** *
 * Handle ADMIN-USERS: Get All Users on Homes
 */
// Recruit new Admins
export const andminCreateNewUserEndpoint = (newUserData) => {
	// console.log("Recruit DATA", newUserData)
	return AuthApi().post(`${homesServerConfig.recruitNewUserAccounts}`, newUserData);
};

// Activate New user account
export const andminActivateNewUserEndpoint = (newUserData) => {
	// console.log("Recruit DATA", newUserData)
	return AuthApi().post(`${homesServerConfig.activateNewUserAccounts}`, newUserData);
};

/** *========================================================================
 * Handle ADMIN: Get All Admin on Homes
 *==================================================================== */
export const getAllAdminsRoutes = () => {
	return AuthApi().get(`${homesServerConfig.getAllAdmins}`);
};

// get single admin
export const getSingleAdminUser = (adminId) => {
	return AuthApi().get(`${homesServerConfig.getAllAdmins}/${adminId}`);
};

// Recruit new Admins
export const recruitAdminUserEndpoint = (adminData) => {
	// console.log("Recruit DATA", adminData)
	return AuthApi().post(`${homesServerConfig.recruitAdmins}`, adminData);
};

// Recruit new Admins
export const adminUserInviteAcceptanceEndpoint = (adminData) => {
	// console.log("Recruit DATA", adminData)
	return Api().post(`${homesServerConfig.acceptInviteByAdmins}`, adminData);
};

/** =================================================================================
 * Get and Handle All AdminUseres ends here
 *================================================================================= */

/** *===========================================================================================
 * Handle Property Listings: Get All Listings by users/property-vendors starts here
 *============================================================================================= */
export const getAllPropertyListings = () => {
	return AuthApi().get(`${homesServerConfig.getAllListings}`);
};

/** Get single listing */
export const getSinglePropertyListing = (listingId) => {
	return AuthApi().get(`${homesServerConfig.getAllListings}/${listingId}`);
};

// Approve Listing
export const approvePropertyListing = (listingId) => {
	return AuthApi().put(`${homesServerConfig.approveListings}/${listingId}`);
};

// Dis-Approve Listing
export const disApprovePropertyListingEndpoint = (listingId) => {
	return AuthApi().put(`${homesServerConfig.disapproveListings}/${listingId}`);
};

/** *===========================================================================================
 * Handle Property Listings: Get All Listings by users/property-vendors ends here
 *============================================================================================= */

/** =================================================================================
 * Get and Handle All Service types starts
 *================================================================================= */
export const getAllServiceTypes = () => {
	return Api().get(`${homesServerConfig.getAllServiceTypes}`);
};

// get single service type
export const getSingleServiceType = (serviceTypeId) => {
	return Api().get(`${homesServerConfig.getAllServiceTypes}/${serviceTypeId}`);
};

export const createServiceTypes = (formData) => {
	return AuthApi().post(`${homesServerConfig.getAllServiceTypes}/create`, formData);
};

// update sevice typr
export const updateServiceTypesRoute = (formData) => {
	return AuthApi().put(`${homesServerConfig.getAllServiceTypes}/${formData?.id}`, formData);
};

// Delete sevice type
export const deleteServiceTypesRoute = (serviceTypeId) => {
	return AuthApi().delete(`${homesServerConfig.getAllServiceTypes}/${serviceTypeId}`);
};
/** =================================================================================
 * Get and Handle All Service types ends
 *================================================================================= */

/** =================================================================================
 * Get and Handle All Property Structure types starts
 *================================================================================= */
/** Get and Handle All property types */
export const getAllPropertyTypesEndpoint = () => {
	return Api().get(`${homesServerConfig.getAllPropertyTypes}`);
};

// get single property type
export const getSinglePropertyTypesEndpoint = (propertyTypeId) => {
	return Api().get(`${homesServerConfig.getAllPropertyTypes}/${propertyTypeId}`);
};

export const createPropertyTypesEndpoint = (formData) => {
	return AuthApi().post(`${homesServerConfig.getAllPropertyTypes}/create`, formData);
};

// update property type
export const updatePropertyTypesEndpoint = (formData) => {
	return AuthApi().put(`${homesServerConfig.getAllPropertyTypes}/${formData?.id}`, formData);
};

// Delete property type
export const deletePropertyTypesEndpoint = (propertyTypeId) => {
	return AuthApi().delete(`${homesServerConfig.getAllPropertyTypes}/${propertyTypeId}`);
};

/** =================================================================================
 * Get and Handle All  Property Structure types ends
 *================================================================================= */

//
export const logOutAdmin = () => {
	// Api().post(`${CONTROL_API_ENDPOINTS.ADMIN_LOGIN}`, formData);
	// const ok = true;
	// return ok;

	// localStorage.removeItem('jwt_is_authStatus')  //removing config-auth status
	localStorage?.setItem(config.authStatus, 'configuring');
	localStorage?.removeItem(config.tokenStorageKey);
	localStorage?.removeItem(config.isAuthenticatedStatus);

	// removeUserCredentialsStorage()
	Cookies.remove(config.userCredentials);
	Cookies.remove('marketplace_jwt_auth_credentials');

	window.location.reload();
};

/** *========================================
 * ALL AUTHENTICATED ADMIN REQUESTS GET_ALL_ADMINS
 *========================================================= */

// export const getAllAdminStaff= () => {

//     return AuthApi().get(`${CONTROL_API_ENDPOINTS.GET_ALL_ADMINS}`)
// }

// export const getAllUsersRegistered= () => {

//     return AuthApi().get(`${CONTROL_API_ENDPOINTS.GET_ALL_USERS}`)
// }

/**
 * =================================================================
 * HANLDE ALL MAIL_SENDING FOR MARKETTING TO STUDENTS
 * =================================================================
 */
// export const sendMailsToStudents= (formData) => {

//     return AuthApi().post(`${CONTROL_API_ENDPOINTS.MAIL_STUDENTS}`, formData)
// }
