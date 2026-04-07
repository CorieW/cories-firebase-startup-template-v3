# packages/admin

Internal TanStack Start admin workspace for admin-only operations, audit views, and read-only app management.

## Directories

- `src/`: Admin application source for routing, server helpers, and UI components.
- `tests/`: Package-level admin tests grouped by source area and E2E flows.

## Files

- `.env.example`: Example admin environment variables.
  Rules:
  - Keep keys aligned with runtime environment usage.
- `.gitignore`: Admin-local ignore rules.
- `apphosting.yaml`: Firebase App Hosting config for the admin server deployment.
- `package.json`: Admin workspace manifest and scripts.
  Rules:
  - Keep scripts aligned with root orchestration and App Hosting, Playwright, or Vite config.
- `playwright.config.ts`: Playwright test configuration.
- `tsconfig.json`: Admin TypeScript configuration.
- `vite.config.ts`: Vite build and dev-server configuration.
- `vitest.config.ts`: Admin unit-test configuration.

## Writing Rules

- Keep tooling config at the package root and product code inside `src`.
- Keep admin access checks and data reads server-side instead of pushing privileged reads into client code.
- Treat audit, billing, and access-control behavior as high-signal areas that should stay easy to review and test.
