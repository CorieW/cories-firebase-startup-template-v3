/**
 * Autumn-backed read-only billing data loaders for the admin app.
 */
import { Autumn } from 'autumn-js';
import type { ListCustomersList } from 'autumn-js';
import { writeAdminAuditLog, type AdminAuditActor } from './audit-log';
import { getAutumnBaseUrl, getAutumnSecretKey } from './env';

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
  isAvailable: boolean;
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
    serverURL: getAutumnBaseUrl(),
  });
}

function serializeBillingCustomer(customer: ListCustomersList): AdminBillingCustomer {
  return {
    id: customer.id,
    name: customer.name ?? null,
    email: customer.email ?? null,
    createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : null,
    subscriptions: customer.subscriptions.length,
    purchases: customer.purchases.length,
    balances: customer.balances,
  };
}

/**
 * Loads read-only billing results or an unavailable state when Autumn is not configured.
 */
export async function loadBillingData(input: {
  actor: AdminAuditActor;
  searchTerm: string;
}): Promise<BillingData> {
  const client = getAutumnAdminClient();

  if (!client) {
    await writeAdminAuditLog({
      action: 'admin.billing.view',
      actor: input.actor,
      resourceType: 'billing',
      resourceId: null,
      result: 'unavailable',
    });

    return {
      isAvailable: false,
      customers: [],
      total: 0,
      totalCount: 0,
    };
  }

  const response = await client.customers.list({
    limit: 25,
    offset: 0,
    search: input.searchTerm || undefined,
  });

  await writeAdminAuditLog({
    action: 'admin.billing.view',
    actor: input.actor,
    metadata: {
      hasSearch: Boolean(input.searchTerm),
    },
    resourceType: 'billing',
    resourceId: null,
    result: 'success',
  });

  return {
    isAvailable: true,
    customers: response.list.map(serializeBillingCustomer),
    total: response.total,
    totalCount: response.totalFilteredCount,
  };
}

