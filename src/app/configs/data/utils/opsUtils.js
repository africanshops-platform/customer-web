// import { useCallback } from 'react';
import homesServerConfig from 'src/app/aaqueryhooks/configServerRoutes/homesServerConfig';
// import homesServerConfig from '../configServerRoutes/homesServerConfig';
import jwtAuthConfig from 'src/app/auth/services/jwt/jwtAuthConfig';

export const setUserForgotPassCreedStorage = (userForgotPassCredentialsTk) => {
	localStorage.setItem(homesServerConfig.studentForgotPassTk, userForgotPassCredentialsTk);
};

export const getForgotPassToken = () => {
	return localStorage.getItem(homesServerConfig.studentForgotPassTk);
};

export const resetForgotPassToken = () => {
	return localStorage.removeItem(homesServerConfig.studentForgotPassTk);
};

export const getAdminAccessToken = () => {
	return localStorage.getItem(jwtAuthConfig.tokenStorageKey);
};

// userCredentials
/** **LOGGING OUT AN ADMIN USER */
export const logOutAdminUser = () => {
	return localStorage.removeItem(homesServerConfig.studentForgotPassTk);
};

/** **
 * UNBOARDING AND HANDLING USER STORAGES createNewUserTk
 */

export function setCreateNewUserAccount(userActivationToken) {
	localStorage.setItem(homesServerConfig.createNewUserTk, userActivationToken);

	// Cookie.set(homesServerConfig.createNewUserTk, JSON.stringify(userActivationToken))
}

export const getNewUserAccountToken = () => {
	return localStorage.getItem(homesServerConfig.createNewUserTk);

	// return Cookie.get(homesServerConfig.createNewUserTk);
};

/** ***
 * COOKIES CREDENTIALS
 */

// export const getShopUserJWTCredentialsStorage  = () => {
// 	//  let userCredentail

// 		  const {userCredentials} = Cookie.get('marketplace_jwt_auth_credentials') ? JSON.parse(Cookie.get('marketplace_jwt_auth_credentials')) : ''
// 		  console.log("UserCookie", userCredentials)
//           if(userCredentials){
// 			// return userCredentail = userCredentials
// 			return  userCredentials
// 		  }

// 		//   return userCredentials
// 		// return JSON.parse();
// 	};
