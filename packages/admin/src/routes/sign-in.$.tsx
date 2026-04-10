/**
 * Admin auth entry route module.
 */
import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { AdminAuthView } from '../components/AdminAuthView';
import { getAdminRedirectFromHref } from '../lib/route-guards';

export const Route = createFileRoute('/sign-in/$')({
  component: AdminSignInPage,
});

/**
 * Renders the admin auth view for the current sign-in sub-route.
 */
function AdminSignInPage() {
  const href = useRouterState({
    select: state => state.location.href,
  });

  return (
    <AdminAuthView
      redirectTo={getAdminRedirectFromHref(href)}
      splat={Route.useParams()._splat}
    />
  );
}
