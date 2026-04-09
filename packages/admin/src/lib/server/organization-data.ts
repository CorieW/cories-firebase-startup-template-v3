/**
 * Organization directory and detail data loaders for the admin app.
 */
import {
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  getOrganizationPath,
  getSearchPrefixBounds,
  normalizeSearchValue,
} from "@cories-firebase-startup-template-v3/common";
import type {
  Balance,
  ListCustomersList,
  ListCustomersSubscription,
} from "autumn-js";
import { AutumnError } from "autumn-js";
import {
  ADMIN_DIRECTORY_PAGE_SIZE,
  getPaginationOffset,
  paginateItems,
  type AdminPaginatedResult,
} from "../pagination";
import { firestore } from "./auth-server.firebase";
import { writeAdminAuditLog, type AdminAuditActor } from "./audit-log";
import { findAutumnCustomerById, getAutumnAdminClient } from "./billing-data";
import {
  serializeFirestoreRecord,
  type SerializedFirestoreRecord,
  toIsoString,
} from "./firestore-serialization";

const AUTUMN_ORGANIZATION_CUSTOMER_SCOPE = "org";
const AUTUMN_WALLET_FEATURE_ID = "usd_credits";

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

export interface AdminOrganizationAutumnSubscription {
  addOn: boolean;
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  currentPeriodStart: string | null;
  expiresAt: string | null;
  id: string;
  pastDue: boolean;
  planId: string;
  planName: string | null;
  quantity: number;
  startedAt: string | null;
  status: string;
  trialEndsAt: string | null;
}

export type AdminOrganizationBillingStatus =
  | "error"
  | "missing-customer"
  | "missing-wallet"
  | "not-configured"
  | "rate-limited"
  | "ready";

export interface AdminOrganizationWalletBalance {
  featureId: string;
  featureName: string | null;
  granted: number;
  nextResetAt: string | null;
  remaining: number;
  usage: number;
}

export interface AdminOrganizationBillingSummary {
  customerId: string;
  status: AdminOrganizationBillingStatus;
  walletBalance: AdminOrganizationWalletBalance | null;
}

export interface AdminOrganizationDetail {
  autumnSubscriptions: AdminOrganizationAutumnSubscription[];
  billing: AdminOrganizationBillingSummary;
  id: string;
  memberRoleCounts: Record<string, number>;
  members: AdminOrganizationMember[];
  organization: SerializedFirestoreRecord | null;
}

function toDirectoryItem(input: {
  memberCount?: number;
  organization: Record<string, unknown>;
  organizationId: string;
}): AdminOrganizationDirectoryItem {
  return {
    id: input.organizationId,
    name:
      typeof input.organization.name === "string"
        ? input.organization.name
        : null,
    slug:
      typeof input.organization.slug === "string"
        ? input.organization.slug
        : null,
    createdAt: toIsoString(input.organization.createdAt),
    memberCount: input.memberCount ?? 0,
  };
}

/**
 * Builds the Autumn customer id used for an organization wallet.
 */
function getAutumnOrganizationCustomerId(organizationId: string): string {
  return `${AUTUMN_ORGANIZATION_CUSTOMER_SCOPE}-${organizationId}`;
}

function toAutumnIsoString(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value).toISOString();
}

function getWalletBalance(
  customer: Pick<ListCustomersList, "balances">,
): Balance | null {
  const directBalance = customer.balances?.[AUTUMN_WALLET_FEATURE_ID];
  if (directBalance) {
    return directBalance;
  }

  return (
    Object.values(customer.balances ?? {}).find((balance) => {
      return (
        balance.featureId === AUTUMN_WALLET_FEATURE_ID ||
        balance.feature?.id === AUTUMN_WALLET_FEATURE_ID
      );
    }) ?? null
  );
}

function serializeOrganizationWalletBalance(
  balance: Balance,
): AdminOrganizationWalletBalance {
  return {
    featureId: balance.featureId,
    featureName: balance.feature?.name ?? null,
    granted: balance.granted,
    nextResetAt: toAutumnIsoString(balance.nextResetAt),
    remaining: balance.remaining,
    usage: balance.usage,
  };
}

function serializeAutumnSubscription(
  subscription: ListCustomersSubscription,
): AdminOrganizationAutumnSubscription {
  return {
    id: subscription.id,
    planId: subscription.planId,
    planName: subscription.plan?.name ?? null,
    status: subscription.status,
    quantity: subscription.quantity,
    addOn: subscription.addOn,
    pastDue: subscription.pastDue,
    startedAt: toAutumnIsoString(subscription.startedAt),
    currentPeriodStart: toAutumnIsoString(subscription.currentPeriodStart),
    currentPeriodEnd: toAutumnIsoString(subscription.currentPeriodEnd),
    trialEndsAt: toAutumnIsoString(subscription.trialEndsAt),
    expiresAt: toAutumnIsoString(subscription.expiresAt),
    canceledAt: toAutumnIsoString(subscription.canceledAt),
  };
}

function summarizeOrganizationBilling(input: {
  customerId: string;
  customers: ListCustomersList[];
}): AdminOrganizationBillingSummary {
  const customer =
    input.customers.find((entry) => entry.id === input.customerId) ?? null;

  if (!customer) {
    return {
      customerId: input.customerId,
      status: "missing-customer",
      walletBalance: null,
    };
  }

  const walletBalance = getWalletBalance(customer);
  if (!walletBalance) {
    return {
      customerId: input.customerId,
      status: "missing-wallet",
      walletBalance: null,
    };
  }

  return {
    customerId: input.customerId,
    status: "ready",
    walletBalance: serializeOrganizationWalletBalance(walletBalance),
  };
}

function isAutumnRateLimitError(error: unknown): boolean {
  return error instanceof AutumnError && error.statusCode === 429;
}

async function loadAdminOrganizationAutumnDetail(
  organizationId: string,
): Promise<{
  billing: AdminOrganizationBillingSummary;
  subscriptions: AdminOrganizationAutumnSubscription[];
}> {
  const customerId = getAutumnOrganizationCustomerId(organizationId);
  const client = getAutumnAdminClient();

  if (!client) {
    return {
      billing: {
        customerId,
        status: "not-configured",
        walletBalance: null,
      },
      subscriptions: [],
    };
  }

  try {
    const customer = await findAutumnCustomerById({
      client,
      customerId,
    });
    const billing = summarizeOrganizationBilling({
      customerId,
      customers: customer ? [customer] : [],
    });

    if (!customer) {
      return {
        billing,
        subscriptions: [],
      };
    }

    return {
      billing,
      subscriptions: customer.subscriptions.map(serializeAutumnSubscription),
    };
  } catch (error) {
    return {
      billing: {
        customerId,
        status: isAutumnRateLimitError(error) ? "rate-limited" : "error",
        walletBalance: null,
      },
      subscriptions: [],
    };
  }
}

/**
 * Lists organizations for the admin directory with exact-id and prefix search support.
 */
export async function loadOrganizationDirectory(input: {
  page: number;
  searchTerm: string;
}): Promise<AdminPaginatedResult<AdminOrganizationDirectoryItem>> {
  const exactSearch = input.searchTerm.trim();
  const normalizedSearch = normalizeSearchValue(exactSearch);

  if (!normalizedSearch) {
    const [snapshot, totalSnapshot] = await Promise.all([
      firestore
        .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
        .orderBy("createdAt", "desc")
        .offset(getPaginationOffset(input.page, ADMIN_DIRECTORY_PAGE_SIZE))
        .limit(ADMIN_DIRECTORY_PAGE_SIZE + 1)
        .get(),
      firestore
        .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
        .count()
        .get(),
    ]);

    return {
      hasNextPage: snapshot.docs.length > ADMIN_DIRECTORY_PAGE_SIZE,
      items: snapshot.docs.slice(0, ADMIN_DIRECTORY_PAGE_SIZE).map((doc) =>
        toDirectoryItem({
          organization: doc.data(),
          organizationId: doc.id,
        }),
      ),
      page: input.page,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      totalCount: totalSnapshot.data().count,
    };
  }

  const [exactSnapshot, nameSnapshot] = await Promise.all([
    firestore.doc(getOrganizationPath(exactSearch)).get(),
    firestore
      .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .orderBy("nameSearch")
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .get(),
  ]);

  const items: AdminOrganizationDirectoryItem[] = [];

  if (exactSnapshot.exists) {
    items.push(
      toDirectoryItem({
        organization: exactSnapshot.data() as Record<string, unknown>,
        organizationId: exactSnapshot.id,
      }),
    );
  }

  for (const doc of nameSnapshot.docs) {
    if (items.some((item) => item.id === doc.id)) {
      continue;
    }

    items.push(
      toDirectoryItem({
        organization: doc.data(),
        organizationId: doc.id,
      }),
    );
  }

  return paginateItems(items, input.page, ADMIN_DIRECTORY_PAGE_SIZE);
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

  const [memberSnapshot, autumnDetail] = await Promise.all([
    firestore
      .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.member)
      .where("organizationId", "==", input.organizationId)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get(),
    loadAdminOrganizationAutumnDetail(input.organizationId),
  ]);
  const { billing, subscriptions } = autumnDetail;

  const memberUserIds = memberSnapshot.docs
    .map((doc) => doc.data().userId)
    .filter((value): value is string => typeof value === "string");

  const authUserSnapshots = await Promise.all(
    memberUserIds.map((userId) =>
      firestore.collection("auth_users").doc(userId).get(),
    ),
  );

  const authUsers = new Map(
    authUserSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [
        snapshot.id,
        snapshot.data() as Record<string, unknown>,
      ]),
  );

  const memberRoleCounts: Record<string, number> = {};
  const members: AdminOrganizationMember[] = memberSnapshot.docs.map((doc) => {
    const data = doc.data();
    const role = typeof data.role === "string" ? data.role : "unknown";
    const userId = typeof data.userId === "string" ? data.userId : null;
    const authUser = userId ? authUsers.get(userId) : null;

    memberRoleCounts[role] = (memberRoleCounts[role] ?? 0) + 1;

    return {
      id: doc.id,
      userId,
      role,
      createdAt: toIsoString(data.createdAt),
      name: typeof authUser?.name === "string" ? authUser.name : null,
      email: typeof authUser?.email === "string" ? authUser.email : null,
    };
  });
  const hasWalletBalance = Boolean(billing.walletBalance);

  await writeAdminAuditLog({
    action: "admin.organization.view",
    actor: input.actor,
    metadata: {
      billingStatus: billing.status,
      hasWalletBalance,
    },
    resourceType: "organization",
    resourceId: input.organizationId,
    result: "success",
  });

  return {
    autumnSubscriptions: subscriptions,
    billing,
    id: input.organizationId,
    organization: serializeFirestoreRecord(organizationSnapshot.data()),
    members,
    memberRoleCounts,
  };
}
