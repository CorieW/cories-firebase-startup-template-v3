/**
 * Generic pricing index route that redirects to subscriptions.
 */
import { createFileRoute, redirect } from '@tanstack/react-router';
import { BILLING_ROUTE_PATH, BILLING_ROUTE_PATHS } from '../lib/route-paths';

export const Route = createFileRoute(BILLING_ROUTE_PATH)({
  beforeLoad: ({ location }) => {
    const isBillingIndexPath =
      location.pathname === BILLING_ROUTE_PATH ||
      location.pathname === `${BILLING_ROUTE_PATH}/`;

    if (isBillingIndexPath) {
      throw redirect({
        to: BILLING_ROUTE_PATHS.subscriptions,
      });
    }
  },
});
