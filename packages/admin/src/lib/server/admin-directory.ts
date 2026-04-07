/**
 * Admin directory helpers for allowlist records and session normalization.
 */
import {
  getAppAdminPath,
  type AdminPermission,
  type AdminRole,
  type AdminStatus,
  type AppAdminRecord,
} from '@cories-firebase-startup-template-v3/common';
import type { User } from 'better-auth';
import { resolveAdminPermissions } from '../admin-permissions';
import { firestore } from './auth-server.firebase';
import { serializeFirestoreRecord, toIsoString } from './firestore-serialization';

export interface ResolvedAdminRecord {
  uid: string;
  role: AdminRole;
  status: AdminStatus;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface AdminSessionState {
  isAuthenticated: boolean;
  isActiveAdmin: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: AdminRole | null;
  status: AdminStatus | null;
  permissions: AdminPermission[];
  adminRecord: ResolvedAdminRecord | null;
}

/**
 * Reads a single allowlisted admin record by uid.
 */
export async function getAdminRecord(
  uid: string
): Promise<ResolvedAdminRecord | null> {
  const snapshot = await firestore.doc(getAppAdminPath(uid)).get();
  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as AppAdminRecord;

  return {
    uid,
    role: data.role,
    status: data.status,
    notes: typeof data.notes === 'string' ? data.notes : null,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : null,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : null,
  };
}

/**
 * Builds the normalized session shape consumed by route guards and the shell.
 */
export function buildAdminSessionState(input: {
  adminRecord: ResolvedAdminRecord | null;
  user: Pick<User, 'email' | 'id' | 'name'> | null;
}): AdminSessionState {
  const { adminRecord, user } = input;
  const isAuthenticated = Boolean(user);
  const role = adminRecord?.role ?? null;
  const status = adminRecord?.status ?? null;
  const permissions = role ? resolveAdminPermissions(role) : [];
  const isActiveAdmin = Boolean(adminRecord && status === 'active');

  return {
    isAuthenticated,
    isActiveAdmin,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    name: user?.name ?? null,
    role,
    status,
    permissions,
    adminRecord,
  };
}

/**
 * Creates a plain JSON snapshot of a raw admin record for debug views and tests.
 */
export function serializeAdminRecord(
  value: Record<string, unknown> | null | undefined
) {
  return serializeFirestoreRecord(value);
}

