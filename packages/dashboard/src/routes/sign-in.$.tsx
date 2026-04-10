/**
 * Sign-in route module.
 */
import { createFileRoute, useRouterState } from '@tanstack/react-router';
import BetterAuthForms from '../components/auth/BetterAuthForms';
import { enforceSignedOut } from '../lib/auth';
import { getAuthRedirectFromHref } from '../lib/route-guards';

export const Route = createFileRoute('/sign-in/$')({
  beforeLoad: async ({ location }) => {
    await enforceSignedOut(
      location.pathname,
      undefined,
      getAuthRedirectFromHref(location.href)
    );
  },
  component: SignInPage,
});

function SignInPage() {
  const href = useRouterState({
    select: state => state.location.href,
  });

  return (
    <BetterAuthForms
      mode='sign-in'
      redirectTo={getAuthRedirectFromHref(href)}
      splat={Route.useParams()._splat}
    />
  );
}
