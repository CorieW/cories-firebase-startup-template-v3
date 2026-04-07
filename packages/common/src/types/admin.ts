/**
 * Shared admin roles, permissions, and document contracts.
 */
export const ADMIN_ROLES = [
  'superadmin',
  'ops',
  'billing',
  'support',
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  'overview.read',
  'users.read',
  'organizations.read',
  'billing.read',
  'audit.read',
  'admins.manage',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_STATUSES = ['active', 'disabled'] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

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
