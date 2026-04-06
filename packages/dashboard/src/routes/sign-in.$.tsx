/**
 * Sign-in route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import BetterAuthForms from '../components/auth/BetterAuthForms';
import { enforceSignedOut } from '../lib/auth';

export const Route = createFileRoute('/sign-in/$')({
  beforeLoad: async ({ location }) => {
    await enforceSignedOut(location.pathname);
  },
  component: SignInPage,
});

function SignInPage() {
  return <BetterAuthForms mode='sign-in' splat={Route.useParams()._splat} />;
}
