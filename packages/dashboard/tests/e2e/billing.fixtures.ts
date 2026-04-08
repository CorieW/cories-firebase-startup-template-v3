/**
 * Playwright auth and organization fixtures for billing-focused E2E coverage.
 */
import { randomUUID } from 'node:crypto';
import { Autumn } from 'autumn-js';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3001';
const authUsersCollection = 'auth_users';
const TEST_AUTH_APP_NAME = 'dashboard-better-auth-playwright';
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

type StorageState = Awaited<ReturnType<APIRequestContext['storageState']>>;

interface AuthenticatedSessionArtifacts {
  organizationId?: string;
  storageState: StorageState;
  userId: string;
}

interface BillingFixtures {
  personalPage: Page;
  organizationPage: Page;
}

function trimString(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = trimString(process.env[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getFirebaseProjectId() {
  return (
    readEnv('FIREBASE_PROJECT_ID', 'PROJECT_ID') ?? 'demo-startup-template'
  );
}

function getFirebaseClientEmail() {
  return readEnv('FIREBASE_CLIENT_EMAIL', 'CLIENT_EMAIL');
}

function getFirebasePrivateKey() {
  const value = readEnv('FIREBASE_PRIVATE_KEY', 'PRIVATE_KEY');
  if (!value) {
    return undefined;
  }

  return value.replace(/\r\n/g, '\n').replace(/\\n/g, '\n');
}

function getFirestoreEmulatorHost() {
  return (
    readEnv('FIRESTORE_EMULATOR_HOST', 'MY_FIRESTORE_EMULATOR_HOST') ??
    DEFAULT_FIRESTORE_EMULATOR_HOST
  );
}

function getAutumnSecretKey() {
  return readEnv('AUTUMN_SECRET_KEY');
}

function getAutumnBaseUrl() {
  return readEnv('AUTUMN_URL', 'AUTUMN_BASE_URL');
}

function getAutumnSeatFeatureId() {
  return readEnv('AUTUMN_SEAT_FEATURE_ID');
}

function getAutumnCustomerId(scope: 'org' | 'user', id: string) {
  return `${scope}-${id}`;
}

function getAutumnEntityId(scope: 'member', id: string) {
  return `${scope}-${id}`;
}

function getFirebaseAdminApp() {
  const existing = getApps().find(app => app.name === TEST_AUTH_APP_NAME);
  if (existing) {
    return existing;
  }

  const projectId = getFirebaseProjectId();
  const clientEmail = getFirebaseClientEmail();
  const privateKey = getFirebasePrivateKey();
  const emulatorHost = getFirestoreEmulatorHost();

  if (emulatorHost && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  }

  if (clientEmail && privateKey) {
    return initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      },
      TEST_AUTH_APP_NAME
    );
  }

  return initializeApp({ projectId }, TEST_AUTH_APP_NAME);
}

const firestore = getFirestore(getFirebaseAdminApp());

function getAutumnServerClient(): Autumn | null {
  const secretKey = getAutumnSecretKey();
  if (!secretKey) {
    return null;
  }

  return new Autumn({
    secretKey,
    ...(getAutumnBaseUrl() ? { baseURL: getAutumnBaseUrl() } : {}),
  });
}

async function removeAutumnSeatEntity(
  organizationId: string,
  memberId: string
) {
  const autumnClient = getAutumnServerClient();
  if (!autumnClient || !getAutumnSeatFeatureId()) {
    return;
  }

  await autumnClient.entities
    .delete({
      customerId: getAutumnCustomerId('org', organizationId),
      entityId: getAutumnEntityId('member', memberId),
    })
    .catch(() => undefined);
}

async function removeAutumnCustomer(customerId: string) {
  const autumnClient = getAutumnServerClient();
  if (!autumnClient) {
    return;
  }

  await autumnClient.customers
    .delete({
      customerId,
      deleteInStripe: false,
    })
    .catch(() => undefined);
}

async function createApiContext() {
  return playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      origin: baseURL,
    },
  });
}

async function readJsonResponse(response: APIResponse, context: string) {
  if (!response.ok()) {
    throw new Error(
      `${context} failed with ${response.status()}: ${await response.text()}`
    );
  }

  return response.json();
}

async function markUserEmailVerified(userId: string) {
  await firestore.collection(authUsersCollection).doc(userId).set(
    {
      emailVerified: true,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

async function createAuthenticatedStorageState(
  role: 'personal' | 'organization'
): Promise<AuthenticatedSessionArtifacts> {
  const requestContext = await createApiContext();
  const uniqueId = randomUUID().slice(0, 8);
  const email = `playwright-${role}-${uniqueId}@example.com`;
  const password = `Playwright-${uniqueId}!123`;
  const name =
    role === 'organization'
      ? `Organization Tester ${uniqueId}`
      : `Personal Tester ${uniqueId}`;

  const signUpResult = (await readJsonResponse(
    await requestContext.post('/api/auth/sign-up/email', {
      data: {
        email,
        name,
        password,
      },
    }),
    `${role} sign up`
  )) as {
    user: {
      id: string;
    };
  };

  await markUserEmailVerified(signUpResult.user.id);

  await readJsonResponse(
    await requestContext.post('/api/auth/sign-in/email', {
      data: {
        email,
        password,
      },
    }),
    `${role} sign in`
  );

  let organizationId: string | undefined;

  if (role === 'organization') {
    const organizationResult = (await readJsonResponse(
      await requestContext.post('/api/auth/organization/create', {
        data: {
          name: `Playwright Org ${uniqueId}`,
          slug: `playwright-org-${uniqueId}`,
        },
      }),
      'organization creation'
    )) as {
      id: string;
    };

    organizationId = organizationResult.id;

    await readJsonResponse(
      await requestContext.post('/api/auth/organization/set-active', {
        data: {
          organizationId: organizationResult.id,
        },
      }),
      'set active organization'
    );
  }

  const storageState = await requestContext.storageState();
  await requestContext.dispose();

  return {
    organizationId,
    storageState,
    userId: signUpResult.user.id,
  };
}

async function cleanupAutumnArtifacts({
  organizationId,
  userId,
}: {
  organizationId?: string;
  userId: string;
}) {
  const cleanupTasks: Array<() => Promise<void>> = [];

  if (organizationId) {
    cleanupTasks.push(() => removeAutumnSeatEntity(organizationId, userId));
    cleanupTasks.push(() =>
      removeAutumnCustomer(getAutumnCustomerId('org', organizationId))
    );
  }

  cleanupTasks.push(() =>
    removeAutumnCustomer(getAutumnCustomerId('user', userId))
  );

  for (const cleanupTask of cleanupTasks) {
    await cleanupTask();
  }
}

async function createAuthenticatedPage(
  browser: Browser,
  storageState: StorageState,
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
  BillingFixtures,
  {
    personalStorageState: AuthenticatedSessionArtifacts;
    organizationStorageState: AuthenticatedSessionArtifacts;
  }
>({
  personalStorageState: [
    async ({}, use) => {
      const artifacts = await createAuthenticatedStorageState('personal');

      try {
        await use(artifacts);
      } finally {
        await cleanupAutumnArtifacts({
          userId: artifacts.userId,
        });
      }
    },
    { scope: 'worker' },
  ],
  organizationStorageState: [
    async ({}, use) => {
      const artifacts = await createAuthenticatedStorageState('organization');

      try {
        await use(artifacts);
      } finally {
        await cleanupAutumnArtifacts({
          organizationId: artifacts.organizationId,
          userId: artifacts.userId,
        });
      }
    },
    { scope: 'worker' },
  ],
  personalPage: async (
    { browser, contextOptions, personalStorageState },
    use
  ) => {
    const { context, page } = await createAuthenticatedPage(
      browser,
      personalStorageState.storageState,
      contextOptions
    );

    await use(page);
    await context.close();
  },
  organizationPage: async (
    { browser, contextOptions, organizationStorageState },
    use
  ) => {
    const { context, page } = await createAuthenticatedPage(
      browser,
      organizationStorageState.storageState,
      contextOptions
    );

    await use(page);
    await context.close();
  },
});

export { expect };
