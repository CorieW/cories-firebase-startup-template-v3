/**
 * Admin audit-log persistence and metadata sanitization helpers.
 */
import {
  createScopedLogger,
  getAdminAuditLogsPath,
  sanitizeForLogging,
  serializeErrorForLogging,
  type AdminAuditLogRecord,
  type AdminRole,
} from "@cories-firebase-startup-template-v3/common";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { firestore } from "./auth-server.firebase";
import {
  serializeFirestoreRecord,
  type SerializedFirestoreRecord,
  toIsoString,
} from "./firestore-serialization";

const auditLogger = createScopedLogger("ADMIN_AUDIT");
const REDACTED_AUDIT_VALUE = "[REDACTED]";

export interface AdminAuditActor {
  role: AdminRole | null;
  uid: string;
}

export interface AdminAuditEntry {
  action: string;
  actor: AdminAuditActor;
  metadata?: Record<string, unknown>;
  resourceId?: string | null;
  resourceType: string;
  result: string;
}

export interface SerializedAdminAuditLog {
  actorRole: AdminRole | null;
  actorUid: string;
  action: string;
  id: string;
  ip: string | null;
  metadata: SerializedFirestoreRecord;
  occurredAt: string | null;
  requestId: string;
  resourceId: string | null;
  resourceType: string;
  result: string;
  userAgent: string | null;
}

function isSearchField(fieldName: string): boolean {
  return /search|query/i.test(fieldName);
}

/**
 * Sanitizes metadata before audit persistence so searches and free-form text do
 * not land in immutable audit storage.
 */
function sanitizeAdminAuditMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      isSearchField(key) ? REDACTED_AUDIT_VALUE : sanitizeForLogging(value),
    ]),
  );
}

function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip");
}

/**
 * Persists a single admin audit-log row. Failures are logged but do not block
 * the admin request.
 */
export async function writeAdminAuditLog(
  entry: AdminAuditEntry,
): Promise<void> {
  try {
    const headers = getRequestHeaders();
    const metadata = sanitizeAdminAuditMetadata(entry.metadata);

    await firestore.collection(getAdminAuditLogsPath()).add({
      actorUid: entry.actor.uid,
      actorRole: entry.actor.role,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      result: entry.result,
      requestId: headers.get("x-request-id") ?? crypto.randomUUID(),
      ip: getClientIp(headers),
      userAgent: headers.get("user-agent"),
      metadata,
      occurredAt: new Date(),
    } satisfies AdminAuditLogRecord);
  } catch (error) {
    auditLogger.log(
      "WRITE_ERROR",
      {
        action: entry.action,
        actorUid: entry.actor.uid,
        resourceType: entry.resourceType,
        error: serializeErrorForLogging(error),
      },
      "error",
    );
  }
}

/**
 * Normalizes a stored audit document into loader-safe JSON.
 */
export function serializeAdminAuditLog(input: {
  data: AdminAuditLogRecord;
  id: string;
}): SerializedAdminAuditLog {
  return {
    id: input.id,
    actorUid: input.data.actorUid,
    actorRole: input.data.actorRole,
    action: input.data.action,
    resourceType: input.data.resourceType,
    resourceId:
      typeof input.data.resourceId === "string" ? input.data.resourceId : null,
    result: input.data.result,
    requestId: input.data.requestId,
    ip: typeof input.data.ip === "string" ? input.data.ip : null,
    userAgent:
      typeof input.data.userAgent === "string" ? input.data.userAgent : null,
    metadata: serializeFirestoreRecord(input.data.metadata) ?? {},
    occurredAt: toIsoString(input.data.occurredAt),
  };
}
