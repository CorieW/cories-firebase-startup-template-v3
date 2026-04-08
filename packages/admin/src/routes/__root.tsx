/**
 * Root route shell and document wrapper for the admin app.
 */
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminShell } from "../components/AdminShell";
import {
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PREFIX,
} from "../lib/route-paths";
import {
  enforceSignedOutAdmin,
  getAdminSession,
  requireActiveAdmin,
} from "../lib/admin-auth";
import { authClient } from "../lib/admin-auth-client";
import { getAdminExternalToolLinks } from "../lib/server/env";
import { isAdminPublicRoute } from "../lib/route-guards";
import { ADMIN_THEME_CLASS_NAME, ADMIN_THEME_MODE } from "../lib/theme";
import { shellFrameClass } from "../lib/ui";
import appCss from "../styles.css?url";

const queryClient = new QueryClient();

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
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Admin Console",
      },
    ],
    links: [
      {
        rel: "stylesheet",
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
      lang="en"
      className={ADMIN_THEME_CLASS_NAME}
      data-theme={ADMIN_THEME_MODE}
      data-theme-preference={ADMIN_THEME_MODE}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className={shellFrameClass}>
        <QueryClientProvider client={queryClient}>
          <AuthQueryProvider>
            <AuthUIProviderTanstack
              authClient={authClient}
              basePath=""
              credentials
              emailVerification
              redirectTo={ADMIN_HOME_ROUTE_PATH}
              signUp={false}
              social={false}
              viewPaths={{
                CALLBACK: `${ADMIN_SIGN_IN_ROUTE_PREFIX}/callback`,
                EMAIL_VERIFICATION: `${ADMIN_SIGN_IN_ROUTE_PREFIX}/email-verification`,
                FORGOT_PASSWORD: `${ADMIN_SIGN_IN_ROUTE_PREFIX}/forgot-password`,
                RESET_PASSWORD: `${ADMIN_SIGN_IN_ROUTE_PREFIX}/reset-password`,
                SIGN_IN: ADMIN_SIGN_IN_ROUTE_PREFIX,
                SIGN_OUT: `${ADMIN_SIGN_IN_ROUTE_PREFIX}/sign-out`,
              }}
            >
              {children}
            </AuthUIProviderTanstack>
          </AuthQueryProvider>
        </QueryClientProvider>
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
    select: (state) => state.location.pathname,
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
