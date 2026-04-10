/**
 * Route guard utilities.
 */
/**
 * Public routes are available without authentication.
 */
const PUBLIC_ROUTE_PREFIXES = ["/sign-in", "/sign-up"] as const;
const AUTH_REDIRECT_BASE_URL = "https://dashboard.local";

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

function normalizeInternalRedirectPath(redirectTo: unknown): string | null {
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
    const parsedRedirect = new URL(trimmedRedirectTo, AUTH_REDIRECT_BASE_URL);
    const normalizedRedirect = `${parsedRedirect.pathname}${parsedRedirect.search}${parsedRedirect.hash}`;

    return isPublicRoute(parsedRedirect.pathname) ? "/" : normalizedRedirect;
  } catch {
    return null;
  }
}

/**
 * Builds a safe internal redirect target from the current location.
 */
export function buildAuthRedirectTarget(input: {
  hash?: string;
  href?: string;
  pathname: string;
  search?: unknown;
}): string {
  if (typeof input.href === "string" && input.href.trim().length > 0) {
    return normalizeInternalRedirectPath(input.href) ?? "/";
  }

  const pathname =
    typeof input.pathname === "string" && input.pathname.startsWith("/")
      ? input.pathname
      : "/";
  const search = typeof input.search === "string" ? input.search : "";
  const hash = typeof input.hash === "string" ? input.hash : "";

  return normalizeInternalRedirectPath(`${pathname}${search}${hash}`) ?? "/";
}

/**
 * Reads and sanitizes a post-auth redirect target from the current search string.
 */
export function getAuthRedirectFromSearch(
  search: string | undefined,
): string | undefined {
  const redirectTo = new URLSearchParams(search ?? "").get("redirectTo");

  if (typeof redirectTo !== "string" || redirectTo.trim().length === 0) {
    return undefined;
  }

  return normalizeInternalRedirectPath(redirectTo) ?? "/";
}

/**
 * Reads and sanitizes a post-auth redirect target from the current href.
 */
export function getAuthRedirectFromHref(
  href: string | undefined,
): string | undefined {
  if (typeof href !== "string" || href.trim().length === 0) {
    return undefined;
  }

  return getAuthRedirectFromSearch(
    new URL(href, AUTH_REDIRECT_BASE_URL).search,
  );
}
