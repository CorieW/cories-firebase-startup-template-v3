# packages/common/src/client

Shared browser-only client helpers, brand primitives, theme UI, and shared frontend styling tokens used by the app packages.

## Directories

- None.

## Files

- `SharedAppBrand.tsx`: Shared brand lockup markup used by app-specific wrappers.
- `SharedBetterAuthView.tsx`: Shared Better Auth route wrapper used by frontend auth entry screens with app-specific styling overrides.
- `SharedThemeToggle.tsx`: Shared theme switcher UI for frontend packages that want the common segmented control.
- `index.ts`: Public export surface for browser-only shared client modules.
- `shared-theme.css`: Shared dashboard and marketing color tokens used by app-level stylesheets.
- `theme.ts`: Shared browser theme state, DOM helpers, and init script exports.

## Writing Rules

- Keep this directory browser-safe and frontend-focused; do not pull server-only code or heavy app-specific dependencies into it.
- Treat exports here as shared frontend APIs and update downstream packages together when the public surface changes.
- Update this file when `client/` gains, loses, renames, or materially repurposes an immediate child.
