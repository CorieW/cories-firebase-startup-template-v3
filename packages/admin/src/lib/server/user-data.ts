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
import {
  findAutumnCustomerById,
  getAutumnAdminClient,
} from "./billing-data";
import {
  serializeFirestoreRecord,
  type SerializedFirestoreRecord,
  toIsoString,
} from "./firestore-serialization";

const AUTUMN_USER_CUSTOMER_SCOPE = "user";
const AUTUMN_WALLET_FEATURE_ID = "usd_credits";

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

export interface AdminUserAutumnSubscription {
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

export interface AdminUserDetail {
  appUser: SerializedFirestoreRecord | null;
  authUser: SerializedFirestoreRecord | null;
  autumnSubscriptions: AdminUserAutumnSubscription[];
  billing: AdminUserBillingSummary;
  id: string;
  memberships: AdminUserMembership[];
}

export type AdminUserBillingStatus =
  | "error"
  | "missing-customer"
  | "missing-wallet"
  | "not-configured"
  | "rate-limited"
  | "ready";

export interface AdminUserWalletBalance {
  featureId: string;
  featureName: string | null;
  granted: number;
  nextResetAt: string | null;
  remaining: number;
  usage: number;
}

export interface AdminUserBillingSummary {
  customerId: string;
  status: AdminUserBillingStatus;
  walletBalance: AdminUserWalletBalance | null;
}

function dedupeDirectoryItems(items: AdminUserDirectoryItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
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
      typeof input.authUser.email === "string" ? input.authUser.email : null,
    name: typeof input.authUser.name === "string" ? input.authUser.name : null,
    image:
      typeof input.authUser.image === "string" ? input.authUser.image : null,
    createdAt: toIsoString(input.authUser.createdAt),
    memberCount: input.memberCount ?? 0,
  };
}

/**
 * Builds the Autumn customer id used for a personal user wallet.
 */
export function getAutumnUserCustomerId(userId: string): string {
  return `${AUTUMN_USER_CUSTOMER_SCOPE}-${userId}`;
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

function serializeUserWalletBalance(balance: Balance): AdminUserWalletBalance {
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
): AdminUserAutumnSubscription {
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

/**
 * Normalizes a searched Autumn customer list into the wallet state shown on
 * the admin user detail page.
 */
export function summarizeAdminUserBilling(input: {
  customerId: string;
  customers: ListCustomersList[];
}): AdminUserBillingSummary {
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
    walletBalance: serializeUserWalletBalance(walletBalance),
  };
}

function isAutumnRateLimitError(error: unknown): boolean {
  return error instanceof AutumnError && error.statusCode === 429;
}

/**
 * Reads the personal Autumn wallet state for an admin user detail page.
 */
async function loadAdminUserAutumnDetail(userId: string): Promise<{
  billing: AdminUserBillingSummary;
  subscriptions: AdminUserAutumnSubscription[];
}> {
  const customerId = getAutumnUserCustomerId(userId);
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
    const billing = summarizeAdminUserBilling({
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
 * Lists users for the admin directory with exact-id and prefix search support.
 */
export async function loadUserDirectory(input: {
  page: number;
  searchTerm: string;
}): Promise<AdminPaginatedResult<AdminUserDirectoryItem>> {
  const exactSearch = input.searchTerm.trim();
  const normalizedSearch = normalizeSearchValue(exactSearch);

  if (!normalizedSearch) {
    const [snapshot, totalSnapshot] = await Promise.all([
      firestore
        .collection(BETTER_AUTH_COLLECTIONS.users)
        .orderBy("createdAt", "desc")
        .offset(getPaginationOffset(input.page, ADMIN_DIRECTORY_PAGE_SIZE))
        .limit(ADMIN_DIRECTORY_PAGE_SIZE + 1)
        .get(),
      firestore.collection(BETTER_AUTH_COLLECTIONS.users).count().get(),
    ]);

    return {
      hasNextPage: snapshot.docs.length > ADMIN_DIRECTORY_PAGE_SIZE,
      items: snapshot.docs.slice(0, ADMIN_DIRECTORY_PAGE_SIZE).map((doc) =>
        toDirectoryItem({
          authUser: doc.data(),
          userId: doc.id,
        }),
      ),
      page: input.page,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      totalCount: totalSnapshot.data().count,
    };
  }

  const [exactSnapshot, emailSnapshot, nameSnapshot] = await Promise.all([
    firestore.doc(getAuthUserPath(exactSearch)).get(),
    firestore
      .collection(BETTER_AUTH_COLLECTIONS.users)
      .orderBy("emailSearch")
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .get(),
    firestore
      .collection(BETTER_AUTH_COLLECTIONS.users)
      .orderBy("nameSearch")
      .startAt(normalizedSearch)
      .endAt(getSearchPrefixBounds(normalizedSearch)[1])
      .get(),
  ]);

  const items: AdminUserDirectoryItem[] = [];

  if (exactSnapshot.exists) {
    items.push(
      toDirectoryItem({
        authUser: exactSnapshot.data() as Record<string, unknown>,
        userId: exactSnapshot.id,
      }),
    );
  }

  for (const doc of [...emailSnapshot.docs, ...nameSnapshot.docs]) {
    items.push(
      toDirectoryItem({
        authUser: doc.data(),
        userId: doc.id,
      }),
    );
  }

  return paginateItems(
    dedupeDirectoryItems(items),
    input.page,
    ADMIN_DIRECTORY_PAGE_SIZE,
  );
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
        .where("userId", "==", input.userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get(),
    ]);

  if (!authUserSnapshot.exists) {
    return null;
  }

  const organizationIds = membershipSnapshot.docs
    .map((doc) => doc.data().organizationId)
    .filter((value): value is string => typeof value === "string");

  const [organizationSnapshots, autumnDetail] = await Promise.all([
    Promise.all(
      organizationIds.map((organizationId) =>
        firestore
          .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
          .doc(organizationId)
          .get(),
      ),
    ),
    loadAdminUserAutumnDetail(input.userId),
  ]);
  const { billing, subscriptions } = autumnDetail;

  const hasWalletBalance = Boolean(billing.walletBalance);

  await writeAdminAuditLog({
    action: "admin.user.view",
    actor: input.actor,
    metadata: {
      billingStatus: billing.status,
      hasWalletBalance,
    },
    resourceType: "user",
    resourceId: input.userId,
    result: "success",
  });

  const organizationNames = new Map(
    organizationSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [
        snapshot.id,
        typeof snapshot.data()?.name === "string"
          ? (snapshot.data()?.name as string)
          : snapshot.id,
      ]),
  );

  return {
    id: input.userId,
    authUser: serializeFirestoreRecord(authUserSnapshot.data()),
    appUser: serializeFirestoreRecord(appUserSnapshot.data()),
    autumnSubscriptions: subscriptions,
    billing,
    memberships: membershipSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        organizationId:
          typeof data.organizationId === "string" ? data.organizationId : null,
        organizationName:
          typeof data.organizationId === "string"
            ? (organizationNames.get(data.organizationId) ??
              data.organizationId)
            : null,
        role: typeof data.role === "string" ? data.role : null,
        createdAt: toIsoString(data.createdAt),
      };
    }),
  };
}
