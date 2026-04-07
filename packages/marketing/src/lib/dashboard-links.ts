/**
 * Helpers for linking the marketing site into dashboard billing routes.
 */
const DASHBOARD_BILLING_PATHS = {
  subscriptions: "/pricing/subscriptions",
  wallet: "/pricing/wallet",
} as const;

export type DashboardBillingDestination = keyof typeof DASHBOARD_BILLING_PATHS;

const DASHBOARD_AUTH_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export type DashboardAuthDestination = keyof typeof DASHBOARD_AUTH_PATHS;

const DEFAULT_DASHBOARD_DEV_URL = "http://localhost:3001";

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
}

/**
 * Resolves the dashboard base URL for Autumn-backed pricing handoffs.
 */
export function getDashboardBaseUrl(): string {
  const configuredBaseUrl = normalizeBaseUrl(
    import.meta.env.VITE_DASHBOARD_URL,
  );
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window === "undefined") {
    return DEFAULT_DASHBOARD_DEV_URL;
  }

  const { hostname, origin, port, protocol } = window.location;
  if (hostname === "localhost" && port === "3000") {
    return DEFAULT_DASHBOARD_DEV_URL;
  }

  if (protocol === "http:" || protocol === "https:") {
    return origin;
  }

  return DEFAULT_DASHBOARD_DEV_URL;
}

/**
 * Builds a dashboard billing URL for a given Autumn-backed section.
 */
export function getDashboardBillingUrl(
  destination: DashboardBillingDestination,
): string {
  return `${getDashboardBaseUrl()}${DASHBOARD_BILLING_PATHS[destination]}`;
}

/**
 * Builds a dashboard auth URL for a given entry flow.
 */
export function getDashboardAuthUrl(
  destination: DashboardAuthDestination,
): string {
  return `${getDashboardBaseUrl()}${DASHBOARD_AUTH_PATHS[destination]}`;
}
