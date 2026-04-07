/**
 * Server function wrappers for admin route loaders.
 */
import { createServerFn } from "@tanstack/react-start";
import { getAdminSession } from "./admin-auth";
import { normalizePaginationPage } from "./pagination";

function normalizeSearchValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRequiredId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAuditFilters(input: {
  action?: unknown;
  actor?: unknown;
  from?: unknown;
  resourceType?: unknown;
  to?: unknown;
}) {
  return {
    action: normalizeSearchValue(input.action),
    actor: normalizeSearchValue(input.actor),
    from: normalizeSearchValue(input.from),
    resourceType: normalizeSearchValue(input.resourceType),
    to: normalizeSearchValue(input.to),
  };
}

async function requireAdminAuditActor() {
  const adminSession = await getAdminSession();

  if (!adminSession.isActiveAdmin || !adminSession.userId) {
    throw new Error("Active admin session required.");
  }

  return {
    role: adminSession.role,
    uid: adminSession.userId,
  };
}

/**
 * Returns the overview payload used by the admin home page.
 */
export const loadOverviewDataServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const { loadOverviewData } = await import("./server/overview-data");
    return loadOverviewData();
  },
);

/**
 * Returns user directory rows for the current search term.
 */
export const loadUserDirectoryServer = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { page?: unknown; search?: unknown } | undefined) => ({
      page: normalizePaginationPage(input?.page),
      search: normalizeSearchValue(input?.search),
    }),
  )
  .handler(async ({ data }) => {
    const { loadUserDirectory } = await import("./server/user-data");
    return loadUserDirectory({
      page: data.page,
      searchTerm: data.search,
    });
  });

/**
 * Returns a single user detail payload for the admin detail page.
 */
export const loadUserDetailServer = createServerFn({ method: "GET" })
  .inputValidator((input: { userId?: unknown } | undefined) => ({
    userId: normalizeRequiredId(input?.userId),
  }))
  .handler(async ({ data }) => {
    const actor = await requireAdminAuditActor();
    const { loadUserDetail } = await import("./server/user-data");

    return loadUserDetail({
      actor,
      userId: data.userId,
    });
  });

/**
 * Returns organization directory rows for the current search term.
 */
export const loadOrganizationDirectoryServer = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { page?: unknown; search?: unknown } | undefined) => ({
      page: normalizePaginationPage(input?.page),
      search: normalizeSearchValue(input?.search),
    }),
  )
  .handler(async ({ data }) => {
    const { loadOrganizationDirectory } =
      await import("./server/organization-data");
    return loadOrganizationDirectory({
      page: data.page,
      searchTerm: data.search,
    });
  });

/**
 * Returns a single organization detail payload for the admin detail page.
 */
export const loadOrganizationDetailServer = createServerFn({ method: "GET" })
  .inputValidator((input: { organizationId?: unknown } | undefined) => ({
    organizationId: normalizeRequiredId(input?.organizationId),
  }))
  .handler(async ({ data }) => {
    const actor = await requireAdminAuditActor();
    const { loadOrganizationDetail } =
      await import("./server/organization-data");

    return loadOrganizationDetail({
      actor,
      organizationId: data.organizationId,
    });
  });

/**
 * Returns recent audit entries after applying UI filters.
 */
export const loadAuditDataServer = createServerFn({ method: "GET" })
  .inputValidator(
    (
      input:
        | {
            action?: unknown;
            actor?: unknown;
            from?: unknown;
            page?: unknown;
            resourceType?: unknown;
            to?: unknown;
          }
        | undefined,
    ) => ({
      ...normalizeAuditFilters(input ?? {}),
      page: normalizePaginationPage(input?.page),
    }),
  )
  .handler(async ({ data }) => {
    const actor = await requireAdminAuditActor();
    const { loadAuditData } = await import("./server/audit-data");

    return loadAuditData({
      actor,
      filters: data,
      page: data.page,
    });
  });
