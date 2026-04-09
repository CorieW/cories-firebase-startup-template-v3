/**
 * Centralized admin route path helpers and constants.
 */
export const ADMIN_HOME_ROUTE_PATH = "/";
export const ADMIN_AUTH_API_ROUTE_PREFIX = "/api/auth";
export const ADMIN_USERS_ROUTE_PATH = "/users";
export const ADMIN_ORGANIZATIONS_ROUTE_PATH = "/organizations";
export const ADMIN_AUDIT_ROUTE_PATH = "/audit";
export const ADMIN_SIGN_IN_ROUTE_PREFIX = "/sign-in";
export const ADMIN_SIGN_IN_ROUTE_PATH = "/sign-in/$";
export const ADMIN_SIGN_OUT_ROUTE_PATH = "/sign-in/sign-out";

/**
 * Builds params for the typed admin auth splat route.
 */
export function getAdminAuthRouteParams(splat = "") {
  return { _splat: splat };
}

/**
 * Builds normalized search params for the admin auth route.
 */
export function getAdminAuthRouteSearch(input?: {
  error?: string;
  token?: string;
}) {
  return {
    error: input?.error ?? "",
    token: input?.token ?? "",
  };
}
