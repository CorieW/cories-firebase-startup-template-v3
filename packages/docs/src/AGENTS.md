# packages/docs/src

Docs app source for routing, shell UI, MDX rendering, and app-specific styles.

## Directories

- `components/`: Reusable docs shell, MDX media blocks, and rendering helpers.
- `lib/`: Content-source helpers, route data contracts, and small utils.
- `routes/`: TanStack file routes for docs pages and search API.

## Files

- `router.tsx`: Router factory and TanStack Router registration for docs app.
- `start.ts`: TanStack Start bootstrap for docs app.
- `styles.css`: Docs design tokens, shared theme imports, and Fumadocs overrides.

## Generated Files

- `routeTree.gen.ts`: Generated TanStack Router route tree for docs package.
  Rules:
  - Prefer regenerating it instead of hand-editing when possible.

## Writing Rules

- Keep routing, source helpers, and presentation logic separated by responsibility so docs features stay easy to extend.
- Update file when `src/` gains, loses, renames, or repurposes in big way immediate child.
