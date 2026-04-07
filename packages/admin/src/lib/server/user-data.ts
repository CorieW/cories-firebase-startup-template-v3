/**
 * User directory and user detail data loaders for the admin app.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  getAuthUserPath,
  getSearchPrefixBounds,
  getUserPath,
  normalizeSearchValue,
} from '@cories-firebase-startup-template-v3/common';
import { firestore } from './auth-server.firebase';
import { writeAdminAuditLog, type AdminAuditActor } from './audit-log';
import { serializeFirestoreRecord, toIsoString } from './firestore-serialization';

export interface AdminUserDirectoryItem {
  createdAt: string | null;
  email: string | null;
  id: string;
  image: string | null;
  memberCount: number;
  name: string | null;
}

export interface AdminUserMembership {
  createdAt: string | null;
  id: string;
  organizationId: string | null;
  organizationName: string | null;
  role: string | null;
}

export interface AdminUserDetail {
  appUser: Record<string, unknown> | null;
  authUser: Record<string, unknown> | null;
  id: string;
  memberships: AdminUserMembership[];
}

function dedupeDirectoryItems(items: AdminUserDirectoryItem[]) {
  const seen = new Set<string>();

  return items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function toDirectoryItem(input: {
  authUser: Record<string, unknown>;
  memberCount?: number;
  userId: string;
}): AdminUserDirectoryItem {
  return {
    id: input.userId,
    email:
      typeof input.authUser.email === 'string' ? input.authUser.email : null,
    name: typeof input.authUser.name === 'string' ? input.authUser.name : null,
    image:
      typeof input.authUser.image === 'string' ? input.authUser.image : null,
    createdAt: toIsoString(input.authUser.createdAt),
    memberCount: input.memberCount ?? 0,
  };
}

/**
 * Lists users for the admin directory with exact-id and prefix search support.
 */
export async function loadUserDirectory(searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) {
    const snapshot = await firestore
      .collection(BETTER_AUTH_COLLECTIONS.users)
      .orderBy('createdAt', 'desc')
      .limit(25)
      .get();

    return snapshot.docs.map(doc =>
      toDirectoryItem({
        authUser: doc.data(),
        userId: doc.id,
      })
    );
  }

  const [exactSnapshot, emailSnapshot, nameSnapshot] = await Promise.all([
    firestore.doc(getAuthUserPath(normalizedSearch)).get(),
    firestore
      .collection(BETTER_AUTH_COLLECTIONS.users)
      .orderBy('emailSearch')
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .limit(10)
      .get(),
    firestore
      .collection(BETTER_AUTH_COLLECTIONS.users)
      .orderBy('nameSearch')
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .limit(10)
      .get(),
  ]);

  const items: AdminUserDirectoryItem[] = [];

  if (exactSnapshot.exists) {
    items.push(
      toDirectoryItem({
        authUser: exactSnapshot.data() as Record<string, unknown>,
        userId: exactSnapshot.id,
      })
    );
  }

  for (const doc of [...emailSnapshot.docs, ...nameSnapshot.docs]) {
    items.push(
      toDirectoryItem({
        authUser: doc.data(),
        userId: doc.id,
      })
    );
  }

  return dedupeDirectoryItems(items);
}

/**
 * Loads a single user detail view and records the sensitive audit read.
 */
export async function loadUserDetail(input: {
  actor: AdminAuditActor;
  userId: string;
}): Promise<AdminUserDetail | null> {
  const [authUserSnapshot, appUserSnapshot, membershipSnapshot] =
    await Promise.all([
      firestore.doc(getAuthUserPath(input.userId)).get(),
      firestore.doc(getUserPath(input.userId)).get(),
      firestore
        .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.member)
        .where('userId', '==', input.userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get(),
    ]);

  if (!authUserSnapshot.exists) {
    return null;
  }

  const organizationIds = membershipSnapshot.docs
    .map(doc => doc.data().organizationId)
    .filter((value): value is string => typeof value === 'string');

  const organizationSnapshots = await Promise.all(
    organizationIds.map(organizationId =>
      firestore
        .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
        .doc(organizationId)
        .get()
    )
  );

  const organizationNames = new Map(
    organizationSnapshots
      .filter(snapshot => snapshot.exists)
      .map(snapshot => [
        snapshot.id,
        typeof snapshot.data()?.name === 'string'
          ? (snapshot.data()?.name as string)
          : snapshot.id,
      ])
  );

  await writeAdminAuditLog({
    action: 'admin.user.view',
    actor: input.actor,
    resourceType: 'user',
    resourceId: input.userId,
    result: 'success',
  });

  return {
    id: input.userId,
    authUser: serializeFirestoreRecord(authUserSnapshot.data()),
    appUser: serializeFirestoreRecord(appUserSnapshot.data()),
    memberships: membershipSnapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        organizationId:
          typeof data.organizationId === 'string' ? data.organizationId : null,
        organizationName:
          typeof data.organizationId === 'string'
            ? (organizationNames.get(data.organizationId) ?? data.organizationId)
            : null,
        role: typeof data.role === 'string' ? data.role : null,
        createdAt: toIsoString(data.createdAt),
      };
    }),
  };
}

