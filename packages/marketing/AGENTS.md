# packages/marketing

Static React marketing site workspace for template's public-facing landing page.

## Directories

- `src/`: Marketing page source, shared UI primitives, and client-side helpers.
- `tests/`: Package-level rendering tests for landing page.

## Files

- `.env.example`: Example marketing env vars.
  Rules:
  - Keep public-facing app URLs aligned with deployed dashboard routes.
- `index.html`: Vite HTML entrypoint for static marketing app.
- `package.json`: Marketing workspace manifest, scripts.
  Rules:
  - Keep scripts aligned with root workspace commands.
- `tsconfig.json`: Marketing TypeScript config.
- `vite.config.ts`: Vite build and dev-server config.
- `vitest.config.ts`: Vitest config for marketing page tests.

## Writing Rules

- Keep this package static and presentation-focused unless future feature clearly requires runtime data.
- Match dashboard's visual language while allowing marketing page to feel more editorial and brand-forward.
- Prefer reusable UI primitives for repeated styles instead of scattering large class strings across page.
