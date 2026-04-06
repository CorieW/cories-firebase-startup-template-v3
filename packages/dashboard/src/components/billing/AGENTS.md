# packages/dashboard/src/components/billing

Billing UI components for pricing, summaries, wallet activity, and billing actions.

## Directories

- None.

## Files

- `BillingDashboard.tsx`: Billing summary and action dashboard component.
- `BillingPage.tsx`: Page-level billing layout and orchestration component.
- `BillingPlansSection.tsx`: Extracted subscriptions summary and plan card section.
- `BillingWalletSection.tsx`: Extracted wallet summary, top-up, and activity section.
- `billing-dashboard.lib.ts`: Billing dashboard formatting, parsing, and wallet helper functions.
- `billing-dashboard.logging.ts`: Billing dashboard logging and toast reporting helpers.
- `billing-dashboard.types.ts`: Billing dashboard Autumn model aliases and internal UI types.
- `use-billing-dashboard-actions.ts`: Billing dashboard portal and checkout action handlers.
- `use-billing-dashboard-data.ts`: Billing dashboard derived data and Autumn hook composition.

## Writing Rules

- Keep billing API calls and auth plumbing outside presentational components when possible.
- Update route docs when billing UX responsibilities move between pages and shared components.
- Keep pricing summaries, wallet activity, and billing actions partitioned into focused modules so billing flows stay easy to reason about and test.
