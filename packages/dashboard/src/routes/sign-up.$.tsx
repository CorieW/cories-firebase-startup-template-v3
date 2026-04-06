/**
 * Sign-up route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import BetterAuthForms from '../components/auth/BetterAuthForms';
import { enforceSignedOut } from '../lib/auth';

export const Route = createFileRoute('/sign-up/$')({
  beforeLoad: async ({ location }) => {
    await enforceSignedOut(location.pathname);
  },
  component: SignUpPage,
});

function SignUpPage() {
  return <BetterAuthForms mode='sign-up' splat={Route.useParams()._splat} />;
}
