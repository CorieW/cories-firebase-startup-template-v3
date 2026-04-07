/**
 * Audit-log query helpers for the admin audit page.
 */
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { AdminAuditLogRecord } from "@cories-firebase-startup-template-v3/common";
import {
  ADMIN_AUDIT_PAGE_SIZE,
  getPaginationSliceBounds,
  paginateItems,
  type AdminPaginatedResult,
} from "../pagination";
import { getAdminAuditLogsPath } from "@cories-firebase-startup-template-v3/common";
import { firestore } from "./auth-server.firebase";
import {
  serializeAdminAuditLog,
  type AdminAuditActor,
  type SerializedAdminAuditLog,
} from "./audit-log";

const AUDIT_QUERY_BATCH_SIZE = 100;
const MAX_AUDIT_SCAN_ROWS = 500;

export interface AuditFilters {
  action?: string;
  actor?: string;
  from?: string;
  resourceType?: string;
  to?: string;
}

function matchesFilter(
  value: string | null | undefined,
  filter: string | undefined,
) {
  if (!filter) {
    return true;
  }

  return value?.toLowerCase().includes(filter.toLowerCase()) ?? false;
}

function isWithinDateRange(
  occurredAt: string | null,
  from: string | undefined,
  to: string | undefined,
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

  if (
    fromTimestamp !== null &&
    !Number.isNaN(fromTimestamp) &&
    timestamp < fromTimestamp
  ) {
    return false;
  }

  if (
    toTimestamp !== null &&
    !Number.isNaN(toTimestamp) &&
    timestamp > toTimestamp
  ) {
    return false;
  }

  return true;
}

/**
 * Filters serialized audit entries client-side to avoid fragile composite index requirements.
 */
export function filterAuditEntries<
  T extends {
    action: string;
    actorUid: string;
    occurredAt: string | null;
    resourceType: string;
  },
>(entries: T[], filters: AuditFilters) {
  return entries.filter((entry) => {
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
  page: number;
}): Promise<AdminPaginatedResult<SerializedAdminAuditLog>> {
  const { endIndex } = getPaginationSliceBounds(
    input.page,
    ADMIN_AUDIT_PAGE_SIZE,
  );
  const requiredMatchCount = endIndex + 1;
  const filteredEntries: SerializedAdminAuditLog[] = [];
  let lastDoc: QueryDocumentSnapshot | null = null;
  let scannedRows = 0;

  while (
    filteredEntries.length < requiredMatchCount &&
    scannedRows < MAX_AUDIT_SCAN_ROWS
  ) {
    const batchSize = Math.min(
      AUDIT_QUERY_BATCH_SIZE,
      MAX_AUDIT_SCAN_ROWS - scannedRows,
    );
    let query = firestore
      .collection(getAdminAuditLogsPath())
      .orderBy("occurredAt", "desc")
      .limit(batchSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      break;
    }

    scannedRows += snapshot.docs.length;
    lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

    filteredEntries.push(
      ...filterAuditEntries(
        snapshot.docs.map((doc) =>
          serializeAdminAuditLog({
            id: doc.id,
            data: doc.data() as AdminAuditLogRecord,
          }),
        ),
        input.filters,
      ),
    );

    if (snapshot.docs.length < batchSize) {
      break;
    }
  }

  return paginateItems(filteredEntries, input.page, ADMIN_AUDIT_PAGE_SIZE);
}
