# packages/common/src

Published shared source used by both frontend and backend packages.

## Directories

- `client-api/`: Client-facing API surface exported by the common package.
- `messages/`: Shared user-facing message catalog and helpers.
- `schemas/`: Shared validation schema exports.
- `types/`: Shared TypeScript types and API contracts.
- `utils/`: Portable utilities shared across packages.

## Files

- `global.ts`: Shared constants and repo-wide global helpers.
- `index.ts`: Common package public export surface.
  Rules:
  - Keep exports intentional because downstream packages import from here.

## Writing Rules

- Preserve stable shared APIs here and route domain-specific details into child folders.
- Export new public shared modules intentionally through `index.ts` or the relevant child barrel; otherwise keep them internal to the package.
- Update the public barrel and downstream call sites together when shared contracts move.
