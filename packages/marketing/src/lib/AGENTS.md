# packages/marketing/src/lib

Browser-side helpers for the marketing app's URL handoffs, analytics logging, and UI utilities.

## Directories

- None.

## Files

- `cn.ts`: Tailwind-friendly class merge helper used by marketing UI primitives.
- `dashboard-links.ts`: Helpers that build dashboard auth and billing URLs from the current environment.
- `marketing-logging.ts`: Lightweight client-side logging helper for primary marketing events.

## Writing Rules

- Keep helpers small and browser-safe, and centralize reusable environment or logging behavior here instead of scattering it across components.
- Update this file when this directory gains, loses, renames, or materially repurposes an immediate child.
