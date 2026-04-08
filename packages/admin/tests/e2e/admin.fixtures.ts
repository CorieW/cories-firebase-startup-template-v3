/**
 * Playwright fixtures for seeded admin end-to-end coverage.
 */
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { Autumn } from 'autumn-js';
import { hashPassword } from 'better-auth/crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  expect,
  request as playwrightRequest,
  test as base,
  type APIRequestContext,
  type APIResponse,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test';
import { getFirestore, type Query } from 'firebase-admin/firestore';

const BETTER_AUTH_COLLECTIONS = {
  accounts: 'auth_accounts',
  sessions: 'auth_sessions',
  users: 'auth_users',
  verificationTokens: 'auth_verification_tokens',
} as const;

const BETTER_AUTH_ORGANIZATION_COLLECTIONS = {
  invitation: 'auth_invitations',
  member: 'auth_members',
  organization: 'auth_organizations',
} as const;

function normalizeSearchValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
}

function buildAuthUserSearchFields(input: {
  email?: string | null;
  name?: string | null;
}) {
  return {
    emailSearch: normalizeSearchValue(input.email),
    nameSearch: normalizeSearchValue(input.name),
  };
}

function buildAuthOrganizationSearchFields(input: { name?: string | null }) {
  return {
    nameSearch: normalizeSearchValue(input.name),
  };
}

function getAdminAuditLogsPath() {
  return 'admin_audit_logs';
}

function getAppAdminPath(userUid: string) {
  return `app_admins/${userUid}`;
}

function getAuthUserPath(userUid: string) {
  return `auth_users/${userUid}`;
}

function getUserPath(userUid: string) {
  return `users/${userUid}`;
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';
const AUTUMN_WALLET_FEATURE_ID = 'usd_credits';
const BILLING_DIRECTORY_CUSTOMER_COUNT = 26;
const GENERIC_BILLING_CUSTOMER_COUNT = 23;
const TEST_AUTH_APP_NAME = 'admin-better-auth-playwright';
const adminEnvPath = new URL('../../.env', import.meta.url);

interface SeededAdminUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  password: string;
}

interface SeededDirectoryUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
}

interface SeededOrganization {
  createdAt: string;
  id: string;
  name: string;
  slug: string;
}

interface SeededMembership {
  createdAt: string;
  id: string;
  organizationId: string;
  role: string;
}

interface SeededAutumnSubscription {
  currentPeriodEnd: string | null;
  id: string;
  planId: string;
  planName: string | null;
  quantity: number;
  startedAt: string | null;
  status: string;
}

interface SeededAutumnWallet {
  featureId: string;
  granted: number;
  nextResetAt: string | null;
  remaining: number;
  usage: number;
}

interface SeededAutumnCustomer {
  createdAt: string | null;
  customerId: string;
  email: string | null;
  name: string | null;
  purchases: number;
  subscriptions: SeededAutumnSubscription[];
  wallet: SeededAutumnWallet | null;
}

interface SeededAutumnBillingData {
  available: true;
  billingSearchPrefix: string;
  directoryCustomerCount: number;
  membershiplessCustomer: SeededAutumnCustomer;
  membershiplessPlanId: null;
  membershiplessPlanName: null;
  organizationCustomer: SeededAutumnCustomer;
  organizationPlanId: string;
  organizationPlanName: string;
  userCustomer: SeededAutumnCustomer;
  userPlanId: string;
  userPlanName: string;
}

export interface SeededAdminData {
  adminUser: SeededAdminUser;
  autumn: SeededAutumnBillingData | null;
  emptyOrganization: SeededOrganization;
  expectedOverviewStats: {
    activeAdmins: number;
    disabledAdmins: number;
    organizations: number;
    users: number;
  };
  membership: SeededMembership;
  membershiplessUser: SeededDirectoryUser;
  organization: SeededOrganization;
  secondaryUser: SeededDirectoryUser;
  subjectUser: SeededDirectoryUser;
}

interface SeededAdminArtifacts {
  cleanup: {
    createdWalletFeature: boolean;
    disabledAdminId: string;
    uniqueId: string;
  };
  seededData: SeededAdminData;
  storageState: Awaited<ReturnType<APIRequestContext['storageState']>>;
}

interface AdminFixtures {
  adminPage: Page;
  seededAdminData: SeededAdminData;
}

interface AutumnCustomerRecord {
  balances?: Record<string, AutumnWalletRecord>;
  createdAt?: number | string | null;
  email?: string | null;
  id: string;
  name?: string | null;
  purchases?: unknown[];
  subscriptions?: AutumnSubscriptionRecord[];
}

interface AutumnSubscriptionRecord {
  currentPeriodEnd?: number | string | null;
  id: string;
  plan?: {
    name?: string | null;
  } | null;
  planId: string;
  quantity?: number | null;
  startedAt?: number | string | null;
  status?: string | null;
}

interface AutumnWalletRecord {
  feature?: {
    id?: string | null;
  } | null;
  featureId?: string | null;
  granted: number;
  nextResetAt?: number | string | null;
  remaining: number;
  usage: number;
}

let cachedAdminEnvEntries: Record<string, string> | null = null;

function createUniqueSeedId() {
  return randomUUID().slice(0, 8);
}

function createIsoDate(value: string) {
  return new Date(value).toISOString();
}

function trimEnvValue(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\n/g, '\n');
  }

  return trimmed.replace(/\s+#.*$/, '');
}

function readAdminEnvEntries() {
  if (cachedAdminEnvEntries) {
    return cachedAdminEnvEntries;
  }

  const entries: Record<string, string> = {};

  if (existsSync(adminEnvPath)) {
    const fileContents = readFileSync(adminEnvPath, 'utf8');

    for (const line of fileContents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) {
        continue;
      }

      entries[match[1]] = trimEnvValue(match[2]);
    }
  }

  cachedAdminEnvEntries = entries;
  return entries;
}

function getAdminTestEnvValue(key: string) {
  const processValue = process.env[key]?.trim();

  if (processValue) {
    return processValue;
  }

  return readAdminEnvEntries()[key];
}

function getTestFirestore() {
  const projectId =
    getAdminTestEnvValue('FIREBASE_PROJECT_ID') ?? 'demo-startup-template';
  const clientEmail = getAdminTestEnvValue('FIREBASE_CLIENT_EMAIL');
  const privateKey = getAdminTestEnvValue('FIREBASE_PRIVATE_KEY')
    ?.replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n');
  const emulatorHost =
    getAdminTestEnvValue('FIRESTORE_EMULATOR_HOST') ?? '127.0.0.1:8080';

  if (emulatorHost && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  }

  const existing = getApps().find(app => app.name === TEST_AUTH_APP_NAME);
  if (existing) {
    return getFirestore(existing);
  }

  const app =
    clientEmail &&
    privateKey &&
    !/replace_with_your_private_key/i.test(privateKey)
      ? initializeApp(
          {
            credential: cert({
              clientEmail,
              privateKey,
              projectId,
            }),
            projectId,
          },
          TEST_AUTH_APP_NAME
        )
      : initializeApp(
          {
            projectId,
          },
          TEST_AUTH_APP_NAME
        );

  return getFirestore(app);
}

function createAutumnClient() {
  const secretKey = getAdminTestEnvValue('AUTUMN_SECRET_KEY');

  if (!secretKey) {
    return null;
  }

  return new Autumn({
    secretKey,
    serverURL:
      getAdminTestEnvValue('AUTUMN_URL') ??
      getAdminTestEnvValue('AUTUMN_BASE_URL'),
  });
}

async function createApiContext() {
  return playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      origin: baseURL,
    },
  });
}

async function readJsonResponse<T>(response: APIResponse, context: string) {
  if (!response.ok()) {
    throw new Error(
      `${context} failed with ${response.status()}: ${await response.text()}`
    );
  }

  return (await response.json()) as T;
}

function toIsoString(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Date(value).toISOString() : null;
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? value : new Date(timestamp).toISOString();
  }

  return null;
}

function getWalletBalance(
  customer: Pick<AutumnCustomerRecord, 'balances'>
): AutumnWalletRecord | null {
  const directBalance = customer.balances?.[AUTUMN_WALLET_FEATURE_ID];
  if (directBalance) {
    return directBalance;
  }

  return (
    Object.values(customer.balances ?? {}).find(balance => {
      return (
        balance.featureId === AUTUMN_WALLET_FEATURE_ID ||
        balance.feature?.id === AUTUMN_WALLET_FEATURE_ID
      );
    }) ?? null
  );
}

function serializeAutumnCustomer(
  customer: AutumnCustomerRecord
): SeededAutumnCustomer {
  const wallet = getWalletBalance(customer);

  return {
    createdAt: toIsoString(customer.createdAt),
    customerId: customer.id,
    email: customer.email ?? null,
    name: customer.name ?? null,
    purchases: customer.purchases?.length ?? 0,
    subscriptions: (customer.subscriptions ?? []).map(subscription => ({
      currentPeriodEnd: toIsoString(subscription.currentPeriodEnd),
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.plan?.name ?? null,
      quantity: subscription.quantity ?? 0,
      startedAt: toIsoString(subscription.startedAt),
      status: subscription.status ?? 'unknown',
    })),
    wallet: wallet
      ? {
          featureId:
            wallet.featureId ?? wallet.feature?.id ?? AUTUMN_WALLET_FEATURE_ID,
          granted: wallet.granted,
          nextResetAt: toIsoString(wallet.nextResetAt),
          remaining: wallet.remaining,
          usage: wallet.usage,
        }
      : null,
  };
}

async function ensureAutumnWalletFeature(client: Autumn) {
  try {
    await client.features.get({
      featureId: AUTUMN_WALLET_FEATURE_ID,
    });

    return false;
  } catch {
    await client.features.create({
      consumable: true,
      display: {
        plural: 'USD credits',
        singular: 'USD credit',
      },
      featureId: AUTUMN_WALLET_FEATURE_ID,
      name: 'USD Credits',
      type: 'metered',
    });

    return true;
  }
}

async function createAutumnCustomer(
  client: Autumn,
  input: {
    customerId: string;
    email: string;
    name: string;
  }
) {
  await client.customers.getOrCreate({
    createInStripe: false,
    customerId: input.customerId,
    email: input.email,
    name: input.name,
  });
}

async function refreshAutumnCustomer(
  client: Autumn,
  input: {
    customerId: string;
    email: string;
    name: string;
  }
) {
  const customer = (await client.customers.getOrCreate({
    createInStripe: false,
    customerId: input.customerId,
    email: input.email,
    expand: ['subscriptions.plan', 'balances.feature', 'purchases.plan'],
    name: input.name,
  })) as AutumnCustomerRecord;

  return serializeAutumnCustomer(customer);
}

async function createAutumnPlan(
  client: Autumn,
  input: {
    name: string;
    planId: string;
  }
) {
  await client.plans.create({
    items: [
      {
        featureId: AUTUMN_WALLET_FEATURE_ID,
        included: 0,
        reset: {
          interval: 'month',
        },
      },
    ],
    name: input.name,
    planId: input.planId,
  });
}

async function deleteAutumnPlan(client: Autumn, planId: string) {
  try {
    await client.plans.delete({
      allVersions: true,
      planId,
    });
  } catch {
    // Ignore cleanup failures so the Firestore cleanup still runs.
  }
}

async function deleteAutumnCustomer(client: Autumn, customerId: string) {
  try {
    await client.customers.delete({
      customerId,
      deleteInStripe: false,
    });
  } catch {
    // Ignore cleanup failures so the rest of the fixture can continue.
  }
}

async function deleteAutumnFeature(client: Autumn, featureId: string) {
  try {
    await client.features.delete({
      featureId,
    });
  } catch {
    // Ignore cleanup failures when the feature already existed or is still in use.
  }
}

async function seedAutumnBillingData(input: {
  createdWalletFeature: boolean;
  membershiplessUser: SeededDirectoryUser;
  organization: SeededOrganization;
  subjectUser: SeededDirectoryUser;
  uniqueId: string;
}): Promise<SeededAutumnBillingData | null> {
  const client = createAutumnClient();

  if (!client) {
    return null;
  }

  const billingSearchPrefix = `Autumn Directory ${input.uniqueId}`;
  const userPlanId = `pw-admin-user-plan-${input.uniqueId}`;
  const organizationPlanId = `pw-admin-org-plan-${input.uniqueId}`;

  if (!input.createdWalletFeature) {
    await ensureAutumnWalletFeature(client);
  }

  const userCustomerId = `user-${input.subjectUser.id}`;
  const organizationCustomerId = `org-${input.organization.id}`;
  const membershiplessCustomerId = `user-${input.membershiplessUser.id}`;
  const userCustomerInput = {
    customerId: userCustomerId,
    email: input.subjectUser.email,
    name: `${billingSearchPrefix} User`,
  };
  const organizationCustomerInput = {
    customerId: organizationCustomerId,
    email: `billing-org-${input.uniqueId}@example.com`,
    name: `${billingSearchPrefix} Organization`,
  };
  const membershiplessCustomerInput = {
    customerId: membershiplessCustomerId,
    email: input.membershiplessUser.email,
    name: `${billingSearchPrefix} Solo`,
  };

  await Promise.all([
    createAutumnCustomer(client, userCustomerInput),
    createAutumnCustomer(client, organizationCustomerInput),
    createAutumnCustomer(client, membershiplessCustomerInput),
    createAutumnPlan(client, {
      name: `${billingSearchPrefix} User Plan`,
      planId: userPlanId,
    }),
    createAutumnPlan(client, {
      name: `${billingSearchPrefix} Organization Plan`,
      planId: organizationPlanId,
    }),
  ]);

  await Promise.all([
    client.billing.attach({
      customerId: userCustomerId,
      planId: userPlanId,
      redirectMode: 'never',
      subscriptionId: `pw-admin-user-sub-${input.uniqueId}`,
    }),
    client.billing.attach({
      customerId: organizationCustomerId,
      planId: organizationPlanId,
      redirectMode: 'never',
      subscriptionId: `pw-admin-org-sub-${input.uniqueId}`,
    }),
    client.balances.create({
      balanceId: `pw-admin-user-balance-${input.uniqueId}`,
      customerId: userCustomerId,
      featureId: AUTUMN_WALLET_FEATURE_ID,
      includedGrant: 125,
      reset: {
        interval: 'month',
      },
    }),
    client.balances.create({
      balanceId: `pw-admin-org-balance-${input.uniqueId}`,
      customerId: organizationCustomerId,
      featureId: AUTUMN_WALLET_FEATURE_ID,
      includedGrant: 360,
      reset: {
        interval: 'month',
      },
    }),
    client.balances.create({
      balanceId: `pw-admin-solo-balance-${input.uniqueId}`,
      customerId: membershiplessCustomerId,
      featureId: AUTUMN_WALLET_FEATURE_ID,
      includedGrant: 48,
      reset: {
        interval: 'month',
      },
    }),
  ]);

  for (let index = 0; index < GENERIC_BILLING_CUSTOMER_COUNT; index += 1) {
    const ordinal = String(index + 1).padStart(2, '0');

    await createAutumnCustomer(client, {
      customerId: `pw-admin-directory-${input.uniqueId}-${ordinal}`,
      email: `billing-${input.uniqueId}-${ordinal}@example.com`,
      name: `${billingSearchPrefix} Customer ${ordinal}`,
    });
  }

  const [userCustomer, organizationCustomer, membershiplessCustomer] =
    await Promise.all([
      refreshAutumnCustomer(client, userCustomerInput),
      refreshAutumnCustomer(client, organizationCustomerInput),
      refreshAutumnCustomer(client, membershiplessCustomerInput),
    ]);

  return {
    available: true,
    billingSearchPrefix,
    directoryCustomerCount: BILLING_DIRECTORY_CUSTOMER_COUNT,
    membershiplessCustomer,
    membershiplessPlanId: null,
    membershiplessPlanName: null,
    organizationCustomer,
    organizationPlanId,
    organizationPlanName: `${billingSearchPrefix} Organization Plan`,
    userCustomer,
    userPlanId,
    userPlanName: `${billingSearchPrefix} User Plan`,
  };
}

async function cleanupAutumnBillingData(input: {
  createdWalletFeature: boolean;
  membershiplessUser: SeededDirectoryUser;
  organization: SeededOrganization;
  subjectUser: SeededDirectoryUser;
  uniqueId: string;
}) {
  const client = createAutumnClient();

  if (!client) {
    return;
  }

  const customerIds = [
    `user-${input.subjectUser.id}`,
    `org-${input.organization.id}`,
    `user-${input.membershiplessUser.id}`,
    ...Array.from({ length: GENERIC_BILLING_CUSTOMER_COUNT }, (_, index) => {
      const ordinal = String(index + 1).padStart(2, '0');

      return `pw-admin-directory-${input.uniqueId}-${ordinal}`;
    }),
  ];
  const planIds = [
    `pw-admin-user-plan-${input.uniqueId}`,
    `pw-admin-org-plan-${input.uniqueId}`,
  ];

  for (const customerId of customerIds) {
    await deleteAutumnCustomer(client, customerId);
  }

  for (const planId of planIds) {
    await deleteAutumnPlan(client, planId);
  }

  if (input.createdWalletFeature) {
    await deleteAutumnFeature(client, AUTUMN_WALLET_FEATURE_ID);
  }
}

function getTestModules() {
  return {
    BETTER_AUTH_COLLECTIONS,
    BETTER_AUTH_ORGANIZATION_COLLECTIONS,
    buildAuthOrganizationSearchFields,
    buildAuthUserSearchFields,
    firestore: getTestFirestore(),
    getAdminAuditLogsPath,
    getAppAdminPath,
    getAuthUserPath,
    getUserPath,
  };
}

async function seedAdminData(): Promise<SeededAdminArtifacts> {
  const modules = await getTestModules();
  const uniqueId = createUniqueSeedId();
  const autumnClient = createAutumnClient();
  let createdWalletFeature = false;

  const adminUser = {
    createdAt: createIsoDate('2024-04-02T09:15:00.000Z'),
    email: `admin-${uniqueId}@example.com`,
    name: `Admin Tester ${uniqueId}`,
    password: `Admin-${uniqueId}!123`,
  };

  const subjectUser = {
    createdAt: createIsoDate('2024-05-10T14:20:00.000Z'),
    email: `avery-${uniqueId}@example.com`,
    id: `user-${uniqueId}-avery`,
    name: `Avery Example ${uniqueId}`,
  };

  const secondaryUser = {
    createdAt: createIsoDate('2024-05-11T08:05:00.000Z'),
    email: `morgan-${uniqueId}@example.com`,
    id: `user-${uniqueId}-morgan`,
    name: `Morgan Other ${uniqueId}`,
  };

  const membershiplessUser = {
    createdAt: createIsoDate('2024-05-12T11:30:00.000Z'),
    email: `solo-${uniqueId}@example.com`,
    id: `user-${uniqueId}-solo`,
    name: `Solo Example ${uniqueId}`,
  };

  const organization = {
    createdAt: createIsoDate('2024-05-01T10:00:00.000Z'),
    id: `org-${uniqueId}`,
    name: `Northwind Labs ${uniqueId}`,
    slug: `northwind-labs-${uniqueId}`,
  };

  const emptyOrganization = {
    createdAt: createIsoDate('2024-05-02T12:15:00.000Z'),
    id: `org-${uniqueId}-empty`,
    name: `Empty Space ${uniqueId}`,
    slug: `empty-space-${uniqueId}`,
  };

  const membership = {
    createdAt: createIsoDate('2024-05-12T16:45:00.000Z'),
    id: `membership-${uniqueId}`,
    organizationId: organization.id,
    role: 'member',
  };

  const disabledAdminId = `disabled-admin-${uniqueId}`;
  const adminUserId = `admin-${uniqueId}`;
  const adminAccountId = `account-${uniqueId}`;
  const adminCreatedAt = new Date(adminUser.createdAt);
  const adminPasswordHash = await hashPassword(adminUser.password);

  await Promise.all([
    modules.firestore.doc(modules.getAuthUserPath(adminUserId)).set(
      {
        createdAt: adminCreatedAt,
        email: adminUser.email.toLowerCase(),
        emailVerified: true,
        id: adminUserId,
        image: null,
        name: adminUser.name,
        updatedAt: adminCreatedAt,
        ...modules.buildAuthUserSearchFields({
          email: adminUser.email,
          name: adminUser.name,
        }),
      },
      { merge: true }
    ),
    modules.firestore
      .collection(modules.BETTER_AUTH_COLLECTIONS.accounts)
      .doc(adminAccountId)
      .set({
        accountId: adminUserId,
        createdAt: adminCreatedAt,
        password: adminPasswordHash,
        providerId: 'credential',
        updatedAt: adminCreatedAt,
        userId: adminUserId,
      }),
    modules.firestore.doc(modules.getAppAdminPath(adminUserId)).set({
      createdAt: adminCreatedAt,
      createdBy: null,
      notes: 'Playwright seeded admin user',
      role: 'admin',
      status: 'active',
      updatedAt: adminCreatedAt,
      updatedBy: null,
    }),
    modules.firestore.doc(modules.getAppAdminPath(disabledAdminId)).set({
      createdAt: adminCreatedAt,
      createdBy: null,
      notes: 'Playwright seeded disabled admin user',
      role: 'admin',
      status: 'disabled',
      updatedAt: adminCreatedAt,
      updatedBy: null,
    }),
    modules.firestore.doc(modules.getAuthUserPath(subjectUser.id)).set({
      createdAt: new Date(subjectUser.createdAt),
      email: subjectUser.email,
      emailVerified: true,
      id: subjectUser.id,
      image: null,
      name: subjectUser.name,
      updatedAt: new Date(subjectUser.createdAt),
      ...modules.buildAuthUserSearchFields({
        email: subjectUser.email,
        name: subjectUser.name,
      }),
    }),
    modules.firestore.doc(modules.getUserPath(subjectUser.id)).set({
      createdAt: new Date(subjectUser.createdAt),
      plan: 'pro',
      supportTier: 'priority',
      updatedAt: new Date(subjectUser.createdAt),
    }),
    modules.firestore.doc(modules.getAuthUserPath(secondaryUser.id)).set({
      createdAt: new Date(secondaryUser.createdAt),
      email: secondaryUser.email,
      emailVerified: true,
      id: secondaryUser.id,
      image: null,
      name: secondaryUser.name,
      updatedAt: new Date(secondaryUser.createdAt),
      ...modules.buildAuthUserSearchFields({
        email: secondaryUser.email,
        name: secondaryUser.name,
      }),
    }),
    modules.firestore.doc(modules.getAuthUserPath(membershiplessUser.id)).set({
      createdAt: new Date(membershiplessUser.createdAt),
      email: membershiplessUser.email,
      emailVerified: true,
      id: membershiplessUser.id,
      image: null,
      name: membershiplessUser.name,
      updatedAt: new Date(membershiplessUser.createdAt),
      ...modules.buildAuthUserSearchFields({
        email: membershiplessUser.email,
        name: membershiplessUser.name,
      }),
    }),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .doc(organization.id)
      .set({
        createdAt: new Date(organization.createdAt),
        id: organization.id,
        logo: null,
        name: organization.name,
        slug: organization.slug,
        updatedAt: new Date(organization.createdAt),
        ...modules.buildAuthOrganizationSearchFields({
          name: organization.name,
        }),
      }),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .doc(emptyOrganization.id)
      .set({
        createdAt: new Date(emptyOrganization.createdAt),
        id: emptyOrganization.id,
        logo: null,
        name: emptyOrganization.name,
        slug: emptyOrganization.slug,
        updatedAt: new Date(emptyOrganization.createdAt),
        ...modules.buildAuthOrganizationSearchFields({
          name: emptyOrganization.name,
        }),
      }),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.member)
      .doc(membership.id)
      .set({
        createdAt: new Date(membership.createdAt),
        organizationId: membership.organizationId,
        role: membership.role,
        updatedAt: new Date(membership.createdAt),
        userId: subjectUser.id,
      }),
  ]);

  if (autumnClient) {
    createdWalletFeature = await ensureAutumnWalletFeature(autumnClient);
  }

  const autumn = await seedAutumnBillingData({
    createdWalletFeature,
    membershiplessUser,
    organization,
    subjectUser,
    uniqueId,
  });
  const requestContext = await createApiContext();

  try {
    await readJsonResponse(
      await requestContext.post('/api/auth/sign-in/email', {
        data: {
          callbackURL: '/',
          email: adminUser.email,
          password: adminUser.password,
        },
      }),
      'admin sign in'
    );

    return {
      cleanup: {
        createdWalletFeature,
        disabledAdminId,
        uniqueId,
      },
      seededData: {
        adminUser: {
          ...adminUser,
          id: adminUserId,
        },
        autumn,
        emptyOrganization,
        expectedOverviewStats: {
          activeAdmins: 1,
          disabledAdmins: 1,
          organizations: 2,
          users: 4,
        },
        membership,
        membershiplessUser,
        organization,
        secondaryUser,
        subjectUser,
      },
      storageState: await requestContext.storageState(),
    };
  } finally {
    await requestContext.dispose();
  }
}

async function deleteQueryDocs(query: Query) {
  const snapshot = await query.get();

  await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
}

async function cleanupSeededAdminData(artifacts: SeededAdminArtifacts) {
  const { cleanup, seededData } = artifacts;
  const modules = await getTestModules();

  await Promise.all([
    deleteQueryDocs(
      modules.firestore
        .collection(modules.BETTER_AUTH_COLLECTIONS.sessions)
        .where('userId', '==', seededData.adminUser.id)
    ),
    deleteQueryDocs(
      modules.firestore
        .collection(modules.BETTER_AUTH_COLLECTIONS.accounts)
        .where('userId', '==', seededData.adminUser.id)
    ),
    deleteQueryDocs(
      modules.firestore
        .collection(modules.getAdminAuditLogsPath())
        .where('actorUid', '==', seededData.adminUser.id)
    ),
  ]);

  await Promise.all([
    modules.firestore
      .doc(modules.getAppAdminPath(seededData.adminUser.id))
      .delete(),
    modules.firestore
      .doc(modules.getAppAdminPath(cleanup.disabledAdminId))
      .delete(),
    modules.firestore
      .doc(modules.getAuthUserPath(seededData.adminUser.id))
      .delete(),
    modules.firestore
      .doc(modules.getAuthUserPath(seededData.subjectUser.id))
      .delete(),
    modules.firestore
      .doc(modules.getUserPath(seededData.subjectUser.id))
      .delete(),
    modules.firestore
      .doc(modules.getAuthUserPath(seededData.secondaryUser.id))
      .delete(),
    modules.firestore
      .doc(modules.getAuthUserPath(seededData.membershiplessUser.id))
      .delete(),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.member)
      .doc(seededData.membership.id)
      .delete(),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .doc(seededData.organization.id)
      .delete(),
    modules.firestore
      .collection(modules.BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
      .doc(seededData.emptyOrganization.id)
      .delete(),
  ]);

  await cleanupAutumnBillingData({
    createdWalletFeature: cleanup.createdWalletFeature,
    membershiplessUser: seededData.membershiplessUser,
    organization: seededData.organization,
    subjectUser: seededData.subjectUser,
    uniqueId: cleanup.uniqueId,
  });
}

async function createAuthenticatedPage(
  browser: Browser,
  storageState: Awaited<ReturnType<APIRequestContext['storageState']>>,
  contextOptions: BrowserContextOptions
) {
  const context = await browser.newContext({
    ...contextOptions,
    baseURL,
    storageState,
  });
  const page = await context.newPage();

  return {
    context,
    page,
  };
}

export const test = base.extend<
  AdminFixtures,
  {
    seededAdminArtifacts: SeededAdminArtifacts;
  }
>({
  seededAdminArtifacts: [
    async ({}, use) => {
      const artifacts = await seedAdminData();

      try {
        await use(artifacts);
      } finally {
        await cleanupSeededAdminData(artifacts);
      }
    },
    { scope: 'worker', timeout: 120_000 },
  ],
  seededAdminData: async ({ seededAdminArtifacts }, use) => {
    await use(seededAdminArtifacts.seededData);
  },
  adminPage: async ({ browser, contextOptions, seededAdminArtifacts }, use) => {
    const { context, page } = await createAuthenticatedPage(
      browser,
      seededAdminArtifacts.storageState,
      contextOptions
    );

    await use(page);
    await context.close();
  },
});

export { expect };
