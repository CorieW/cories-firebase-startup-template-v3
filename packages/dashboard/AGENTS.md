# packages/dashboard

TanStack Start dashboard workspace with routing, UI components, package-scoped tests, and tooling config.

## Directories

- `.vscode/`: Workspace-specific VS Code settings for the dashboard package.
- `public/`: Static assets served directly by the dashboard app.
- `src/`: Dashboard application source for routing, UI, and bootstrap code.
- `tests/`: Package-level unit and E2E tests organized by source area.

## Files

- `.env.example`: Example dashboard environment variables.
  Rules:
  - Keep keys aligned with runtime environment usage.
- `.gitignore`: Dashboard-local ignore rules.
- `apphosting.yaml`: Firebase App Hosting config for the dashboard server deployment.
- `package.json`: Dashboard workspace manifest and scripts.
  Rules:
  - Keep scripts aligned with root orchestration and App Hosting, Playwright, or Vite config.
- `playwright.config.ts`: Playwright test configuration.
- `tsconfig.json`: Dashboard TypeScript configuration.
- `vite.config.ts`: Vite build and dev-server configuration.
- `vitest.config.ts`: Dashboard unit-test configuration.

## Generated Files

- `package-lock.json`: npm lockfile retained for tool-driven workflows.
  Rules:
  - Refresh it through npm tooling instead of hand-editing.

## Writing Rules

- Keep tooling config at the package root and product code inside `src`.
- Update public assets, E2E coverage, and source docs together when dashboard flows shift.
- Treat billing and pricing flows as financially sensitive and expand unit, integration, and E2E coverage together when they change.
