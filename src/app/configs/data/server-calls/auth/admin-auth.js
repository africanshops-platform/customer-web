import { useMutation } from 'react-query';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';
import { getSessionRedirectUrl, resetSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { toast } from 'react-toastify';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { clientSigin, verify2faLogin } from '../../client/RepositoryClient';
import config from '../../../../auth/services/jwt/jwtAuthConfig';
import { markSignedIn, signInLandingUrl, USER_COOKIE_OPTIONS } from '../../../../auth/services/jwt/signInLanding';



/** Stores the session and moves on. Shared by the password sign-in and the code step. */
function completeLogin(data) {
	const user = data?.data?.user;
	const accessToken = data?.data?.userAccessToken;

	if (user && accessToken) {
		const userId = user?.id ?? user?._id;
		const transFormedUser = {
			id: userId,
			name: user?.name,
			email: user?.email,
			role: 'user',
			avatar: user?.avatar
		};

		localStorage.setItem(config.tokenStorageKey, accessToken);
		axios.defaults.headers.common.accessToken = `${accessToken}`;
		localStorage.setItem(config.isAuthenticatedStatus, isTokenValid(accessToken));

		const refreshToken = data?.data?.userRefreshToken;
		const sessionId = data?.data?.sessionId;
		if (refreshToken) localStorage.setItem(config.refreshTokenStorageKey, refreshToken);
		if (sessionId) localStorage.setItem(config.sessionIdStorageKey, sessionId);

		setUserCredentialsStorage(transFormedUser);
	} else if (data) {
		handleApiError({ response: data });
	} else {
		toast.info('something unexpected happened');
	}
}

export function useShopAdminLogin() {
	return useMutation(clientSigin, {
		onSuccess: (data) => {
			// F30: the account has the authenticator on. No session yet: the sign-in form asks for the code next.
			if (data?.data?.requiresTwoFactor) return;
			completeLogin(data);
		},
		onError: (error) => {
			console.log('LoginError22Block', error);
			handleApiError(error);
		}
	});
}

/** The code step. A wrong code shows its message and leaves the form open; no session is stored until the code is right. */
export function useVerify2faLogin() {
	return useMutation(verify2faLogin, {
		onSuccess: (data) => completeLogin(data),
		onError: (error) => handleApiError(error)
	});
}

const isTokenValid = (accessToken) => {
	if (accessToken) {
		try {
			const decoded = jwtDecode(accessToken);
			const currentTime = Date.now() / 1000;
			return decoded.exp > currentTime;
		} catch (error) {
			return false;
		}
	}

	return false;
};

const setUserCredentialsStorage = (userCredentials) => {
	Cookie.set(config.adminCredentials, JSON.stringify({ userCredentials }), USER_COOKIE_OPTIONS);
	markSignedIn();

	const redirectUrl = getSessionRedirectUrl();
	if (redirectUrl) resetSessionRedirectUrl();

	const landing = signInLandingUrl(redirectUrl, window.location.pathname);
	if (landing) {
		// replace, not assign: the sign-in page must not stay in the history, or Back would return to the login form
		window.location.replace(landing);
	} else {
		window.location.reload();
	}
};
