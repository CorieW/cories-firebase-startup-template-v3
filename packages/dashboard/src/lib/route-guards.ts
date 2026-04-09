/**
 * Route guard utilities.
 */
/**
 * Public routes are available without authentication.
 */
const PUBLIC_ROUTE_PREFIXES = ["/sign-in", "/sign-up"] as const;

export const SIGN_IN_PATH = "/sign-in/$";
const AUTH_ENTRY_ROUTE_PATHS = ["/sign-in", "/sign-up"] as const;

/**
 * Normalizes route pathnames so comparisons are stable.
 */
export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname === "/") {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * Determines whether a pathname should be publicly accessible.
 */
export function isPublicRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  return PUBLIC_ROUTE_PREFIXES.some((prefix) => {
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  });
}

/**
 * Determines whether a pathname is one of the top-level auth entry pages.
 */
export function isAuthEntryRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  return AUTH_ENTRY_ROUTE_PATHS.some((path) => path === normalizedPath);
}
