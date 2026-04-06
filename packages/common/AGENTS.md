# packages/common

Shared TypeScript package for reusable API types, utilities, messages, and repo contract tests.

## Directories

- `src/`: Published shared source used by both frontend and backend packages.
- `tests/`: Shared package tests plus repository contract checks.

## Files

- `package.json`: Common package manifest and build scripts.
- `tsconfig.esm.json`: ESM build TypeScript configuration.
- `tsconfig.json`: Common package TypeScript configuration.
- `vitest.config.ts`: Common package unit-test configuration.
- `vitest.integration.config.ts`: Common package integration-test configuration.

## Writing Rules

- Keep this package dependency-light because both frontend and backend consume it.
- Treat changes here as cross-workspace API changes and update dependents accordingly.
