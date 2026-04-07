/**
 * Organization directory and detail data loaders for the admin app.
 */
import {
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  getOrganizationPath,
  getSearchPrefixBounds,
  normalizeSearchValue,
} from '@cories-firebase-startup-template-v3/common';
import { firestore } from './auth-server.firebase';
import { writeAdminAuditLog, type AdminAuditActor } from './audit-log';
import { serializeFirestoreRecord, toIsoString } from './firestore-serialization';

export interface AdminOrganizationDirectoryItem {
  createdAt: string | null;
  id: string;
  memberCount: number;
  name: string | null;
  slug: string | null;
}

export interface AdminOrganizationMember {
  createdAt: string | null;
  email: string | null;
  id: string;
  name: string | null;
  role: string | null;
  userId: string | null;
}

export interface AdminOrganizationDetail {
  id: string;
  memberRoleCounts: Record<string, number>;
  members: AdminOrganizationMember[];
  organization: Record<string, unknown> | null;
}

function toDirectoryItem(input: {
  memberCount?: number;
  organization: Record<string, unknown>;
  organizationId: string;
}): AdminOrganizationDirectoryItem {
  return {
    id: input.organizationId,
    name:
      typeof input.organization.name === 'string' ? input.organization.name : null,
    slug:
      typeof input.organization.slug === 'string' ? input.organization.slug : null,
    createdAt: toIsoString(input.organization.createdAt),
    memberCount: input.memberCount ?? 0,
  };
}

/**
 * Lists organizations for the admin directory with exact-id and prefix search support.
 */
export async function loadOrganizationDirectory(searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) {
    const snapshot = await firestore
      .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .orderBy('createdAt', 'desc')
      .limit(25)
      .get();

    return snapshot.docs.map(doc =>
      toDirectoryItem({
        organization: doc.data(),
        organizationId: doc.id,
      })
    );
  }

  const [exactSnapshot, nameSnapshot] = await Promise.all([
    firestore.doc(getOrganizationPath(normalizedSearch)).get(),
    firestore
      .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .orderBy('nameSearch')
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .limit(20)
      .get(),
  ]);

  const items: AdminOrganizationDirectoryItem[] = [];

  if (exactSnapshot.exists) {
    items.push(
      toDirectoryItem({
        organization: exactSnapshot.data() as Record<string, unknown>,
        organizationId: exactSnapshot.id,
      })
    );
  }

  for (const doc of nameSnapshot.docs) {
    if (items.some(item => item.id === doc.id)) {
      continue;
    }

    items.push(
      toDirectoryItem({
        organization: doc.data(),
        organizationId: doc.id,
      })
    );
  }

  return items;
}

/**
 * Loads a single organization detail view and records the sensitive audit read.
 */
export async function loadOrganizationDetail(input: {
  actor: AdminAuditActor;
  organizationId: string;
}): Promise<AdminOrganizationDetail | null> {
  const organizationSnapshot = await firestore
    .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
    .doc(input.organizationId)
    .get();

  if (!organizationSnapshot.exists) {
    return null;
  }

  const memberSnapshot = await firestore
    .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.member)
    .where('organizationId', '==', input.organizationId)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  const memberUserIds = memberSnapshot.docs
    .map(doc => doc.data().userId)
    .filter((value): value is string => typeof value === 'string');

  const authUserSnapshots = await Promise.all(
    memberUserIds.map(userId =>
      firestore.collection('auth_users').doc(userId).get()
    )
  );

  const authUsers = new Map(
    authUserSnapshots
      .filter(snapshot => snapshot.exists)
      .map(snapshot => [snapshot.id, snapshot.data() as Record<string, unknown>])
  );

  const memberRoleCounts: Record<string, number> = {};
  const members: AdminOrganizationMember[] = memberSnapshot.docs.map(doc => {
    const data = doc.data();
    const role = typeof data.role === 'string' ? data.role : 'unknown';
    const userId = typeof data.userId === 'string' ? data.userId : null;
    const authUser = userId ? authUsers.get(userId) : null;

    memberRoleCounts[role] = (memberRoleCounts[role] ?? 0) + 1;

    return {
      id: doc.id,
      userId,
      role,
      createdAt: toIsoString(data.createdAt),
      name: typeof authUser?.name === 'string' ? authUser.name : null,
      email: typeof authUser?.email === 'string' ? authUser.email : null,
    };
  });

  await writeAdminAuditLog({
    action: 'admin.organization.view',
    actor: input.actor,
    resourceType: 'organization',
    resourceId: input.organizationId,
    result: 'success',
  });

  return {
    id: input.organizationId,
    organization: serializeFirestoreRecord(organizationSnapshot.data()),
    members,
    memberRoleCounts,
  };
}

