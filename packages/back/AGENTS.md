# packages/back

Firebase Fns backend workspace for callable APIs, webhooks, and backend tests.

## Directories

- `src/`: Runtime backend source.
- `tests/`: Backend unit and integration tests.

## Files

- `.env.example`: Example backend env vars.
  Rules:
  - Keep keys aligned with runtime environment checks and deploy secrets.
- `package.json`: Backend workspace manifest, scripts.
  Rules:
  - Keep scripts aligned with root orchestration.
- `tsconfig.json`: Backend TypeScript compile config.
- `vitest.config.ts`: Backend unit-test config.
- `vitest.integration.config.ts`: Backend integration-test config.

## Writing Rules

- Keep runtime code under `src` and behavior tests under `tests`.
- Update env examples and test config when backend entrypoints or integrations change.
