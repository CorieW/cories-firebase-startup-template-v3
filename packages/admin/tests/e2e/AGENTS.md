# packages/admin/tests/e2e

Playwright suites and shared fixtures for seeded admin end-to-end coverage.

## Directories

- None.

## Files

- `admin-test-helpers.ts`: Shared formatting helpers for admin E2E assertions.
- `admin.fixtures.ts`: Worker-scoped seeded admin auth, Firestore, and optional Autumn billing fixtures.
- `audit.spec.ts`: Audit timeline coverage for generated rows and action/resource filtering.
- `organizations.spec.ts`: Organization dir and detail coverage for populated, empty, and billing-ready states.
- `overview.spec.ts`: Admin overview coverage for summary cards and workspace entry links.
- `shell.spec.ts`: Smoke coverage for authenticated admin shell navigation.
- `users.spec.ts`: User dir and detail coverage for happy-path, empty, not-found, and billing-ready states.

## Writing Rules

- Keep fixtures and helpers focused on stable seeded data that mirrors real admin reads.
- Prefer route-level assertions over styling or DOM-structure assertions.
- Update file when E2E fixtures, helpers, or suites are added, removed, renamed, or repurposed in big way.
