# packages/dashboard/tests/components/billing

Billing dashboard tests covering subscriptions, wallet flows, and shared billing fixtures.

## Directories

- None.

## Files

- `BillingDashboard.subscriptions.test.tsx`: Tests subscription view behavior for the billing dashboard.
- `BillingDashboard.wallet.test.tsx`: Tests wallet view behavior for the billing dashboard.
- `BillingPage.test.tsx`: Tests page-level billing scope orchestration and remount behavior.
- `billing-dashboard.lib.test.ts`: Tests billing dashboard helper functions and error parsing.
- `billing-dashboard.test-helpers.tsx`: Shared mocked Autumn and toast setup for billing dashboard tests.

## Writing Rules

- Keep billing-specific mocks and render helpers here so runtime billing source stays free of test-only support code.
- Prefer behavior-focused billing assertions that exercise the rendered dashboard or exported helper contracts.
- Update this file when billing suites or shared billing test utilities are added, removed, or renamed.
- Split subscription, wallet, and shared-helper coverage into focused suites so billing regressions stay easy to isolate.
