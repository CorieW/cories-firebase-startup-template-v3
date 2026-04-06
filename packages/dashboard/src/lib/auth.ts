/**
 * Dashboard auth guard helpers.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import {
  BILLING_ROUTE_PATH,
} from './route-paths'
import {
  isAuthEntryRoute,
  isPublicRoute,
  SIGN_IN_PATH,
} from './route-guards'

const authLogger = createScopedLogger('DASH_AUTH')

export interface AuthState {
  isAuthenticated: boolean
  userId: string | null
  orgId: string | null
}

/**
 * Runs on the server and returns current request auth state.
 */
export const getAuthState = createServerFn({ method: 'GET' }).handler(async () => {
  const startedAt = Date.now()

  try {
    const { auth } = await import('./auth-server')
    const authState = await auth.api.getSession({
      headers: getRequestHeaders(),
    })
    const normalizedAuthState = {
      isAuthenticated: Boolean(authState?.session),
      userId: authState?.user.id ?? null,
      orgId: authState?.session.activeOrganizationId ?? null,
    }

    authLogger.log(
      'SESSION',
      {
        action: 'getAuthState',
        status: 'success',
        durationMs: Date.now() - startedAt,
        ...normalizedAuthState,
      },
      'debug'
    )

    return normalizedAuthState
  } catch (error) {
    authLogger.log(
      'SESSION_ERROR',
      {
        action: 'getAuthState',
        status: 'error',
        durationMs: Date.now() - startedAt,
        error: serializeErrorForLogging(error),
      },
      'error'
    )
    throw error
  }
})

/**
 * Redirects unauthenticated users away from protected routes.
 */
export async function enforceAuthentication(
  pathname: string,
  readAuthState: () => Promise<AuthState> = getAuthState
): Promise<void> {
  if (isPublicRoute(pathname)) {
    authLogger.action(
      'enforceAuthenticationSkipped',
      {
        pathname,
        reason: 'public-route',
      },
      'debug'
    )
    return
  }

  const authState = await readAuthState()
  if (!authState.isAuthenticated) {
    authLogger.action(
      'enforceAuthenticationRedirect',
      {
        pathname,
        redirectTo: SIGN_IN_PATH,
      },
      'warn'
    )
    throw redirect({
      to: SIGN_IN_PATH,
      params: {
        _splat: '',
      },
    })
  }

  authLogger.action(
    'enforceAuthenticationAllowed',
    {
      pathname,
      userId: authState.userId,
      orgId: authState.orgId,
    },
    'debug'
  )
}

/**
 * Redirects authenticated users away from sign-in and sign-up entry pages.
 */
export async function enforceSignedOut(
  pathname: string,
  readAuthState: () => Promise<AuthState> = getAuthState
): Promise<void> {
  if (!isAuthEntryRoute(pathname)) {
    authLogger.action(
      'enforceSignedOutSkipped',
      {
        pathname,
        reason: 'non-auth-entry-route',
      },
      'debug'
    )
    return
  }

  const authState = await readAuthState()
  if (authState.isAuthenticated) {
    authLogger.action(
      'enforceSignedOutRedirect',
      {
        pathname,
        redirectTo: '/',
        userId: authState.userId,
      },
      'info'
    )
    throw redirect({
      to: '/',
    })
  }

  authLogger.action(
    'enforceSignedOutAllowed',
    {
      pathname,
    },
    'debug'
  )
}

/**
 * Redirects users without an active organization away from org-only routes.
 */
export async function enforceActiveOrganization(
  pathname: string,
  readAuthState: () => Promise<AuthState> = getAuthState
): Promise<void> {
  if (isPublicRoute(pathname)) {
    authLogger.action(
      'enforceActiveOrganizationSkipped',
      {
        pathname,
        reason: 'public-route',
      },
      'debug'
    )
    return
  }

  const authState = await readAuthState()
  if (!authState.isAuthenticated) {
    authLogger.action(
      'enforceActiveOrganizationRedirectUnauthenticated',
      {
        pathname,
        redirectTo: SIGN_IN_PATH,
      },
      'warn'
    )
    throw redirect({
      to: SIGN_IN_PATH,
      params: {
        _splat: '',
      },
    })
  }

  if (!authState.orgId) {
    authLogger.action(
      'enforceActiveOrganizationRedirect',
      {
        pathname,
        redirectTo: BILLING_ROUTE_PATH,
        userId: authState.userId,
      },
      'info'
    )
    throw redirect({
      to: BILLING_ROUTE_PATH,
    })
  }

  authLogger.action(
    'enforceActiveOrganizationAllowed',
    {
      pathname,
      userId: authState.userId,
      orgId: authState.orgId,
    },
    'debug'
  )
}

/**
 * Redirects users with an active organization away from user-only routes.
 */
export async function enforceNoActiveOrganization(
  pathname: string,
  readAuthState: () => Promise<AuthState> = getAuthState
): Promise<void> {
  if (isPublicRoute(pathname)) {
    authLogger.action(
      'enforceNoActiveOrganizationSkipped',
      {
        pathname,
        reason: 'public-route',
      },
      'debug'
    )
    return
  }

  const authState = await readAuthState()
  if (!authState.isAuthenticated) {
    authLogger.action(
      'enforceNoActiveOrganizationRedirectUnauthenticated',
      {
        pathname,
        redirectTo: SIGN_IN_PATH,
      },
      'warn'
    )
    throw redirect({
      to: SIGN_IN_PATH,
      params: {
        _splat: '',
      },
    })
  }

  if (authState.orgId) {
    authLogger.action(
      'enforceNoActiveOrganizationRedirect',
      {
        pathname,
        redirectTo: BILLING_ROUTE_PATH,
        userId: authState.userId,
        orgId: authState.orgId,
      },
      'info'
    )
    throw redirect({
      to: BILLING_ROUTE_PATH,
    })
  }

  authLogger.action(
    'enforceNoActiveOrganizationAllowed',
    {
      pathname,
      userId: authState.userId,
    },
    'debug'
  )
}
