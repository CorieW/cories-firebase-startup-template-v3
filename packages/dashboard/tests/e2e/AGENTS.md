# packages/dashboard/tests/e2e

Playwright suites for primary dashboard user journeys.

## Directories

- None.

## Files

- `auth-core.spec.ts`: Core authentication journey coverage.
- `auth-routing.spec.ts`: Auth-entry redirect coverage for already-authenticated users.
- `auth-smoke.spec.ts`: Fast smoke coverage for authentication routes.
- `billing-core.spec.ts`: Billing route access, scope redirects, and primary billing page coverage.
- `billing-navigation.spec.ts`: Billing sidebar link and navigation journey coverage.
- `billing-ui.spec.ts`: Billing UI action coverage for shared portal affordances.
- `billing.fixtures.ts`: Playwright auth and organization fixtures for billing-focused E2E coverage.
- `shell-mobile.spec.ts`: Mobile drawer and signed-in shell navigation coverage.
- `support.spec.ts`: Support page and support-chat user journey coverage.

## Writing Rules

- Cover stable user flows instead of UI implementation details.
- Tag fast confidence checks with `@smoke` and broader primary journeys with `@core`.
- Keep smoke scenarios fast and core scenarios representative of real user behavior.
- Prioritize billing journeys alongside auth when flows affect subscriptions, invoices, wallet balances, or other financially sensitive behavior.
