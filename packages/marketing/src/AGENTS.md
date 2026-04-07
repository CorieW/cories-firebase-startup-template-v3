# packages/marketing/src

Marketing app source for the static landing page, including the top-level shell, presentation components, and browser-side helpers.

## Directories

- `components/`: React components for the page sections, brand lockup, and shared UI primitives.
- `lib/`: Client-side helpers for logging, class merging, and dashboard handoff URLs.

## Files

- `App.tsx`: Composes the marketing page sections into the root application shell.
- `main.tsx`: Mounts the React marketing app into the Vite entrypoint.
- `styles.css`: Defines the marketing site's design tokens, layout utilities, and global styles.
- `theme-init.ts`: Applies the shared frontend theme preference before React mounts.

## Writing Rules

- Keep `App.tsx` focused on page composition and top-level effects; move section-specific UI into `components/` and reusable helpers into `lib/`.
- Update this file when `src/` gains, loses, renames, or materially repurposes an immediate child.
