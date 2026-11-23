// After a successful sign-in the page is reloaded so the app boots signed in. Found 23 Nov 2026 (first sign-in on a fresh browser): the
// reload happened ON /sign-in before the app had written its "authenticated" flags, so the boot still saw a guest and showed the login
// form again; the second sign-in only worked because the flags existed by then. Two rules fix it for every sign-in route:
//   1. write the flags the gate reads (status + provider) BEFORE reloading
//   2. never reload onto the sign-in page: go to the page the person was sent from, else the home page

export const AUTH_STATUS_KEY = 'jwt_is_authStatus';
export const AUTH_PROVIDER_KEY = 'fuseReactAuthProvider';

/** Where to go after sign-in: a stored redirect wins; the sign-in page itself is never a landing place. */
export function signInLandingUrl(redirectUrl, pathname) {
  if (redirectUrl) return redirectUrl;
  return pathname === '/sign-in' || pathname === '/sign-in/' ? '/' : null; // null = reload the page the person is already on
}

/** Marks the browser as signed in for the app's gate, the same flags a later boot would write. */
export function markSignedIn(storage = window.localStorage) {
  try {
    storage.setItem(AUTH_STATUS_KEY, 'authenticated');
    storage.setItem(AUTH_PROVIDER_KEY, 'jwt');
  } catch {
    // storage blocked: the gate falls back to what it does today
  }
}
