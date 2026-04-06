/**
 * Centralized route path helpers and constants.
 */
import { normalizePathname } from './route-guards';

export type BillingSection = 'subscriptions' | 'wallet';

/**
 * Centralized route path constants used across route definitions and guards.
 */
export const HOME_ROUTE_PATH = '/';
export const APP_CHAT_ROUTE_PATH = '/assistant';
export const SUPPORT_ROUTE_PATH = '/support';
export const AUTH_ROUTE_PREFIXES = ['/sign-in', '/sign-up'] as const;
export const BILLING_ROUTE_PATH = '/pricing';
export const BILLING_ROUTE_PATHS = {
  subscriptions: `${BILLING_ROUTE_PATH}/subscriptions`,
  wallet: `${BILLING_ROUTE_PATH}/wallet`,
} as const satisfies Record<BillingSection, string>;

/**
 * Determines whether a pathname belongs to any auth route subtree.
 */
export function isAuthRoutePath(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  return AUTH_ROUTE_PREFIXES.some((prefix) => {
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  });
}

/**
 * Resolves the canonical billing route path for a section.
 */
export function getBillingRoutePath(section: BillingSection): string {
  return BILLING_ROUTE_PATHS[section];
}

/**
 * Determines whether a pathname belongs to any billing subtree.
 */
export function isBillingRoutePath(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  return (
    normalizedPath === BILLING_ROUTE_PATH ||
    normalizedPath.startsWith(`${BILLING_ROUTE_PATH}/`)
  );
}

/**
 * Reads the billing section for a billing pathname and falls back to subscriptions.
 */
export function getBillingSectionForPath(pathname: string): BillingSection {
  const normalizedPath = normalizePathname(pathname);

  return normalizedPath === BILLING_ROUTE_PATHS.wallet
    ? 'wallet'
    : 'subscriptions';
}
