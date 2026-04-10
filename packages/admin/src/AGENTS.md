# packages/admin/src

Admin app source for routing, shared UI, and server-backed admin tooling.

## Directories

- `components/`: Shared admin presentation components.
- `lib/`: Admin auth, route, and server-data helpers.
- `routes/`: File-based route modules for admin app.

## Files

- `router.tsx`: Router factory and TanStack Router registration for admin app.
- `start.ts`: TanStack Start bootstrap and admin server wiring.
- `styles.css`: Global admin design tokens and base styles.

## Generated Files

- `routeTree.gen.ts`: Generated TanStack Router tree.
  Rules:
  - Regenerate it through router tooling instead of hand-editing.

## Writing Rules

- Keep route modules focused on access control, loader orchestration, and page composition.
- Keep privileged data fetching in `lib/server` instead of embedding it into route components.
- Keep admin shell separate from customer-facing dashboard implementation details.
