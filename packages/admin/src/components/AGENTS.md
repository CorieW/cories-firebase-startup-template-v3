# packages/admin/src/components

Shared admin UI building blocks for auth flows, page framing, and protected console shell.

## Directories

- None.

## Files

- `AdminAppBrand.tsx`: Shared admin brand lockup rendered in sidebar shell.
- `AdminAuthView.tsx`: Admin-specific wrapper around shared Better Auth auth-entry component.
- `AdminElements.tsx`: Reusable admin page headers, panels, empty states, pagination controls, and JSON preview components.
- `AdminShell.tsx`: Authenticated admin layout with navigation and session context.

## Writing Rules

- Keep these components presentation-focused and push privileged reads into route loaders or `src/lib/server`.
- Update file when component files are added, removed, renamed, or repurposed in big way.
