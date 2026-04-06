# packages/back/src/utils

Reusable backend helpers for auth, middleware, validation, and callable responses.

## Directories

- None.

## Files

- `callable-response.ts`: Shared callable response envelope helpers.
- `domain-errors.ts`: Backend domain error types.
- `utils.ts`: Small backend utility helpers.

## Writing Rules

- Keep utilities reusable across handlers instead of hiding feature logic inside them.
- Prefer explicit names and narrow helper responsibilities because these modules are shared widely.
