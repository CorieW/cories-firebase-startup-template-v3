/**
 * Playwright auth and organization fixtures for billing-focused E2E coverage.
 */
import { randomUUID } from 'node:crypto';
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
import {
  removeAutumnCustomer,
  removeAutumnSeatEntity,
} from '../../src/lib/auth-server.autumn';
import { getAutumnCustomerId } from '../../src/lib/auth-autumn-ids';
import { firestore } from '../../src/lib/auth-server.firebase';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3001';
const authUsersCollection = 'auth_users';

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
