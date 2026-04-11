/**
 * Root route shell and document wrapper for the admin app.
 */
import { TEMPLATE_APP_TITLES } from '@cories-firebase-startup-template-v3/common';
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminShell } from '../components/AdminShell';
import { ADMIN_HOME_ROUTE_PATH } from '../lib/route-paths';
import {
  enforceSignedOutAdmin,
  getAdminSession,
  requireActiveAdmin,
} from '../lib/admin-auth';
import { authClient, useAdminAuthSession } from '../lib/admin-auth-client';
import { getAdminExternalToolLinks } from '../lib/server/env';
import {
  buildAdminRedirectTarget,
  getAdminRedirectFromHref,
  isAdminPublicRoute,
} from '../lib/route-guards';
import { ADMIN_THEME_CLASS_NAME, ADMIN_THEME_MODE } from '../lib/theme';
import appCss from '../styles.css?url';
import {
  SharedPageLoader,
  SharedPageLoaderHead,
  useSharedPageLoaderDismiss,
} from '../../../common/src/client/SharedPageLoader';
import { sharedDocumentBodyClass } from '../../../common/src/client/document';
import { showBetterAuthToast } from '../../../common/src/client/better-auth-toast';
import {
  ToastProvider,
  useToast,
} from '../../../common/src/client/SharedToastProvider';

const queryClient = new QueryClient();
const emptyAdminSession = {
  adminRecord: null,
  email: null,
  isActiveAdmin: false,
  isAuthenticated: false,
  name: null,
  role: null,
  status: null,
  userId: null,
};

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    await enforceSignedOutAdmin(
      location.pathname,
      getAdminSession,
      getAdminRedirectFromHref(location.href)
    );
    await requireActiveAdmin(
      location.pathname,
      getAdminSession,
      buildAdminRedirectTarget({
        href: location.href,
        pathname: location.pathname,
      })
    );
  },
  loader: async ({ location }) => {
    const adminSession = isAdminPublicRoute(location.pathname)
      ? emptyAdminSession
      : await getAdminSession();
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
        title: TEMPLATE_APP_TITLES.admin,
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
        <SharedPageLoaderHead />
        <HeadContent />
      </head>
      <body className={sharedDocumentBodyClass}>
        <SharedPageLoader />
        <QueryClientProvider client={queryClient}>
          <AuthQueryProvider>
            <ToastProvider>
              <AdminAuthProviders>{children}</AdminAuthProviders>
            </ToastProvider>
          </AuthQueryProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Wires Better Auth UI events into the shared admin toast provider.
 */
function AdminAuthProviders({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  return (
    <AuthUIProviderTanstack
      authClient={authClient}
      basePath=''
      credentials={{ forgotPassword: false }}
      emailVerification
      redirectTo={ADMIN_HOME_ROUTE_PATH}
      signUp={false}
      social={{ providers: [] }}
      toast={input => {
        showBetterAuthToast(input, toast.show);
      }}
      viewPaths={{
        CALLBACK: 'sign-in/callback',
        EMAIL_VERIFICATION: 'sign-in/email-verification',
        FORGOT_PASSWORD: 'sign-in/forgot-password',
        RECOVER_ACCOUNT: 'sign-in/recover-account',
        RESET_PASSWORD: 'sign-in/reset-password',
        SIGN_IN: 'sign-in',
        SIGN_OUT: 'sign-in/sign-out',
        TWO_FACTOR: 'sign-in/two-factor',
      }}
    >
      {children}
    </AuthUIProviderTanstack>
  );
}

/**
 * Provides a simple shell wrapper for nested admin routes.
 */
function RootLayout() {
  const adminAuthSession = useAdminAuthSession();
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const { adminSession, externalToolLinks } = Route.useLoaderData();
  const isPublicRoute = isAdminPublicRoute(pathname);
  const isPageLoaderReady =
    Boolean(adminAuthSession.data) || !adminAuthSession.isPending;

  useSharedPageLoaderDismiss(isPageLoaderReady);

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
