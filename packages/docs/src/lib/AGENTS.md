# packages/docs/src/lib

Internal docs helpers for source loading, shared route data shapes, and light util logic.

## Directories

- None.

## Files

- `cn.ts`: Small class name helper for docs package.
- `docs-paths.ts`: Shared path parsing helpers for docs route loaders.
- `docs-types.ts`: Shared docs route data types used by server loaders and client renderers.
- `load-docs-page.ts`: Server function wrapper for loading docs page from content source.
- `source.server.ts`: Server-only docs content source and search helpers.

## Writing Rules

- Keep server-only source access behind `*.server.ts` or server-function boundaries so client bundles stay clean.
- Update file when dir gains, loses, renames, or repurposes in big way immediate file.
