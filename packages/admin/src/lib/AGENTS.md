# packages/admin/src/lib

Shared admin client and server-facing helpers for auth, route guarding, formatting, theming, and UI primitives.

## Directories

- `server/`: Server-only helpers for Firestore, Better Auth, billing reads, and audit data.

## Files

- `admin-auth-client.ts`: Browser auth client wiring for admin sign-in and session-aware UI actions.
- `admin-auth.ts`: Request-scoped admin session lookup and route guard helpers.
- `admin-data.ts`: Server function wrappers that normalize loader inputs, including pagination, for admin routes.
- `admin-log-level.ts`: Admin logging helpers and log-level selection utilities.
- `formatting.ts`: Shared formatting helpers for admin dates, numbers, text, and JSON output.
- `pagination.ts`: Shared admin pagination helpers for search-param normalization and paginated list slicing.
- `route-guards.ts`: Public-route classification and pathname normalization helpers.
- `route-paths.ts`: Stable route path constants and path builders for admin navigation.
- `theme.ts`: Fixed admin document theme constants for the dark-mode shell.
- `ui.ts`: Shared admin utility class strings for buttons, inputs, badges, and layout.

## Writing Rules

- Keep shared helper modules small, dependency-light, and split by concern so routes stay easy to review.
- Update this file when immediate child files or the `server/` directory inventory changes.
