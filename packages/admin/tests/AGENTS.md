# packages/admin/tests

Package-level admin tests grouped by source area and end-to-end admin flows.

## Directories

- `lib/`: Unit tests for shared admin helpers and server-side data modules.

## Files

- `router.test.tsx`: Tests admin router creation behavior.
- `start.test.ts`: Tests admin bootstrap wiring.

## Writing Rules

- Keep tests in this package-scoped tree instead of colocating them with runtime source files.
- Mirror the source-area layout when adding new suites so ownership stays easy to follow.
- Treat access control, billing visibility, and audit reads as high-value contracts to cover directly.
