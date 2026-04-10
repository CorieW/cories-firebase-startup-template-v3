# packages/marketing/src

Marketing app source for static landing page, including top-level shell, presentation components, and browser-side helpers.

## Directories

- `components/`: React components for page sections, brand lockup, and shared UI primitives.
- `lib/`: Client-side helpers for logging, class merging, and dashboard handoff URLs.

## Files

- `App.tsx`: Composes marketing page sections into root app shell.
- `main.tsx`: Mounts React marketing app into Vite entrypoint.
- `styles.css`: Defines marketing site's design tokens, layout utils, and global styles.
- `theme-init.ts`: Applies shared frontend theme preference before React mounts.

## Writing Rules

- Keep `App.tsx` focused on page composition and top-level effects; move section-specific UI into `components/` and reusable helpers into `lib/`.
- Update file when `src/` gains, loses, renames, or repurposes in big way immediate child.
