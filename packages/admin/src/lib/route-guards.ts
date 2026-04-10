/**
 * Admin route guard helpers.
 */
import {
  ADMIN_AUTH_API_ROUTE_PREFIX,
  ADMIN_SIGN_IN_ROUTE_PREFIX,
} from "./route-paths";

const ADMIN_REDIRECT_BASE_URL = "https://admin.local";

/**
 * Normalizes route pathnames so comparisons are stable.
 */
export function normalizeAdminPathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname === "/") {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
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
    normalizedPath === ADMIN_AUTH_API_ROUTE_PREFIX ||
    normalizedPath.startsWith(`${ADMIN_AUTH_API_ROUTE_PREFIX}/`)
  );
}

function normalizeInternalAdminRedirectPath(redirectTo: unknown): string | null {
  if (typeof redirectTo !== "string") {
    return null;
  }

  const trimmedRedirectTo = redirectTo.trim();
  if (
    trimmedRedirectTo.length === 0 ||
    !trimmedRedirectTo.startsWith("/") ||
    trimmedRedirectTo.startsWith("//") ||
    trimmedRedirectTo.startsWith("/\\")
  ) {
    return null;
  }

  try {
    const parsedRedirect = new URL(trimmedRedirectTo, ADMIN_REDIRECT_BASE_URL);
    const normalizedRedirect = `${parsedRedirect.pathname}${parsedRedirect.search}${parsedRedirect.hash}`;

    return isAdminAuthRoute(parsedRedirect.pathname) ? "/" : normalizedRedirect;
  } catch {
    return null;
  }
}

/**
 * Builds a safe admin redirect target from the current location.
 */
export function buildAdminRedirectTarget(input: {
  hash?: string;
  href?: string;
  pathname: string;
  search?: unknown;
}): string {
  if (typeof input.href === "string" && input.href.trim().length > 0) {
    return normalizeInternalAdminRedirectPath(input.href) ?? "/";
  }

  const pathname =
    typeof input.pathname === "string" && input.pathname.startsWith("/")
      ? input.pathname
      : "/";
  const search = typeof input.search === "string" ? input.search : "";
  const hash = typeof input.hash === "string" ? input.hash : "";

  return normalizeInternalAdminRedirectPath(`${pathname}${search}${hash}`) ?? "/";
}

/**
 * Reads and sanitizes an admin post-auth redirect target from the search string.
 */
export function getAdminRedirectFromSearch(
  search: string | undefined,
): string | undefined {
  const redirectTo = new URLSearchParams(search ?? "").get("redirectTo");

  if (typeof redirectTo !== "string" || redirectTo.trim().length === 0) {
    return undefined;
  }

  return normalizeInternalAdminRedirectPath(redirectTo) ?? "/";
}

/**
 * Reads and sanitizes an admin post-auth redirect target from the current href.
 */
export function getAdminRedirectFromHref(
  href: string | undefined,
): string | undefined {
  if (typeof href !== "string" || href.trim().length === 0) {
    return undefined;
  }

  return getAdminRedirectFromSearch(
    new URL(href, ADMIN_REDIRECT_BASE_URL).search,
  );
}
