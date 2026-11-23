import { signInLandingUrl, markSignedIn } from '../signInLanding';

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
