/**
 * Root route shell and document wrapper for the admin app.
 */
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router';
import { AdminShell } from '../components/AdminShell';
import {
  enforceSignedOutAdmin,
  getAdminSession,
  requireActiveAdmin,
} from '../lib/admin-auth';
import { getAdminExternalToolLinks } from '../lib/server/env';
import { isAdminPublicRoute } from '../lib/route-guards';
import { ADMIN_THEME_CLASS_NAME, ADMIN_THEME_MODE } from '../lib/theme';
import { shellFrameClass } from '../lib/ui';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    await enforceSignedOutAdmin(location.pathname);
    await requireActiveAdmin(location.pathname);
  },
  loader: async () => {
    const adminSession = await getAdminSession();
    const externalToolLinks = getAdminExternalToolLinks();

    return {
      adminSession,
      externalToolLinks,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Admin Console',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
});

/**
 * Renders the top-level HTML document for the admin app.
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      className={ADMIN_THEME_CLASS_NAME}
      data-theme={ADMIN_THEME_MODE}
      data-theme-preference={ADMIN_THEME_MODE}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className={shellFrameClass}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Provides a simple shell wrapper for nested admin routes.
 */
function RootLayout() {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const { adminSession, externalToolLinks } = Route.useLoaderData();
  const isPublicRoute = isAdminPublicRoute(pathname);

  if (isPublicRoute || !adminSession.isActiveAdmin) {
    return <Outlet />;
  }

  return (
    <AdminShell
      adminSession={adminSession}
      externalToolLinks={externalToolLinks}
    >
      <Outlet />
    </AdminShell>
  );
}
