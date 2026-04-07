/**
 * Admin route guard helpers.
 */
import {
  ADMIN_FORBIDDEN_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PREFIX,
} from './route-paths';

/**
 * Normalizes route pathnames so comparisons are stable.
 */
export function normalizeAdminPathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  if (pathname === '/') {
    return pathname;
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/**
 * Determines whether a pathname belongs to the public admin auth subtree.
 */
export function isAdminAuthRoute(pathname: string): boolean {
  const normalizedPath = normalizeAdminPathname(pathname);

  return (
    normalizedPath === ADMIN_SIGN_IN_ROUTE_PREFIX ||
    normalizedPath.startsWith(`${ADMIN_SIGN_IN_ROUTE_PREFIX}/`)
  );
}

/**
 * Determines whether a pathname should bypass the protected admin shell check.
 */
export function isAdminPublicRoute(pathname: string): boolean {
  const normalizedPath = normalizeAdminPathname(pathname);

  return (
    isAdminAuthRoute(normalizedPath) ||
    normalizedPath === ADMIN_FORBIDDEN_ROUTE_PATH
  );
}
