# packages/admin/tests/lib

Unit tests for shared admin helper modules that Do not need full route or server integration coverage.

## Directories

- None.

## Files

- `env.test.ts`: Verifies admin server env parsing for optional sidebar tool links.
- `pagination.test.ts`: Verifies admin pagination normalization and list slicing helpers.
- `route-guards.test.ts`: Verifies public-route classification and pathname normalization for admin guards.
- `user-data.test.ts`: Verifies admin user billing summary normalization for Autumn wallet visibility.

## Writing Rules

- Keep tests here focused on reusable helper behavior with small, deterministic inputs.
- Update file when helper test files are added, removed, renamed, or repurposed in big way.
