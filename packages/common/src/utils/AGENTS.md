# packages/common/src/utils

Shared utility modules used across the monorepo.

## Directories

- None.

## Files

- `index.ts`: Utility export barrel.
- `logger.ts`: Logger implementation helpers.
- `logging.ts`: Shared logging utilities.
- `search.ts`: Shared search-field normalization and Firestore prefix helpers.
- `utils.ts`: General-purpose shared helpers.

## Writing Rules

- Keep utilities portable across frontend and backend usage.
- Split modules when responsibilities stop being obviously shared.
