/**
 * Admin sign-in and password-management route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import { AdminAuthView } from '../components/AdminAuthView';

type AdminAuthMode =
  | 'callback'
  | 'email-verification'
  | 'forgot-password'
  | 'reset-password'
  | 'sign-in'
  | 'sign-out';

interface AdminAuthSearchParams {
  error?: unknown;
  token?: unknown;
}

function normalizeAdminAuthMode(splat: string | undefined): AdminAuthMode {
  const normalized = splat?.replace(/^\/+|\/+$/g, '') ?? '';

  switch (normalized) {
    case '':
      return 'sign-in';
    case 'callback':
      return 'callback';
    case 'email-verification':
      return 'email-verification';
    case 'forgot-password':
      return 'forgot-password';
    case 'reset-password':
      return 'reset-password';
    case 'sign-out':
      return 'sign-out';
    default:
      return 'sign-in';
  }
}

export const Route = createFileRoute('/sign-in/$')({
  validateSearch: (search: AdminAuthSearchParams | undefined) => ({
    error: typeof search?.error === 'string' ? search.error : '',
    token: typeof search?.token === 'string' ? search.token : '',
  }),
  component: AdminSignInPage,
});

/**
 * Renders the admin auth view for the current sign-in sub-route.
 */
function AdminSignInPage() {
  const mode = normalizeAdminAuthMode(Route.useParams()._splat);
  const search = Route.useSearch() ?? { error: '', token: '' };

  return (
    <AdminAuthView error={search.error} mode={mode} token={search.token} />
  );
}
