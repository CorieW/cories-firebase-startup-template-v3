# packages/dashboard/src

Dashboard app source for routing, shared UI, and app bootstrap.

## Directories

- `components/`: Shared presentation components grouped by product area.
- `lib/`: Reusable app logic for auth, theming, routing, and API access.
- `routes/`: File-based route modules for dashboard app.

## Files

- `router.tsx`: Router factory and TanStack Router registration.
- `start.ts`: TanStack Start bootstrap and dashboard server wiring.
- `styles.css`: Global design tokens and base styles.

## Generated Files

- `routeTree.gen.ts`: Generated TanStack Router tree.
  Rules:
  - Regenerate it through router tooling instead of hand-editing.

## Writing Rules

- Keep app bootstrap, shared libs, routes, and components separated by responsibility.
- Treat generated router output as read-only and update docs when new source subtrees are added.
- Keep app-wide startup concerns in `start.ts` and router registration in `router.tsx` instead of folding them into feature subtrees.
