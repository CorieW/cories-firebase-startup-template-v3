/**
 * Better Auth server instance and provider wiring for the admin app.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  createScopedLogger,
} from '@cories-firebase-startup-template-v3/common';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { firestoreAdapter } from 'better-auth-firestore';
import {
  getAdminAppUrl,
  getBetterAuthSecret,
} from './env';
import { sendVerificationEmail } from './auth-server.email';
import { firestore } from './auth-server.firebase';

const authServerLogger = createScopedLogger('ADMIN_AUTH_SERVER');
const AUTH_COOKIE_PREFIX = 'admin-auth';

authServerLogger.action(
  'initializeBetterAuth',
  {
    appUrl: getAdminAppUrl(),
  },
  'info'
);

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: getAdminAppUrl(),
  secret: getBetterAuthSecret(),
  trustedOrigins: [getAdminAppUrl()],
  database: firestoreAdapter({
    firestore,
    collections: BETTER_AUTH_COLLECTIONS,
  }),
  user: {
    modelName: BETTER_AUTH_COLLECTIONS.users,
  },
  session: {
    modelName: BETTER_AUTH_COLLECTIONS.sessions,
  },
  account: {
    modelName: BETTER_AUTH_COLLECTIONS.accounts,
  },
  verification: {
    modelName: BETTER_AUTH_COLLECTIONS.verificationTokens,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    disableSignUp: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        url,
      });
    },
  },
  plugins: [tanstackStartCookies()],
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    database: {
      generateId: false,
    },
  },
});
