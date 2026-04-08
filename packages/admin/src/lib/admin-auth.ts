/**
 * Admin session lookup and route guard helpers.
 */
import {
  createScopedLogger,
  isAdminRole,
  serializeErrorForLogging,
} from "@cories-firebase-startup-template-v3/common";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  ADMIN_SIGN_OUT_ROUTE_PATH,
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PATH,
  getAdminAuthRouteParams,
  getAdminAuthRouteSearch,
} from "./route-paths";
import { normalizeAdminPathname } from "./route-guards";
import { isAdminAuthRoute, isAdminPublicRoute } from "./route-guards";
import type { AdminSessionState } from "./server/admin-directory";

const authLogger = createScopedLogger("ADMIN_AUTH");

/**
 * Returns the current request-scoped admin session state.
 */
export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const startedAt = Date.now();

    try {
      const { auth } = await import("./server/auth-server");
      const { buildAdminSessionState, getAdminRecord } =
        await import("./server/admin-directory");
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
        "SESSION",
        {
          action: "getAdminSession",
          status: "success",
          durationMs: Date.now() - startedAt,
          isAuthenticated: adminSession.isAuthenticated,
          isActiveAdmin: adminSession.isActiveAdmin,
          role: adminSession.role,
        },
        "debug",
      );

      return adminSession;
    } catch (error) {
      authLogger.log(
        "SESSION_ERROR",
        {
          action: "getAdminSession",
          status: "error",
          durationMs: Date.now() - startedAt,
          error: serializeErrorForLogging(error),
        },
        "error",
      );
      throw error;
    }
  },
);

const writeAdminAccessAuditLog = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      action?: unknown;
      actorRole?: unknown;
      actorUid?: unknown;
      metadata?: unknown;
      resourceId?: unknown;
      resourceType?: unknown;
      result?: unknown;
    }) => ({
      action:
        typeof input.action === "string" ? input.action : "admin.access.denied",
      actorRole:
        input.actorRole === null || isAdminRole(input.actorRole)
          ? input.actorRole
          : null,
      actorUid: typeof input.actorUid === "string" ? input.actorUid : "",
      metadata:
        input.metadata && typeof input.metadata === "object"
          ? (input.metadata as Record<string, unknown>)
          : {},
      resourceId:
        input.resourceId === null || typeof input.resourceId === "string"
          ? input.resourceId
          : null,
      resourceType:
        typeof input.resourceType === "string" ? input.resourceType : "route",
      result: typeof input.result === "string" ? input.result : "denied",
    }),
  )
  .handler(async ({ data }) => {
    const { writeAdminAuditLog } = await import("./server/audit-log");

    if (!data.actorUid) {
      return;
    }

    await writeAdminAuditLog({
      action: data.action,
      actor: {
        uid: data.actorUid,
        role: data.actorRole,
      },
      metadata: data.metadata,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      result: data.result,
    });
  });

async function auditAccessDenial(
  pathname: string,
  adminSession: AdminSessionState,
) {
  if (!adminSession.isAuthenticated || !adminSession.userId) {
    return;
  }

  await writeAdminAccessAuditLog({
    data: {
      action: "admin.access.denied",
      actorRole: adminSession.role,
      actorUid: adminSession.userId,
      metadata: {
        pathname,
        status: adminSession.status,
      },
      resourceType: "route",
      resourceId: pathname,
      result: "denied",
    },
  });
}

/**
 * Redirects away from protected admin routes when the viewer is not an active admin.
 */
export async function requireActiveAdmin(
  pathname: string,
  readAdminSession: () => Promise<AdminSessionState> = getAdminSession,
) {
  if (isAdminPublicRoute(pathname)) {
    return;
  }

  const adminSession = await readAdminSession();

  if (!adminSession.isAuthenticated) {
    throw redirect({
      params: getAdminAuthRouteParams(),
      search: getAdminAuthRouteSearch(),
      to: ADMIN_SIGN_IN_ROUTE_PATH,
    });
  }

  if (!adminSession.isActiveAdmin) {
    await auditAccessDenial(pathname, adminSession);
    throw redirect({
      params: getAdminAuthRouteParams(),
      search: getAdminAuthRouteSearch({
        error: "invalid-credentials",
      }),
      to: ADMIN_SIGN_IN_ROUTE_PATH,
    });
  }
}

/**
 * Redirects active admins away from sign-in entry routes.
 */
export async function enforceSignedOutAdmin(
  pathname: string,
  readAdminSession: () => Promise<AdminSessionState> = getAdminSession,
) {
  const normalizedPath = normalizeAdminPathname(pathname);
  if (normalizedPath === ADMIN_SIGN_OUT_ROUTE_PATH) {
    return;
  }

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
