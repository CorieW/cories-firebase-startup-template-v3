/**
 * Better Auth server instance, adapter wiring, and provider hooks.
 */
import commonAuth from '@cories-firebase-startup-template-v3/common/auth';
import commonLogging from '@cories-firebase-startup-template-v3/common/logging';
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

const {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  buildAuthOrganizationSearchFields,
  buildAuthUserSearchFields,
} = commonAuth;
const { createScopedLogger } = commonLogging;
const authServerLogger = createScopedLogger('DASH_AUTH_SERVER');
export { getAutumnServerClient } from './auth-server.autumn';

const googleOAuthConfig = getGoogleOAuthConfig();

function normalizeAuthUserUpdateForStorage(user: {
  email?: string;
  image?: string | null;
  name?: string;
}) {
  const searchFields = buildAuthUserSearchFields({
    email: user.email,
    name: user.name,
  });

  return {
    ...user,
    ...('image' in user ? { image: user.image ?? null } : {}),
    ...('email' in user ? { emailSearch: searchFields.emailSearch } : {}),
    ...('name' in user ? { nameSearch: searchFields.nameSearch } : {}),
  };
}

async function syncOrganizationSearchFields(organization: {
  id: string;
  name?: string | null;
}) {
  const searchFields = buildAuthOrganizationSearchFields({
    name: organization.name,
  });

  await firestore
    .collection(BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization)
    .doc(organization.id)
    .set(searchFields, { merge: true });

  authServerLogger.action(
    'syncOrganizationSearchFields',
    {
      organizationId: organization.id,
      hasNameSearch: Boolean(searchFields.nameSearch),
    },
    'debug'
  );
}

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
          const normalizedUser = normalizeAuthUserForStorage(user);
          authServerLogger.action(
            'beforeCreateUser',
            {
              hasEmail: Boolean(normalizedUser.email),
              hasEmailSearch: Boolean(normalizedUser.emailSearch),
              hasName: Boolean(normalizedUser.name),
              hasNameSearch: Boolean(normalizedUser.nameSearch),
            },
            'debug'
          );
          return {
            // Keep user normalization inside Better Auth's main write so sign-up
            // does not perform extra Firestore work from within its transaction.
            data: normalizedUser,
          }
        },
      },
      update: {
        before: async (user, _context) => {
          const normalizedUser = normalizeAuthUserUpdateForStorage(user);
          authServerLogger.action(
            'beforeUpdateUser',
            {
              hasEmail: Boolean(normalizedUser.email),
              hasEmailSearch: Boolean(normalizedUser.emailSearch),
              hasName: Boolean(normalizedUser.name),
              hasNameSearch: Boolean(normalizedUser.nameSearch),
            },
            'debug'
          );
          return {
            data: normalizedUser,
          };
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
          modelName: BETTER_AUTH_ORGANIZATION_COLLECTIONS.organization,
        },
        member: {
          modelName: BETTER_AUTH_ORGANIZATION_COLLECTIONS.member,
        },
        invitation: {
          modelName: BETTER_AUTH_ORGANIZATION_COLLECTIONS.invitation,
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
          await syncOrganizationSearchFields(organization);
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

          await syncOrganizationSearchFields(organization);
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
