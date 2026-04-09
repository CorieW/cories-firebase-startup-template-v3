/**
 * Admin sign-in and password-management route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import { AdminAuthView } from '../components/AdminAuthView';

export const Route = createFileRoute('/sign-in/$')({
  component: AdminSignInPage,
});

/**
 * Renders the admin auth view for the current sign-in sub-route.
 */
function AdminSignInPage() {
  return <AdminAuthView splat={Route.useParams()._splat} />;
}
