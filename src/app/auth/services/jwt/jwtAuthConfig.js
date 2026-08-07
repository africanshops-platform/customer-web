const baseUrl = import.meta.env.VITE_API_BASE_URL_PROD; /** production & dev */

const jwtAuthConfig = {
	tokenStorageKey: 'jwt_access_token',
	refreshTokenStorageKey: 'jwt_refresh_token',
	sessionIdStorageKey: 'jwt_session_id',
	signInUrl: 'mock-api/auth/sign-in',
	signUpUrl: 'mock-api/auth/sign-up',
	tokenRefreshUrl: `${baseUrl}/auth-user/refresh-token`,
	getUserUrl: 'mock-api/auth/user',
	updateUserUrl: 'mock-api/auth/user',
	updateTokenFromHeader: true,

	/** ****Bravort Admin Dashboard Controls API */
	// signInBravortAdminUrl: `${baseUrl}/admin/login`,

	// signInBravortAdminUrl: `${adminSignIn()}`,
	signInBravortAdminUrl: `${baseUrl}/api/shop/login`,

	// getAuthAdminInBravortAdminUrl: `${baseUrl}/admin/get-auth-admin`,

	getAuthAdminInBravortAdminUrl: `${baseUrl}/shop/get-auth-shop`,
	isAuthenticatedStatus: 'jwt_is_authenticated_status',
	authStatus: 'jwt_is_authStatus',
	// App-specific (2026-08-07): was the identical literal cookie name in every
	// frontend app. Cookies are host-scoped, not port-scoped, so on localhost
	// every app's dev server (different ports, same host) was silently
	// overwriting the others' session cookie. Prod uses distinct subdomains
	// per app so this never showed up there.
	adminCredentials: 'marketplace_jwt_auth_credentials'
};

export default jwtAuthConfig;
