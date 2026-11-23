import { signInLandingUrl, markSignedIn, healHalfSignedIn, USER_COOKIE_OPTIONS } from '../signInLanding';

describe('landing after sign-in', () => {
  it('never reloads onto the sign-in page: it goes home, or to the page the person came from', () => {
    expect(signInLandingUrl(null, '/sign-in')).toBe('/');
    expect(signInLandingUrl('/cart', '/sign-in')).toBe('/cart');
    expect(signInLandingUrl(null, '/marketplace')).toBeNull();
  });

  it('writes the flags the app gate reads before the reload', () => {
    localStorage.clear();
    markSignedIn();
    expect(localStorage.getItem('jwt_is_authStatus')).toBe('authenticated');
    expect(localStorage.getItem('fuseReactAuthProvider')).toBe('jwt');
  });
});

describe('a session token without its stored user', () => {
  const keys = ['jwt_access_token', 'jwt_refresh_token', 'jwt_session_id', 'jwt_is_authenticated_status', 'jwt_is_authStatus'];
  const fill = () => keys.forEach((k) => localStorage.setItem(k, 'x'));

  beforeEach(() => localStorage.clear());

  it('clears the stale session so the app opens as a guest', () => {
    fill();
    expect(healHalfSignedIn({ hasUser: false, keys })).toBe(true);
    keys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
  });

  it('leaves a complete session alone', () => {
    fill();
    expect(healHalfSignedIn({ hasUser: true, keys })).toBe(false);
    keys.forEach((k) => expect(localStorage.getItem(k)).toBe('x'));
  });

  it('does nothing for a guest', () => {
    expect(healHalfSignedIn({ hasUser: false, keys })).toBe(false);
  });

  it('the stored user outlives the browser session (7 days, like the refresh token)', () => {
    expect(USER_COOKIE_OPTIONS).toEqual({ expires: 7 });
  });
});
