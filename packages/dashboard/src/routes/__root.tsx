/**
 * Root route shell, layout, and global providers.
 */
import { default as commonLogging } from '@cories-firebase-startup-template-v3/common/logging';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AutumnProvider } from 'autumn-js/react';
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Footer from '../components/Footer';
import Header from '../components/Header';
import NotFoundPage from '../components/NotFoundPage';
import { ToastProvider, useToast } from '../components/toast/ToastProvider';
import { authClient, useAuthSession } from '../lib/auth-client';
import { enforceAuthentication, getAuthState } from '../lib/auth';
import { getAutumnCustomerScopeKey } from '../lib/billing-api';
import { getDashboardLogLevelServer } from '../lib/dashboard-log-level';
import { showBetterAuthToast } from '../lib/auth-ui-toast';
import { getFooterSocialLinksServer } from '../lib/social-links';
import { THEME_INIT_SCRIPT } from '../lib/theme';

import appCss from '../styles.css?url';
const { configureLogger, createScopedLogger } = commonLogging;
const queryClient = new QueryClient();
const rootLogger = createScopedLogger('DASHBOARD_APP');

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    await enforceAuthentication(location.pathname);
  },
  loader: async () => {
    const startedAt = Date.now();
    const dashboardLogLevel = await getDashboardLogLevelServer();

    configureLogger(dashboardLogLevel);

    const authState = await getAuthState();
    const footerSocialLinks = await getFooterSocialLinksServer();

    rootLogger.log(
      'LOADER',
      {
        action: 'loadRootDocument',
        status: 'success',
        durationMs: Date.now() - startedAt,
        isAuthenticated: authState.isAuthenticated,
        hasActiveOrganization: Boolean(authState.orgId),
        footerSocialLinksCount: footerSocialLinks.length,
        logLevel: dashboardLogLevel,
      },
      'info'
    );

    return {
      authState,
      dashboardLogLevel,
      footerSocialLinks,
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
        title: 'Firebase Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className='m-0 overflow-x-hidden bg-[var(--bg)] font-sans text-[var(--ink)] antialiased [overflow-wrap:anywhere]'>
        <QueryClientProvider client={queryClient}>
          <AuthQueryProvider>
            <ToastProvider>
              <AuthProviders>{children}</AuthProviders>
            </ToastProvider>
          </AuthQueryProvider>
        </QueryClientProvider>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function AuthProviders({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuthSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { toast } = useToast();
  const activeOrganizationId =
    typeof activeOrganization === 'undefined'
      ? undefined
      : (activeOrganization?.id ?? null);
  const autumnCustomerScopeKey = getAutumnCustomerScopeKey({
    activeOrganizationId,
    sessionActiveOrganizationId: session?.activeOrganizationId,
    sessionUserId: session?.userId,
    userId: user?.id,
  });

  return (
    <AuthUIProviderTanstack
      authClient={authClient}
      account={{
        basePath: '/user-profile',
        fields: ['name', 'image'],
      }}
      basePath=''
      credentials
      emailVerification
      organization={{
        basePath: '/organization-profile',
      }}
      redirectTo='/'
      signUp={{
        fields: ['name'],
      }}
      social={{
        providers: ['google'],
      }}
      toast={input => {
        showBetterAuthToast(input, toast.show);
      }}
      viewPaths={{
        ACCEPT_INVITATION: 'organization-profile/accept-invitation',
        CALLBACK: 'sign-in/callback',
        EMAIL_VERIFICATION: 'sign-in/email-verification',
        FORGOT_PASSWORD: 'sign-in/forgot-password',
        RESET_PASSWORD: 'sign-in/reset-password',
        SIGN_IN: 'sign-in',
        SIGN_OUT: 'sign-in/sign-out',
        SIGN_UP: 'sign-up',
      }}
    >
      <AutumnProvider key={autumnCustomerScopeKey} useBetterAuth>
        <Toaster richColors position='top-right' />
        <AppShell>{children}</AppShell>
      </AutumnProvider>
    </AuthUIProviderTanstack>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { authState, dashboardLogLevel, footerSocialLinks } =
    Route.useLoaderData();
  const { session, isPending } = useAuthSession();
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const isSessionPending = isPending && !session;
  const showSignedInShell =
    Boolean(session) || (isSessionPending && authState.isAuthenticated);

  useEffect(() => {
    configureLogger(dashboardLogLevel);
    rootLogger.log(
      'CLIENT_CONFIG',
      {
        action: 'configureDashboardLogger',
        source: 'browser',
        logLevel: dashboardLogLevel,
      },
      'debug'
    );
  }, [dashboardLogLevel]);

  useEffect(() => {
    rootLogger.action(
      'routeChange',
      {
        route: pathname,
        isAuthenticated: authState.isAuthenticated,
        hasActiveOrganization: Boolean(authState.orgId),
        showSignedInShell,
      },
      'info'
    );
  }, [authState.isAuthenticated, authState.orgId, pathname, showSignedInShell]);

  return (
    <div
      className={`flex min-h-screen flex-col ${showSignedInShell ? 'min-[980px]:pl-[270px]' : ''}`}
    >
      <Header
        isSessionPending={isSessionPending}
        showSignedInShell={showSignedInShell}
      />
      <main
        className={`flex-1 ${showSignedInShell ? 'max-[979px]:pt-11' : ''}`}
      >
        {children}
      </main>
      <Footer socialLinks={footerSocialLinks} />
    </div>
  );
}
