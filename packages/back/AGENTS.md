# packages/back

Firebase Functions backend workspace for callable APIs, webhooks, and backend tests.

## Directories

- `src/`: Runtime backend source.
- `tests/`: Backend unit and integration tests.

## Files

- `.env.example`: Example backend environment variables.
  Rules:
  - Keep keys aligned with runtime environment checks and deployment secrets.
- `package.json`: Backend workspace manifest and scripts.
  Rules:
  - Keep scripts aligned with root orchestration.
- `tsconfig.json`: Backend TypeScript compile configuration.
- `vitest.config.ts`: Backend unit-test configuration.
- `vitest.integration.config.ts`: Backend integration-test configuration.

## Writing Rules

- Keep runtime code under `src` and behavior tests under `tests`.
- Update env examples and test config when backend entrypoints or integrations change.
