# packages/dashboard

TanStack Start dashboard workspace with routing, UI components, package-scoped tests, and tooling config.

## Directories

- `.vscode/`: Workspace-specific VS Code settings for dashboard package.
- `public/`: Static assets served directly by dashboard app.
- `src/`: Dashboard app source for routing, UI, and bootstrap code.
- `tests/`: Package-level unit and E2E tests organized by source area.

## Files

- `.env.example`: Example dashboard env vars.
  Rules:
  - Keep keys aligned with runtime environment usage.
- `.gitignore`: Dashboard-local ignore rules.
- `apphosting.yaml`: Firebase App Hosting config for dashboard server deploy.
- `package.json`: Dashboard workspace manifest, scripts.
  Rules:
  - Keep scripts aligned with root orchestration and App Hosting, Playwright, or Vite config.
- `playwright.config.ts`: Playwright test config.
- `tsconfig.json`: Dashboard TypeScript config.
- `vite.config.ts`: Vite build and dev-server config.
- `vitest.config.ts`: Dashboard unit-test config.

## Generated Files

- `package-lock.json`: npm lockfile retained for tool-driven workflows.
  Rules:
  - Refresh it through npm tooling instead of hand-editing.

## Writing Rules

- Keep tooling config at package root and product code inside `src`.
- Update public assets, E2E coverage, and source docs together when dashboard flows shift.
- Treat billing and pricing flows as financially sensitive and expand unit, integration, and E2E coverage together when they change.
