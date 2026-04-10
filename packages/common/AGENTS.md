# packages/common

Shared TypeScript package for reusable API types, utils, messages, and repo contract tests.

## Directories

- `src/`: Published shared source used by both frontend and backend packages.
- `tests/`: Shared package tests plus repo contract checks.

## Files

- `package.json`: Common package manifest and build scripts.
- `tsconfig.esm.json`: ESM build TypeScript config.
- `tsconfig.json`: Common package TypeScript config.
- `vitest.config.ts`: Common package unit-test config.
- `vitest.integration.config.ts`: Common package integration-test config.

## Writing Rules

- Keep this package dep-light because both frontend and backend consume it.
- Treat changes here as cross-workspace API changes and update dependents accordingly.
