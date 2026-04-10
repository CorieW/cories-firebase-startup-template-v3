# packages/back/tests

Backend unit and integration tests for Firebase Fns workspace, plus shared test helpers.

## Directories

- None.

## Files

- `callable-response.test.ts`: Tests shared callable response helpers.
- `domain-errors.test.ts`: Tests backend domain error mapping.
- `utils.test.ts`: Tests small backend utils.

## Writing Rules

- Prefer behavior-focused tests over implementation-detail assertions.
- Keep root test files focused on unit-scale backend behavior and reserve `integration/` for multi-system or emulator-backed coverage with `.int.test.ts` naming.
- Add shared setup to `helpers` only when multiple suites benefit.
