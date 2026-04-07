# packages/admin/tests/lib

Unit tests for shared admin helper modules that do not need full route or server integration coverage.

## Directories

- None.

## Files

- `pagination.test.ts`: Verifies admin pagination normalization and list slicing helpers.
- `route-guards.test.ts`: Verifies public-route classification and pathname normalization for admin guards.

## Writing Rules

- Keep tests here focused on reusable helper behavior with small, deterministic inputs.
- Update this file when helper test files are added, removed, renamed, or materially repurposed.
