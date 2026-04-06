# packages/common/tests

Common package tests plus repo-level contract checks for tooling and conventions.

## Directories

- None.

## Files

- `callable-utils.int.test.ts`: Integration coverage for callable utilities.
- `logger.test.ts`: Tests logger helpers.
- `logging-utils.test.ts`: Tests logging utilities.
- `messages.test.ts`: Tests shared message catalog behavior.
- `repo-ci-contracts.test.ts`: Tests repo CI and workspace contract assumptions.
- `script-contracts.integration.test.ts`: Integration tests for repository helper scripts.
- `utils.test.ts`: Tests shared general utilities.

## Writing Rules

- Put repo-governance and script contract tests here when they protect shared infrastructure.
- Keep these suites resilient to refactors by asserting observable contracts rather than file internals.
- Use `.int.test.ts` naming for integration-style suites that belong under the integration Vitest config.
