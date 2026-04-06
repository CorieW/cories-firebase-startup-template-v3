/**
 * Better Auth server instance, adapter wiring, and provider hooks.
 */
import { createScopedLogger } from '@cories-firebase-startup-template-v3/common';
import { autumn } from 'autumn-js/better-auth';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { firestoreAdapter } from 'better-auth-firestore';
import {
  getAppUrl,
  getBetterAuthSecret,
  getGoogleOAuthConfig,
} from './env';
import { getAutumnCustomerId } from './auth-autumn-ids';
import {
  removeAutumnSeatEntity,
  syncAutumnCustomer,
  syncAutumnSeatEntity,
} from './auth-server.autumn';
import {
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './auth-server.email';
import { firestore } from './auth-server.firebase';
import { normalizeAuthUserForStorage } from './auth-user-normalization';

const authServerLogger = createScopedLogger('DASH_AUTH_SERVER');
export { getAutumnServerClient } from './auth-server.autumn';

const AUTH_COLLECTIONS = {
  users: 'auth_users',
  sessions: 'auth_sessions',
  accounts: 'auth_accounts',
  verificationTokens: 'auth_verification_tokens',
} as const;

const ORGANIZATION_COLLECTIONS = {
  organization: 'auth_organizations',
  member: 'auth_members',
  invitation: 'auth_invitations',
} as const;

const googleOAuthConfig = getGoogleOAuthConfig();

authServerLogger.log(
  'CONFIG',
  {
    action: 'initializeBetterAuth',
    googleOAuthEnabled: Boolean(googleOAuthConfig),
    appUrl: getAppUrl(),
  },
  'info'
);

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: getAppUrl(),
  secret: getBetterAuthSecret(),
  trustedOrigins: [getAppUrl()],
  database: firestoreAdapter({
    firestore,
    collections: AUTH_COLLECTIONS,
  }),
  user: {
    modelName: AUTH_COLLECTIONS.users,
  },
  session: {
    modelName: AUTH_COLLECTIONS.sessions,
  },
  account: {
    modelName: AUTH_COLLECTIONS.accounts,
  },
  verification: {
    modelName: AUTH_COLLECTIONS.verificationTokens,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
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
    sendOnSignUp: true,
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
        google: googleOAuthConfig,
      }
    : {},
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          authServerLogger.action(
            'beforeCreateUser',
            {
              hasEmail: Boolean(user.email),
              hasName: Boolean(user.name),
            },
            'debug'
          );
          return {
            data: normalizeAuthUserForStorage(user),
          };
        },
        after: async (user) => {
          if (!user) {
            return;
          }

          authServerLogger.action(
            'afterCreateUser',
            {
              userId: user.id,
              hasEmail: Boolean(user.email),
            },
            'info'
          );
          await syncAutumnCustomer(getAutumnCustomerId('user', user.id), {
            email: user.email,
            name: user.name,
          });
        },
      },
      update: {
        after: async (user) => {
          if (!user) {
            return;
          }

          authServerLogger.action(
            'afterUpdateUser',
            {
              userId: user.id,
              hasEmail: Boolean(user.email),
            },
            'info'
          );
          await syncAutumnCustomer(getAutumnCustomerId('user', user.id), {
            email: user.email,
            name: user.name,
          });
        },
      },
    },
  },
  plugins: [
    tanstackStartCookies(),
    organization({
      requireEmailVerificationOnInvitation: true,
      schema: {
        organization: {
          modelName: ORGANIZATION_COLLECTIONS.organization,
        },
        member: {
          modelName: ORGANIZATION_COLLECTIONS.member,
        },
        invitation: {
          modelName: ORGANIZATION_COLLECTIONS.invitation,
        },
      },
      sendInvitationEmail: async ({ email, id, organization }) => {
        authServerLogger.action(
          'sendOrganizationInvitationEmail',
          {
            invitationId: id,
            organizationId: organization.id,
            hasEmail: Boolean(email),
          },
          'info'
        );
        await sendOrganizationInvitationEmail({
          email,
          invitationId: id,
          organizationName: organization.name,
        });
      },
      organizationHooks: {
        afterAcceptInvitation: async ({ member, organization }) => {
          authServerLogger.action(
            'afterAcceptInvitation',
            {
              memberId: member.userId,
              organizationId: organization.id,
            },
            'info'
          );
          await syncAutumnCustomer(
            getAutumnCustomerId('org', organization.id),
            {
              name: organization.name,
            }
          );
          await syncAutumnSeatEntity(
            organization.id,
            member.userId,
            member.userId
          );
        },
        afterAddMember: async ({ member, organization }) => {
          authServerLogger.action(
            'afterAddMember',
            {
              memberId: member.userId,
              organizationId: organization.id,
            },
            'info'
          );
          await syncAutumnCustomer(
            getAutumnCustomerId('org', organization.id),
            {
              name: organization.name,
            }
          );
          await syncAutumnSeatEntity(
            organization.id,
            member.userId,
            member.userId
          );
        },
        afterCreateOrganization: async ({ organization, member }) => {
          authServerLogger.action(
            'afterCreateOrganization',
            {
              memberId: member.userId,
              organizationId: organization.id,
            },
            'info'
          );
          await syncAutumnCustomer(
            getAutumnCustomerId('org', organization.id),
            {
              name: organization.name,
            }
          );
          await syncAutumnSeatEntity(
            organization.id,
            member.userId,
            member.userId
          );
        },
        afterRemoveMember: async ({ member, organization }) => {
          authServerLogger.action(
            'afterRemoveMember',
            {
              memberId: member.userId,
              organizationId: organization.id,
            },
            'info'
          );
          await removeAutumnSeatEntity(organization.id, member.userId);
        },
        afterUpdateMemberRole: async ({ member, organization }) => {
          authServerLogger.action(
            'afterUpdateMemberRole',
            {
              memberId: member.userId,
              organizationId: organization.id,
            },
            'info'
          );
          await syncAutumnSeatEntity(
            organization.id,
            member.userId,
            member.userId
          );
        },
        afterUpdateOrganization: async ({ organization }) => {
          if (!organization) {
            return;
          }

          authServerLogger.action(
            'afterUpdateOrganization',
            {
              organizationId: organization.id,
            },
            'info'
          );
          await syncAutumnCustomer(
            getAutumnCustomerId('org', organization.id),
            {
              name: organization.name,
            }
          );
        },
      },
    }),
    autumn({
      identify: ({ organization, session }) => {
        if (!session) {
          authServerLogger.action(
            'identifyAutumnCustomerSkipped',
            {
              reason: 'missing-session',
            },
            'debug'
          );
          return null;
        }

        if (organization) {
          authServerLogger.action(
            'identifyAutumnCustomer',
            {
              scope: 'organization',
              organizationId: organization.id,
            },
            'debug'
          );
          return {
            customerId: getAutumnCustomerId('org', organization.id),
            customerData: {
              name: organization.name,
            },
          };
        }

        authServerLogger.action(
          'identifyAutumnCustomer',
          {
            scope: 'user',
            userId: session.user.id,
          },
          'debug'
        );
        return {
          customerId: getAutumnCustomerId('user', session.user.id),
          customerData: {
            email: session.user.email,
            name: session.user.name,
          },
        };
      },
    }),
  ],
});
