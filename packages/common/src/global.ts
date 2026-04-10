/**
 * Shared constants and repo-wide global helpers.
 */
// =============================================================================
// TEMPLATE BRANDING AND BOILERPLATE
// =============================================================================

/**
 * Default product name used across the template apps.
 */
export const TEMPLATE_BRAND_NAME = 'Firebase Starter';

/**
 * Default product subtitle shown in shared app-brand lockups.
 */
export const TEMPLATE_BRAND_SUBTITLE = 'Better Auth + Billing';

/**
 * Default single-character brand mark shown in shared app-brand lockups.
 */
export const TEMPLATE_BRAND_MARK = 'C';

/**
 * Default document titles for the template apps.
 */
export const TEMPLATE_APP_TITLES = {
  admin: 'Admin Console',
  dashboard: TEMPLATE_BRAND_NAME,
  docs: `${TEMPLATE_BRAND_NAME} Docs`,
  marketing: `${TEMPLATE_BRAND_NAME} Marketing`,
} as const;

/**
 * Shared boilerplate copy meant to be customized early in a new project.
 */
export const TEMPLATE_COPY = {
  dashboardFooterOwnerName: 'Your name here',
  docsMetaDescription: `Documentation for the ${TEMPLATE_BRAND_NAME} starter template.`,
  legalSuffix: 'All rights reserved.',
  marketingFooterSummary:
    'A stylish static marketing package designed to feel like the public face of the same product family as the dashboard.',
  marketingFooterTagline: 'Public-facing polish for the template.',
  marketingMetaDescription: `A polished marketing site for the ${TEMPLATE_BRAND_NAME} template.`,
} as const;

/**
 * Shared social links used by template footer surfaces.
 */
export interface TemplateSocialLinkConfig {
  icon?: string;
  label: string;
  url: string;
}

/**
 * Default social links meant to be customized early in a new project.
 */
export const TEMPLATE_SOCIAL_LINKS = [
  {
    label: 'X',
    url: 'https://x.com/your-handle',
    icon: 'x',
  },
  {
    label: 'GitHub',
    url: 'https://github.com/your-org',
    icon: 'github',
  },
] as const satisfies readonly TemplateSocialLinkConfig[];

/**
 * Shared support destinations meant to be customized early in a new project.
 */
export const TEMPLATE_SUPPORT = {
  docsHref: 'http://localhost:3003',
  emailAddress: 'support@yourcompany.com',
} as const;

/**
 * Shared mailto link for the template support inbox.
 */
export const TEMPLATE_SUPPORT_EMAIL_HREF = `mailto:${TEMPLATE_SUPPORT.emailAddress}`;

// =============================================================================
// FIRESTORE COLLECTION PATHS
// =============================================================================

/**
 * Private collection path constants
 * These are kept private to enforce using the helper functions below
 * which provide consistency and prevent typos in collection path references
 */
const USERS_COLLECTION = 'users';
const APP_ADMINS_COLLECTION = 'app_admins';
const ADMIN_AUDIT_LOGS_COLLECTION = 'admin_audit_logs';
const AUTH_USERS_COLLECTION = 'auth_users';
const AUTH_SESSIONS_COLLECTION = 'auth_sessions';
const AUTH_ACCOUNTS_COLLECTION = 'auth_accounts';
const AUTH_VERIFICATION_TOKENS_COLLECTION = 'auth_verification_tokens';
const AUTH_ORGANIZATIONS_COLLECTION = 'auth_organizations';
const AUTH_MEMBERS_COLLECTION = 'auth_members';
const AUTH_INVITATIONS_COLLECTION = 'auth_invitations';

export const BETTER_AUTH_COLLECTIONS = {
  users: AUTH_USERS_COLLECTION,
  sessions: AUTH_SESSIONS_COLLECTION,
  accounts: AUTH_ACCOUNTS_COLLECTION,
  verificationTokens: AUTH_VERIFICATION_TOKENS_COLLECTION,
} as const;

export const BETTER_AUTH_ORGANIZATION_COLLECTIONS = {
  organization: AUTH_ORGANIZATIONS_COLLECTION,
  member: AUTH_MEMBERS_COLLECTION,
  invitation: AUTH_INVITATIONS_COLLECTION,
} as const;

// =============================================================================
// FIRESTORE PATH HELPER FUNCTIONS
// =============================================================================

/**
 * Get the Firestore document path for a specific user
 * @param userUid - The unique identifier for the user
 * @returns The complete document path for the specified user
 */
export function getUserPath(userUid: string) {
  return USERS_COLLECTION + '/' + userUid;
}

/**
 * Get the Firestore collection path for Better Auth users.
 * @returns The Better Auth users collection path string.
 */
export function getAuthUsersPath() {
  return AUTH_USERS_COLLECTION;
}

/**
 * Get the Firestore document path for a specific Better Auth user.
 * @param userUid - The unique identifier for the auth user.
 * @returns The complete auth user document path.
 */
export function getAuthUserPath(userUid: string) {
  return AUTH_USERS_COLLECTION + '/' + userUid;
}

/**
 * Get the Firestore document path for a specific Better Auth organization.
 * @param organizationId - Organization identifier.
 * @returns The complete organization document path.
 */
export function getOrganizationPath(organizationId: string) {
  return AUTH_ORGANIZATIONS_COLLECTION + '/' + organizationId;
}

/**
 * Get the Firestore collection path for internal admin records.
 * @returns The admin collection path string.
 */
export function getAppAdminsPath() {
  return APP_ADMINS_COLLECTION;
}

/**
 * Get the Firestore document path for a specific internal admin record.
 * @param userUid - The unique identifier for the admin user.
 * @returns The complete admin document path.
 */
export function getAppAdminPath(userUid: string) {
  return APP_ADMINS_COLLECTION + '/' + userUid;
}

/**
 * Get the Firestore collection path for admin audit logs.
 * @returns The admin audit log collection path string.
 */
export function getAdminAuditLogsPath() {
  return ADMIN_AUDIT_LOGS_COLLECTION;
}

// ===========================================================================
// NETWORK REQUEST CONFIGURATION
// ===========================================================================

/**
 * Default timeout in milliseconds for client-side network-bound operations.
 * Applies to auth requests and callable function requests handled by common API
 * utilities.
 * @default 30000
 */
export let NETWORK_REQUEST_TIMEOUT_MS = 30_000;

// ===========================================================================
// TESTING CONFIGURATION
// ===========================================================================

/**
 * The delay in milliseconds to add to the response of a callable function
 * This is useful for testing the loading state of the application
 * @default 0
 */
export let ARTIFICIAL_CALLABLE_DELAY = 0;
/**
 * Skips shared client-side validation when tests or local debugging need it.
 * @default false
 */
export let DISABLE_CLIENT_SIDE_VALIDATION = false;
