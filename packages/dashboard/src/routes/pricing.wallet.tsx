/**
 * Generic wallet pricing route that resolves billing scope from the active session.
 */
import { createFileRoute } from '@tanstack/react-router';
import BillingPage from '../components/billing/BillingPage';
import { BILLING_ROUTE_PATHS } from '../lib/route-paths';

export const Route = createFileRoute(BILLING_ROUTE_PATHS.wallet)({
  component: BillingWalletPage,
});

function BillingWalletPage() {
  return <BillingPage section='wallet' />;
}
