# packages/common/src/types

Shared TypeScript types for API and package contracts.

## Directories

- None.

## Files

- `admin.ts`: Shared admin roles, permissions, and Firestore document contracts.
- `api.ts`: Shared API-related types.
- `index.ts`: Type export barrel.

## Writing Rules

- Prefer pure type modules here without runtime side effects.
- Keep public type names stable because they flow across package boundaries.
