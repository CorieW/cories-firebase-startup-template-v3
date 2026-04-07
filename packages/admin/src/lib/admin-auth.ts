/**
 * Admin session lookup and route guard helpers.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
  type AdminPermission,
} from '@cories-firebase-startup-template-v3/common';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { hasAdminPermission } from './admin-permissions';
import {
  ADMIN_FORBIDDEN_ROUTE_PATH,
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PREFIX,
} from './route-paths';
import { isAdminAuthRoute, isAdminPublicRoute } from './route-guards';
import {
  buildAdminSessionState,
  getAdminRecord,
  type AdminSessionState,
} from './server/admin-directory';
import { writeAdminAuditLog } from './server/audit-log';

const authLogger = createScopedLogger('ADMIN_AUTH');

/**
 * Returns the current request-scoped admin session state.
 */
export const getAdminSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const startedAt = Date.now();

    try {
      const { auth } = await import('./server/auth-server');
      const sessionState = await auth.api.getSession({
        headers: getRequestHeaders(),
      });

      const adminRecord = sessionState?.user?.id
        ? await getAdminRecord(sessionState.user.id)
        : null;

      const adminSession = buildAdminSessionState({
        adminRecord,
        user: sessionState?.user ?? null,
      });

      authLogger.log(
        'SESSION',
        {
          action: 'getAdminSession',
          status: 'success',
          durationMs: Date.now() - startedAt,
          isAuthenticated: adminSession.isAuthenticated,
          isActiveAdmin: adminSession.isActiveAdmin,
          role: adminSession.role,
        },
        'debug'
      );

      return adminSession;
    } catch (error) {
      authLogger.log(
        'SESSION_ERROR',
        {
          action: 'getAdminSession',
          status: 'error',
          durationMs: Date.now() - startedAt,
          error: serializeErrorForLogging(error),
        },
        'error'
      );
      throw error;
    }
  }
);

async function auditAccessDenial(
  pathname: string,
  adminSession: AdminSessionState,
  permission?: AdminPermission
) {
  if (!adminSession.isAuthenticated || !adminSession.userId) {
    return;
  }

  await writeAdminAuditLog({
    action: permission ? 'admin.access.permission-denied' : 'admin.access.denied',
    actor: {
      uid: adminSession.userId,
      role: adminSession.role,
    },
    metadata: permission
      ? {
          pathname,
          permission,
        }
      : {
          pathname,
          status: adminSession.status,
        },
    resourceType: 'route',
    resourceId: pathname,
    result: 'denied',
  });
}

/**
 * Redirects away from protected admin routes when the viewer is not an active admin.
 */
export async function requireActiveAdmin(
  pathname: string,
  readAdminSession: () => Promise<AdminSessionState> = getAdminSession
) {
  if (isAdminPublicRoute(pathname)) {
    return;
  }

  const adminSession = await readAdminSession();

  if (!adminSession.isAuthenticated) {
    throw redirect({
      to: ADMIN_SIGN_IN_ROUTE_PREFIX,
      params: {
        _splat: '',
      },
    });
  }

  if (!adminSession.isActiveAdmin) {
    await auditAccessDenial(pathname, adminSession);
    throw redirect({
      to: ADMIN_FORBIDDEN_ROUTE_PATH,
    });
  }
}

/**
 * Redirects active admins away from sign-in entry routes.
 */
export async function enforceSignedOutAdmin(
  pathname: string,
  readAdminSession: () => Promise<AdminSessionState> = getAdminSession
) {
  if (!isAdminAuthRoute(pathname)) {
    return;
  }

  const adminSession = await readAdminSession();
  if (adminSession.isActiveAdmin) {
    throw redirect({
      to: ADMIN_HOME_ROUTE_PATH,
    });
  }
}

/**
 * Enforces a specific admin permission before the route loader runs.
 */
export async function requireAdminPermission(
  pathname: string,
  permission: AdminPermission,
  readAdminSession: () => Promise<AdminSessionState> = getAdminSession
) {
  await requireActiveAdmin(pathname, readAdminSession);

  const adminSession = await readAdminSession();
  if (!hasAdminPermission(adminSession.permissions, permission)) {
    await auditAccessDenial(pathname, adminSession, permission);
    throw redirect({
      to: ADMIN_FORBIDDEN_ROUTE_PATH,
    });
  }
}

