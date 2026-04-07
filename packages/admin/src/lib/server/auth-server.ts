/**
 * Better Auth server instance and provider wiring for the admin app.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { firestoreAdapter } from 'better-auth-firestore';
import {
  getAdminAppUrl,
  getBetterAuthSecret,
  getGoogleOAuthConfig,
} from './env';
import { sendPasswordResetEmail, sendVerificationEmail } from './auth-server.email';
import { firestore } from './auth-server.firebase';

const authServerLogger = createScopedLogger('ADMIN_AUTH_SERVER');
const googleOAuthConfig = getGoogleOAuthConfig();

authServerLogger.action(
  'initializeBetterAuth',
  {
    googleOAuthEnabled: Boolean(googleOAuthConfig),
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
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        url,
      });
    },
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
  socialProviders: googleOAuthConfig
    ? {
        google: {
          ...googleOAuthConfig,
          disableSignUp: true,
        },
      }
    : {},
  plugins: [tanstackStartCookies()],
  advanced: {
    database: {
      generateId: false,
    },
  },
  hooks: {
    after: async context => {
      authServerLogger.action(
        'authRequestCompleted',
        {
          path: context.path,
          method: context.context.request?.method,
          hasSession: Boolean(context.context.session),
        },
        'debug'
      );

      return {};
    },
    onError: async context => {
      authServerLogger.log(
        'AUTH_ERROR',
        {
          action: 'authRequestFailed',
          path: context.path,
          method: context.context.request?.method,
          error: serializeErrorForLogging(context.error),
        },
        'error'
      );
    },
  },
});
