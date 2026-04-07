/**
 * Admin permission resolution helpers shared between routes and server modules.
 */
import type {
  AdminPermission,
  AdminRole,
} from '@cories-firebase-startup-template-v3/common';

export const ADMIN_PERMISSION_MAP: Record<
  AdminRole,
  readonly AdminPermission[]
> = {
  superadmin: [
    'overview.read',
    'users.read',
    'organizations.read',
    'billing.read',
    'audit.read',
    'admins.manage',
  ],
  ops: [
    'overview.read',
    'users.read',
    'organizations.read',
    'billing.read',
    'audit.read',
  ],
  billing: [
    'overview.read',
    'users.read',
    'organizations.read',
    'billing.read',
  ],
  support: ['overview.read', 'users.read', 'organizations.read'],
};

/**
 * Returns the stable permission list for a given admin role.
 */
export function resolveAdminPermissions(role: AdminRole): AdminPermission[] {
  return [...ADMIN_PERMISSION_MAP[role]];
}

/**
 * Checks whether a resolved permission list includes a specific permission.
 */
export function hasAdminPermission(
  permissions: readonly AdminPermission[],
  permission: AdminPermission
): boolean {
  return permissions.includes(permission);
}
