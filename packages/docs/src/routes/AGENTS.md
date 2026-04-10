# packages/docs/src/routes

TanStack file routes for docs app and its search endpoint.

## Directories

- None.

## Files

- `$.tsx`: Catch-all docs content route for nested MDX pages.
- `__root.tsx`: Root route shell and providers for docs app.
- `api.search.ts`: Search API route backed by docs content source.
- `index.tsx`: Root docs landing route backed by docs content source.

## Writing Rules

- Keep route files thin: page lookup, preload wiring, and route-level providers belong here, while reusable rendering stays in sibling dirs.
- Update file when dir gains, loses, renames, or repurposes in big way immediate file.
