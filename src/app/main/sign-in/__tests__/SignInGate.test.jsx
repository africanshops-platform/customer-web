import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { hasValidSession } from '../../../auth/services/jwt/signInLanding';

jest.mock('../SignInPage', () => function SignInPageStub() { return <div>login form</div>; });
// eslint-disable-next-line import/first
import SignInGate from '../SignInGate';

const jwt = (expSecondsFromNow) => {
  const body = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow })).replace(/=/g, '');
  return `h.${body}.s`;
};
const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/sign-in']}>
      <Routes>
        <Route path="/sign-in" element={<SignInGate />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('the sign-in route for a signed-in person', () => {
  beforeEach(() => localStorage.clear());

  it('a guest sees the login form', () => {
    renderAt();
    expect(screen.getByText('login form')).toBeTruthy();
  });

  it('a signed-in person is sent home and never sees the login form', () => {
    localStorage.setItem('jwt_access_token', jwt(600));
    renderAt();
    expect(screen.getByText('home')).toBeTruthy();
    expect(screen.queryByText('login form')).toBeNull();
  });

  it('an expired token counts as a guest (the login form shows, so they can sign in again)', () => {
    localStorage.setItem('jwt_access_token', jwt(-60));
    renderAt();
    expect(screen.getByText('login form')).toBeTruthy();
  });

  it('a malformed token never throws', () => {
    localStorage.setItem('jwt_access_token', 'garbage');
    expect(hasValidSession()).toBe(false);
  });
});
