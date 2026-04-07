/**
 * Autumn-backed read-only billing data loaders for the admin app.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from "@cories-firebase-startup-template-v3/common";
import { Autumn, AutumnError } from "autumn-js";
import type { ListCustomersList } from "autumn-js";
import { ADMIN_DIRECTORY_PAGE_SIZE, getPaginationOffset } from "../pagination";
import { writeAdminAuditLog, type AdminAuditActor } from "./audit-log";
import { getAutumnBaseUrl, getAutumnSecretKey } from "./env";

const AUTUMN_CUSTOMER_SEARCH_PAGE_SIZE = 1_000;
const AUTUMN_REQUEST_TIMEOUT_MS = 10_000;
const AUTUMN_RETRY_CONFIG = {
  strategy: "backoff" as const,
  retryConnectionErrors: true,
  backoff: {
    initialInterval: 250,
    maxElapsedTime: 5_000,
    maxInterval: 2_000,
    exponent: 2,
  },
};

const billingLogger = createScopedLogger("ADMIN_BILLING");

export interface AdminBillingCustomer {
  balances: Record<string, unknown>;
  createdAt: string | null;
  email: string | null;
  id: string;
  name: string | null;
  purchases: number;
  subscriptions: number;
}

export interface BillingData {
  customers: AdminBillingCustomer[];
  errorMessage: string | null;
  errorTitle: string | null;
  hasNextPage: boolean;
  isAvailable: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalCount: number;
}

/**
 * Returns a configured Autumn client when billing access is available.
 */
export function getAutumnAdminClient() {
  const secretKey = getAutumnSecretKey();
  if (!secretKey) {
    return null;
  }

  return new Autumn({
    secretKey,
    retryConfig: AUTUMN_RETRY_CONFIG,
    timeoutMs: AUTUMN_REQUEST_TIMEOUT_MS,
    ...(getAutumnBaseUrl() ? { serverURL: getAutumnBaseUrl() } : {}),
  });
}

function isAutumnRateLimitError(error: unknown): boolean {
  return error instanceof AutumnError && error.statusCode === 429;
}

function getAutumnRequestFailure(input: {
  error: unknown;
  operation: string;
}): {
  message: string;
  title: string;
} {
  if (isAutumnRateLimitError(input.error)) {
    return {
      title: "Autumn rate limit reached",
      message:
        "The admin app reached Autumn request limits while loading billing data. Wait a moment, then try again.",
    };
  }

  billingLogger.log(
    "AUTUMN_REQUEST_ERROR",
    {
      operation: input.operation,
      error: serializeErrorForLogging(input.error),
    },
    "error",
  );

  return {
    title: "Autumn lookup failed",
    message:
      "The admin app hit an error while loading Autumn data. Check the billing credentials and server logs, then try again.",
  };
}

/**
 * Finds an exact Autumn customer match even when the search endpoint returns a
 * large fuzzy result set for shared user or organization prefixes.
 */
export async function findAutumnCustomerById(input: {
  client: Autumn;
  customerId: string;
}): Promise<ListCustomersList | null> {
  let offset = 0;

  while (true) {
    const response = await input.client.customers.list({
      limit: AUTUMN_CUSTOMER_SEARCH_PAGE_SIZE,
      offset,
      search: input.customerId,
    });
    const customer =
      response.list.find((entry) => entry.id === input.customerId) ?? null;

    if (customer) {
      return customer;
    }

    if (!response.hasMore || response.list.length === 0) {
      return null;
    }

    offset += response.list.length;
  }
}

function serializeBillingCustomer(
  customer: ListCustomersList,
): AdminBillingCustomer {
  return {
    id: customer.id ?? "unknown",
    name: customer.name ?? null,
    email: customer.email ?? null,
    createdAt: customer.createdAt
      ? new Date(customer.createdAt).toISOString()
      : null,
    subscriptions: customer.subscriptions.length,
    purchases: customer.purchases.length,
    balances: customer.balances as Record<string, unknown>,
  };
}

/**
 * Loads read-only billing results or an unavailable state when Autumn is not configured.
 */
export async function loadBillingData(input: {
  actor: AdminAuditActor;
  page: number;
  searchTerm: string;
}): Promise<BillingData> {
  const client = getAutumnAdminClient();

  if (!client) {
    await writeAdminAuditLog({
      action: "admin.billing.view",
      actor: input.actor,
      resourceType: "billing",
      resourceId: null,
      result: "unavailable",
    });

    return {
      customers: [],
      errorMessage: null,
      errorTitle: null,
      hasNextPage: false,
      isAvailable: false,
      page: input.page,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      total: 0,
      totalCount: 0,
    };
  }

  try {
    const response = await client.customers.list({
      limit: ADMIN_DIRECTORY_PAGE_SIZE,
      offset: getPaginationOffset(input.page, ADMIN_DIRECTORY_PAGE_SIZE),
      search: input.searchTerm || undefined,
    });

    await writeAdminAuditLog({
      action: "admin.billing.view",
      actor: input.actor,
      metadata: {
        hasSearch: Boolean(input.searchTerm),
      },
      resourceType: "billing",
      resourceId: null,
      result: "success",
    });

    return {
      customers: response.list.map(serializeBillingCustomer),
      errorMessage: null,
      errorTitle: null,
      hasNextPage:
        input.page * ADMIN_DIRECTORY_PAGE_SIZE < response.totalFilteredCount,
      isAvailable: true,
      page: input.page,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      total: response.total,
      totalCount: response.totalFilteredCount,
    };
  } catch (error) {
    const failure = getAutumnRequestFailure({
      error,
      operation: "loadBillingData",
    });

    await writeAdminAuditLog({
      action: "admin.billing.view",
      actor: input.actor,
      metadata: {
        hasSearch: Boolean(input.searchTerm),
        errorTitle: failure.title,
      },
      resourceType: "billing",
      resourceId: null,
      result: "error",
    });

    return {
      customers: [],
      errorMessage: failure.message,
      errorTitle: failure.title,
      hasNextPage: false,
      isAvailable: true,
      page: input.page,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      total: 0,
      totalCount: 0,
    };
  }
}
