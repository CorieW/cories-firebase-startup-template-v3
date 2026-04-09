/**
 * Autumn-backed billing client helpers shared by admin detail loaders.
 */
import { Autumn } from "autumn-js";
import type { ListCustomersList } from "autumn-js";
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
