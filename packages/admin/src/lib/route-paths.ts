/**
 * Centralized admin route path helpers and constants.
 */
export const ADMIN_HOME_ROUTE_PATH = "/";
export const ADMIN_AUTH_API_ROUTE_PREFIX = "/api/auth";
export const ADMIN_USERS_ROUTE_PATH = "/users";
export const ADMIN_ORGANIZATIONS_ROUTE_PATH = "/organizations";
export const ADMIN_AUDIT_ROUTE_PATH = "/audit";
export const ADMIN_SIGN_IN_ROUTE_PREFIX = "/sign-in";
export const ADMIN_FORGOT_PASSWORD_ROUTE_PATH = "/sign-in/forgot-password";
export const ADMIN_RESET_PASSWORD_ROUTE_PATH = "/sign-in/reset-password";
export const ADMIN_SIGN_OUT_ROUTE_PATH = "/sign-in/sign-out";

export const ADMIN_NAV_ROUTE_PATHS = [
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_USERS_ROUTE_PATH,
  ADMIN_ORGANIZATIONS_ROUTE_PATH,
  ADMIN_AUDIT_ROUTE_PATH,
] as const;

/**
 * Builds the detail route for an admin-visible user.
 */
export function getAdminUserRoutePath(userId: string) {
  return `${ADMIN_USERS_ROUTE_PATH}/${userId}`;
}

/**
 * Builds the detail route for an admin-visible organization.
 */
export function getAdminOrganizationRoutePath(organizationId: string) {
  return `${ADMIN_ORGANIZATIONS_ROUTE_PATH}/${organizationId}`;
}
