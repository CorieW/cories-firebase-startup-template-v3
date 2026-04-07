/**
 * Shared admin role, status, and Firestore document contracts.
 */
export const ADMIN_ROLES = ['admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Checks whether a Firestore value matches the supported admin role contract.
 */
export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);
}

export const ADMIN_STATUSES = ['active', 'disabled'] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

/**
 * Checks whether a Firestore value matches the supported admin status contract.
 */
export function isAdminStatus(value: unknown): value is AdminStatus {
  return (
    typeof value === 'string' && ADMIN_STATUSES.includes(value as AdminStatus)
  );
}

export interface AppAdminRecord {
  role: AdminRole;
  status: AdminStatus;
  notes: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface AdminAuditLogRecord {
  actorUid: string;
  actorRole: AdminRole | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  result: string;
  requestId: string;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  occurredAt: unknown;
}
