import { Navigate } from 'react-router-dom';
import { hasValidSession } from '../../auth/services/jwt/signInLanding';
import SignInPage from './SignInPage';

/**
 * The sign-in route for a signed-in person never shows the login form: pressing Back onto /sign-in after signing in turns straight round
 * (replacing the history entry, so Back does not land here again). Found 23 Nov 2026 on the customer app.
 */
export default function SignInGate() {
  if (hasValidSession()) return <Navigate to="/" replace />;
  return <SignInPage />;
}
