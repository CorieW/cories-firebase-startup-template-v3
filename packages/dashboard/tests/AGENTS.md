# packages/dashboard/tests

Package-level dashboard tests grouped by source area and cross-cutting app entrypoints.

## Directories

- `components/`: Component and feature-level dashboard tests grouped by UI area.
- `e2e/`: Playwright specs for primary dashboard user journeys.
- `lib/`: Unit tests for shared dashboard helpers and environment utils.
- `routes/`: Route-level tests for redirects, handlers, and server logic.

## Files

- `router.test.tsx`: Tests dashboard router creation behavior.
- `start.test.ts`: Tests dashboard bootstrap wiring.

## Writing Rules

- Keep tests in this package-scoped tree instead of colocating them with runtime source files.
- Mirror source-area layout when adding new suites so imports and ownership stay easy to follow.
- Update file when new top-level test groupings or cross-cutting entrypoint suites are added.
- Give billing-related changes heavier-than-normal coverage across component, route, integration, and E2E suites because regressions can be costly.
