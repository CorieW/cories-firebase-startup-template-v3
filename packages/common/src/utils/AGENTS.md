# packages/common/src/utils

Shared util modules used across monorepo.

## Directories

- None.

## Files

- `index.ts`: Util export barrel.
- `logger.ts`: Logger implementation helpers.
- `logging.ts`: Shared logging utils.
- `search.ts`: Shared search-field normalization and Firestore prefix helpers.
- `utils.ts`: General-purpose shared helpers.

## Writing Rules

- Keep utils portable across frontend and backend usage.
- Split modules when responsibilities stop being obviously shared.
