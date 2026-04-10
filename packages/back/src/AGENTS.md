# packages/back/src

Backend runtime source for Firebase Fns, service integrations, and middleware.

## Directories

- `callables/`: Firebase callable entrypoint defs.
- `triggers/`: Background trigger entrypoint exports.
- `utils/`: Reusable backend helpers and middleware utils.
- `webhooks/`: Webhook entrypoints and provider handlers.

## Files

- `firebase.ts`: Firebase Admin and Firestore initialization.
- `global.ts`: Backend environment/config accessors and shared constants.
  Rules:
  - Add new backend env accessors here instead of scattering raw `process.env` reads through runtime modules.
- `index.ts`: Backend public entrypoint that re-exports deployed fn modules.

## Writing Rules

- Keep module boundaries narrow: callables orchestrate, services integrate, and utils stay reusable.
- Keep `callables/`, `triggers/`, and `webhooks/` focused on exported Firebase entrypoints; move helper fns into services or utils.
- Centralize backend environment variable validation and normalization in root config helpers instead of repeating raw env access.
- Prefer child dirs for feature-specific logic instead of growing flat top-level files.
