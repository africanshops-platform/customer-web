import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestOnly from '../GuestOnly';

const jwt = (s) => `h.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + s })).replace(/=/g, '')}.s`;
const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/sign-up']}>
      <Routes>
        <Route path="/sign-up" element={<GuestOnly to="/home"><div>registration form</div></GuestOnly>} />
        <Route path="/home" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('a registration screen for a signed-in person', () => {
  beforeEach(() => localStorage.clear());

  it('a guest sees the form', () => {
    renderAt();
    expect(screen.getByText('registration form')).toBeTruthy();
  });

  it('a signed-in person is turned round and never sees the form', () => {
    localStorage.setItem('jwt_access_token', jwt(600));
    renderAt();
    expect(screen.getByText('home')).toBeTruthy();
    expect(screen.queryByText('registration form')).toBeNull();
  });

  it('an expired token counts as a guest', () => {
    localStorage.setItem('jwt_access_token', jwt(-60));
    renderAt();
    expect(screen.getByText('registration form')).toBeTruthy();
  });
});
