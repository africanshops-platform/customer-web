import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import config from "./jwtAuthConfig";
import { useSnackbar } from "notistack";
import Cookie from "js-cookie";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  getSessionRedirectUrl,
  resetSessionRedirectUrl,
} from "@fuse/core/FuseAuthorization/sessionRedirectUrl";
// import { useAdminLogin } from "app/configs/data/server-calls/merchant-auth";
import { useShopAdminLogin } from "app/configs/data/server-calls/auth/admin-auth";
import { revokeSessionApi } from "app/configs/data/client/RepositoryAuthClient";

const defaultAuthContext = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  updateUser: null,
  signIn: null,
  signUp: null,
  signOut: null,
  refreshToken: null,
  setIsLoading: () => {},
  authStatus: "configuring",
};

export const JwtAuthContext = createContext(defaultAuthContext);

function JwtAuthProvider(props) {
  /**
	 * Handle set authenticated boolean status starts
	========================================================= */
  // Set IsAuthenticated
  const setIsAthenticatedStorage = useCallback((accessToken) => {
    if (isTokenValid(accessToken)) {
      localStorage.setItem(config.isAuthenticatedStatus, true);
    } else {
      localStorage.setItem(config.isAuthenticatedStatus, false);
    }
  }, []);

  // Reset IsAuthenticated
  const removeIsAthenticatedStorage = useCallback(() => {
    localStorage?.removeItem(config.isAuthenticatedStatus);
  }, []);

  const getIsAuthenticatedStatus = useCallback(() => {
    return localStorage.getItem(config.isAuthenticatedStatus);
  }, []);
  /**===================================================
   * Handle set authenticated boolean status ends
   */
  /**################################################################################################## */

  /**
	 * Handle set authenticated boolean status starts
	========================================================= */
  // Set IsAuthenticated
  const setAuthStatusStorage = useCallback((accessToken) => {
    if (isTokenValid(accessToken)) {
      localStorage.setItem(config.authStatus, "authenticated");
    } else {
      localStorage.setItem(config.authStatus, "unauthenticated");
    }
  }, []);

  // Reset IsAuthenticated
  const resetAuthStatusStorage = useCallback(() => {
    localStorage.setItem(config.authStatus, "configuring");
  }, []);

  const getIsAuthStatusStorage = useCallback(() => {
    return localStorage.getItem(config.authStatus);
  }, []);
  /**===================================================
   * Handle set authenticated boolean status ends
   */
  /**######################################################################################################## */

  /*****
   * HANDLE USER DAT STORAGE
   */
  const setUserCredentialsStorage = useCallback((userCredentials) => {
    Cookie.set(config.adminCredentials, JSON.stringify({ userCredentials }));
  }, []);

  /**Get User credentials */
  const getUserCredentialsStorage = useCallback(() => {
    //Get Item in Cookie-based-SETTERS
    const { userCredentials } = Cookie.get("marketplace_jwt_auth_credentials")
      ? JSON.parse(Cookie.get("marketplace_jwt_auth_credentials"))
      : "";
    if (userCredentials) {
      return userCredentials;
    }
  }, []);

  /***Remove user credentials */
  const removeUserCredentialsStorage = useCallback(() => {
    localStorage.removeItem(config.userCredentials);
    localStorage.removeItem("marketplace_jwt_auth_credentials");
    Cookie.remove(config.userCredentials);
    Cookie.remove("marketplace_jwt_auth_credentials");
  }, []);

  const [user, setUser] = useState(getUserCredentialsStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setLoginIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(getIsAuthenticatedStatus());
  const [authStatus, setAuthStatus] = useState(getIsAuthStatusStorage()); //'configuring'
  const { children } = props;

  /**
   * Handle sign-in success
   */

  const handleSignInSuccess = useCallback((userData, accessToken) => {
    setSession(accessToken);
    // Store auth status in localStorage then update React state with the real boolean
    setIsAthenticatedStorage(accessToken);
    setIsAuthenticated(true);
    setUserCredentialsStorage(userData);
    setUser(userData);

    // Only navigate away if there is an explicit redirect URL stored in session
    const redirectUrl = getSessionRedirectUrl();
    if (redirectUrl) {
      resetSessionRedirectUrl();
      window.location.href = redirectUrl;
    }
    // No reload here — auto-login silently restores the session without reloading.
    // The explicit sign-in reload is handled in admin-auth.js → setUserCredentialsStorage.
  }, []); /**here is where token is stored */
  /**
   * Handle sign-up success
   */
  const handleSignUpSuccess = useCallback((userData, accessToken) => {
    setSession(accessToken);

    setIsAuthenticated(setIsAthenticatedStorage(accessToken));

    setUserCredentialsStorage(userData);
  }, []);
  /**
   * Handle sign-in failure
   */
  const handleSignInFailure = useCallback((error) => {
    resetSession();
    setIsAuthenticated(false);
    setUser(null);
    handleError(error);
  }, []);
  /**
   * Handle sign-up failure
   */
  const handleSignUpFailure = useCallback((error) => {
    resetSession();
    setIsAuthenticated(false);
    setUser(null);
    handleError(error);
  }, []);
  /**
   * Handle error
   */
  const handleError = useCallback((_error) => {
    resetSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const setSession = useCallback((accessToken) => {
    if (accessToken) {
      localStorage.setItem(config.tokenStorageKey, accessToken);

      axios.defaults.headers.common.accessToken = `${accessToken}`;
    }
  }, []);

  const resetSession = useCallback(() => {
    localStorage.removeItem(config.tokenStorageKey);

    delete axios.defaults.headers.common.accessToken;
  }, []);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(config.tokenStorageKey);
  }, []);

  /**Check if the access token is valid */
  const isTokenValid = useCallback((accessToken) => {
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
  }, []);
  /** Check if the access token exist and is valid on mount */
  useEffect(() => {
    const attemptAutoLogin = async () => {
      let accessToken = getAccessToken();

      // Access token is missing or expired — try a silent refresh before giving up
      if (!isTokenValid(accessToken)) {
        const storedRefreshToken = localStorage.getItem(config.refreshTokenStorageKey);

        if (!storedRefreshToken) {
          setIsLoading(false);
          resetSession();
          removeUserCredentialsStorage();
          return false;
        }

        try {
          // Fresh instance — bypass the global 401 interceptor for this call.
          const refreshResp = await axios.create().post(config.tokenRefreshUrl, { refreshToken: storedRefreshToken });
          const newAccess = refreshResp.data?.userAccessToken;
          const newRefresh = refreshResp.data?.userRefreshToken;

          if (!newAccess) throw new Error('Missing access token in refresh response');

          setSession(newAccess);
          if (newRefresh) localStorage.setItem(config.refreshTokenStorageKey, newRefresh);
          accessToken = newAccess;
        } catch {
          setIsLoading(false);
          resetSession();
          removeUserCredentialsStorage();
          localStorage.removeItem(config.refreshTokenStorageKey);
          localStorage.removeItem(config.sessionIdStorageKey);
          return false;
        }
      }

      // We now have a valid access token — verify it with the backend
      try {
        setIsLoading(true);
        const response = await axios.get(config.getAuthAdminInBravortAdminUrl, {
          headers: { shoparccreed: `${accessToken}` },
        });

        const transFormedUser = {
          id: response?.data?.user?.id,
          name: response?.data?.user?.name,
          email: response?.data?.user?.email,
          role: "merchant",
          shopplan: response?.data?.user?.shopplan,
        };

        handleSignInSuccess(transFormedUser, accessToken);
        setIsLoading(false);
        return true;
      } catch (error) {
        const axiosError = error;
        toast.error(
          error?.response?.data?.message ?? error?.message,
        );
        handleSignInFailure(axiosError);
        setIsLoading(false);
        return false;
      }
    };

    if (!isAuthenticated || isAuthenticated === null) {
      attemptAutoLogin().then((signedIn) => {
        setIsLoading(false);
        setAuthStatus(signedIn ? "authenticated" : "unauthenticated");
      });
    }
  }, [
    isTokenValid,
    setSession,
    handleSignInSuccess,
    handleSignInFailure,
    handleError,
    getAccessToken,
    isAuthenticated,
  ]);

  const adminLogIn = useShopAdminLogin();
  const handleRequest = async (
    _url,
    data,
    _handleSignInSuccess,
    handleSignInFailure,
  ) => {
    try {
      await adminLogIn.mutateAsync(data);
      return null;
    } catch (error) {
      const axiosError = error;
      handleSignInFailure(axiosError);
      return axiosError;
    }
  };
  /***Refactor signIn function */
  const signIn = (credentials) => {
    return handleRequest(
      config.signInBravortAdminUrl,
      credentials,
      handleSignInSuccess,
      handleSignInFailure,
    );
  };
  /***Refactor signUp function */
  const signUp = useCallback((data) => {
    return handleRequest(config.signUpUrl, data, handleSignUpSuccess, handleSignUpFailure);
  }, []);
  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    // Revoke this session on the server so the guard invalidates it on all devices/tabs.
    // Fire-and-forget — we clear local state regardless of whether the call succeeds.
    const sessionId = localStorage.getItem(config.sessionIdStorageKey);
    if (sessionId) {
      try {
        await revokeSessionApi(sessionId);
      } catch {
        // server-side revocation failed (e.g. already expired); continue with local cleanup
      }
    }

    resetAuthStatusStorage();
    resetSession();
    removeIsAthenticatedStorage();
    removeUserCredentialsStorage();
    localStorage.removeItem(config.refreshTokenStorageKey);
    localStorage.removeItem(config.sessionIdStorageKey);

    window.location.reload();
  }, []);
  /**
   * Update user
   */
  const updateUser = useCallback(async (userData) => {
    try {
      const response = await axios.put(config.updateUserUrl, userData);
      const updatedUserData = response?.data;
      setUser(updatedUserData);
      return null;
    } catch (error) {
      const axiosError = error;
      handleError(axiosError);
      return axiosError;
    }
  }, []);
  /**
   * Refresh access token using the stored refresh token.
   * Returns the new access token on success, null if no refresh token is stored,
   * or the error object on failure.
   */
  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const storedRefreshToken = localStorage.getItem(config.refreshTokenStorageKey);
      if (!storedRefreshToken) {
        setIsLoading(false);
        return null;
      }

      const response = await axios.create().post(config.tokenRefreshUrl, { refreshToken: storedRefreshToken });
      const newAccessToken = response.data?.userAccessToken;
      const newRefreshToken = response.data?.userRefreshToken;

      if (newAccessToken) {
        setSession(newAccessToken);
        if (newRefreshToken) localStorage.setItem(config.refreshTokenStorageKey, newRefreshToken);
        setIsLoading(false);
        return newAccessToken;
      }

      setIsLoading(false);
      return null;
    } catch (error) {
      const axiosError = error;
      handleError(axiosError);
      setIsLoading(false);
      return axiosError;
    }
  };
  /**
   * if a successful response contains a new Authorization header,
   * updates the access token from it.
   *
   */
  useEffect(() => {
    if (!config.updateTokenFromHeader || !isAuthenticated) return undefined;

    // Register once per auth state change; eject on cleanup to prevent stacking.
    const interceptorId = axios.interceptors.response.use(
      (response) => {
        const newAccessToken = response?.headers?.["New-Access-Token"];
        if (newAccessToken) setSession(newAccessToken);
        return response;
      },
      (error) => {
        const axiosError = error;
        if (axiosError?.response?.status === 401) {
          signOut();
          // eslint-disable-next-line no-console
          console.warn("Unauthorized request. User was signed out.");
        }
        return Promise.reject(axiosError);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [isAuthenticated, setSession, signOut]);
  const storedAccessToken = getAccessToken();
  useEffect(() => {
    if (storedAccessToken) {
      setAuthStatusStorage(storedAccessToken);
    }
  }, [user, storedAccessToken]);
  const authContextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      authStatus,
      isLoading: isLoading || adminLogIn.isLoading,
      isLoginLoading,
      signIn,
      signUp,
      signOut,
      updateUser,
      refreshToken,
      setIsLoading,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isLoginLoading,
      adminLogIn.isLoading,
      signIn,
      signUp,
      signOut,
      updateUser,
      refreshToken,
      setIsLoading,
    ],
  );
  return <JwtAuthContext.Provider value={authContextValue}>{children}</JwtAuthContext.Provider>;
}

export default JwtAuthProvider;
