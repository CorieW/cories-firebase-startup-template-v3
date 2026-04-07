/**
 * Audit-log query helpers for the admin audit page.
 */
import { getAdminAuditLogsPath } from '@cories-firebase-startup-template-v3/common';
import { firestore } from './auth-server.firebase';
import { serializeAdminAuditLog, type AdminAuditActor } from './audit-log';

export interface AuditFilters {
  action?: string;
  actor?: string;
  from?: string;
  resourceType?: string;
  to?: string;
}

function matchesFilter(value: string | null | undefined, filter: string | undefined) {
  if (!filter) {
    return true;
  }

  return value?.toLowerCase().includes(filter.toLowerCase()) ?? false;
}

function isWithinDateRange(
  occurredAt: string | null,
  from: string | undefined,
  to: string | undefined
) {
  if (!occurredAt) {
    return !from && !to;
  }

  const timestamp = Date.parse(occurredAt);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  const fromTimestamp = from ? Date.parse(from) : null;
  const toTimestamp = to ? Date.parse(to) : null;

  if (fromTimestamp !== null && !Number.isNaN(fromTimestamp) && timestamp < fromTimestamp) {
    return false;
  }

  if (toTimestamp !== null && !Number.isNaN(toTimestamp) && timestamp > toTimestamp) {
    return false;
  }

  return true;
}

/**
 * Filters serialized audit entries client-side to avoid fragile composite index requirements.
 */
export function filterAuditEntries<T extends {
  action: string;
  actorUid: string;
  occurredAt: string | null;
  resourceType: string;
}>(entries: T[], filters: AuditFilters) {
  return entries.filter(entry => {
    return (
      matchesFilter(entry.actorUid, filters.actor) &&
      matchesFilter(entry.action, filters.action) &&
      matchesFilter(entry.resourceType, filters.resourceType) &&
      isWithinDateRange(entry.occurredAt, filters.from, filters.to)
    );
  });
}

/**
 * Loads recent audit entries and records the audit-page access without logging raw search text.
 */
export async function loadAuditData(input: {
  actor: AdminAuditActor;
  filters: AuditFilters;
}) {
  const snapshot = await firestore
    .collection(getAdminAuditLogsPath())
    .orderBy('occurredAt', 'desc')
    .limit(100)
    .get();

  const entries = snapshot.docs.map(doc =>
    serializeAdminAuditLog({
      id: doc.id,
      data: doc.data(),
    })
  );

  const filteredEntries = filterAuditEntries(entries, input.filters);

  return filteredEntries;
}

