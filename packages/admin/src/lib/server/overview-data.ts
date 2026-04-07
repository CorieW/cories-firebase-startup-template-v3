/**
 * Overview page data loaders for admin counts and billing availability.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  getAppAdminsPath,
  getAdminAuditLogsPath,
} from "@cories-firebase-startup-template-v3/common";
import { getAutumnSecretKey } from "./env";
import { firestore } from "./auth-server.firebase";

export interface OverviewData {
  billingConfigured: boolean;
  stats: {
    activeAdmins: number;
    audits: number;
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
  const [users, organizations, activeAdmins, disabledAdmins, audits] =
    await Promise.all([
      getCollectionCount(BETTER_AUTH_COLLECTIONS.users),
      getCollectionCount(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization),
      firestore
        .collection(getAppAdminsPath())
        .where("status", "==", "active")
        .count()
        .get()
        .then((snapshot) => snapshot.data().count),
      firestore
        .collection(getAppAdminsPath())
        .where("status", "==", "disabled")
        .count()
        .get()
        .then((snapshot) => snapshot.data().count),
      getCollectionCount(getAdminAuditLogsPath()),
    ]);

  return {
    stats: {
      users,
      organizations,
      activeAdmins,
      audits,
      disabledAdmins,
    },
    billingConfigured: Boolean(getAutumnSecretKey()),
  };
}
