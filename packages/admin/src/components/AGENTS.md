# packages/admin/src/components

Shared admin UI building blocks for auth flows, page framing, and the protected console shell.

## Directories

- None.

## Files

- `AdminAppBrand.tsx`: Shared admin brand lockup rendered in the sidebar shell.
- `AdminAuthView.tsx`: Native admin sign-in, reset-password, and sign-out view states.
- `AdminElements.tsx`: Reusable admin page headers, panels, empty states, pagination controls, and JSON preview components.
- `AdminShell.tsx`: Authenticated admin layout with navigation and session context.

## Writing Rules

- Keep these components presentation-focused and push privileged reads into route loaders or `src/lib/server`.
- Update this file when component files are added, removed, renamed, or materially repurposed.
