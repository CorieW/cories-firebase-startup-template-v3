# packages/marketing

Static React marketing site workspace for the template's public-facing landing page.

## Directories

- `src/`: Marketing page source, shared UI primitives, and client-side helpers.
- `tests/`: Package-level rendering tests for the landing page.

## Files

- `.env.example`: Example marketing environment variables.
  Rules:
  - Keep public-facing app URLs aligned with deployed dashboard routes.
- `index.html`: Vite HTML entrypoint for the static marketing app.
- `package.json`: Marketing workspace manifest and scripts.
  Rules:
  - Keep scripts aligned with the root workspace commands.
- `tsconfig.json`: Marketing TypeScript configuration.
- `vite.config.ts`: Vite build and dev-server configuration.
- `vitest.config.ts`: Vitest configuration for marketing page tests.

## Writing Rules

- Keep this package static and presentation-focused unless a future feature clearly requires runtime data.
- Match the dashboard's visual language while allowing the marketing page to feel more editorial and brand-forward.
- Prefer reusable UI primitives for repeated styles instead of scattering large class strings across the page.
