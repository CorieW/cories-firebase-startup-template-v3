# packages/docs/src

Docs application source for routing, shell UI, MDX rendering, and app-specific styles.

## Directories

- `components/`: Reusable docs shell, MDX media blocks, and rendering helpers.
- `lib/`: Content-source helpers, route data contracts, and small utilities.
- `routes/`: TanStack file routes for docs pages and the search API.

## Files

- `router.tsx`: Router factory and TanStack Router registration for the docs app.
- `start.ts`: TanStack Start bootstrap for the docs app.
- `styles.css`: Docs design tokens, shared theme imports, and Fumadocs overrides.

## Generated Files

- `routeTree.gen.ts`: Generated TanStack Router route tree for the docs package.
  Rules:
  - Prefer regenerating it instead of hand-editing when possible.

## Writing Rules

- Keep routing, source helpers, and presentation logic separated by responsibility so docs features stay easy to extend.
- Update this file when `src/` gains, loses, renames, or materially repurposes an immediate child.
