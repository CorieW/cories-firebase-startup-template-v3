/**
 * Overview page data loaders for admin counts and recent audit activity.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  getAdminAuditLogsPath,
  getAppAdminsPath,
} from '@cories-firebase-startup-template-v3/common';
import { getAutumnSecretKey } from './env';
import { firestore } from './auth-server.firebase';
import { serializeAdminAuditLog, type SerializedAdminAuditLog } from './audit-log';

export interface OverviewData {
  billingConfigured: boolean;
  recentAuditLogs: SerializedAdminAuditLog[];
  stats: {
    activeAdmins: number;
    disabledAdmins: number;
    organizations: number;
    users: number;
  };
}

async function getCollectionCount(collectionName: string) {
  const snapshot = await firestore.collection(collectionName).count().get();
  return snapshot.data().count;
}

/**
 * Loads the overview dashboard counts and recent audit activity.
 */
export async function loadOverviewData(): Promise<OverviewData> {
  const [
    users,
    organizations,
    activeAdmins,
    disabledAdmins,
    recentAuditSnapshots,
  ] = await Promise.all([
    getCollectionCount(BETTER_AUTH_COLLECTIONS.users),
    getCollectionCount(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization),
    firestore
      .collection(getAppAdminsPath())
      .where('status', '==', 'active')
      .count()
      .get()
      .then(snapshot => snapshot.data().count),
    firestore
      .collection(getAppAdminsPath())
      .where('status', '==', 'disabled')
      .count()
      .get()
      .then(snapshot => snapshot.data().count),
    firestore
      .collection(getAdminAuditLogsPath())
      .orderBy('occurredAt', 'desc')
      .limit(8)
      .get(),
  ]);

  return {
    stats: {
      users,
      organizations,
      activeAdmins,
      disabledAdmins,
    },
    billingConfigured: Boolean(getAutumnSecretKey()),
    recentAuditLogs: recentAuditSnapshots.docs.map(snapshot =>
      serializeAdminAuditLog({
        id: snapshot.id,
        data: snapshot.data(),
      })
    ),
  };
}

