# packages/docs/src/routes

TanStack file routes for the docs app and its search endpoint.

## Directories

- None.

## Files

- `$.tsx`: Catch-all docs content route for nested MDX pages.
- `__root.tsx`: Root route shell and providers for the docs app.
- `api.search.ts`: Search API route backed by the docs content source.
- `index.tsx`: Root docs landing route backed by the docs content source.

## Writing Rules

- Keep route files thin: page lookup, preload wiring, and route-level providers belong here, while reusable rendering stays in sibling directories.
- Update this file when this directory gains, loses, renames, or materially repurposes an immediate file.
