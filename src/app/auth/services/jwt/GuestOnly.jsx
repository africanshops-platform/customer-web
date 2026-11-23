import { Navigate } from 'react-router-dom';
import { hasValidSession } from './signInLanding';

/**
 * Wraps a login or registration screen: a signed-in person is turned round to {to}, replacing the history entry, so Back never lands on a
 * screen made for people who are not signed in. (Found 23 Nov 2026 on the customer app: Back after signing in showed the login form.)
 */
export default function GuestOnly({ children, to = '/' }) {
  if (hasValidSession()) return <Navigate to={to} replace />;
  return children;
}
