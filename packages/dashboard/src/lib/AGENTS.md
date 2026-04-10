# packages/dashboard/src/lib

Dashboard library modules for auth, routing, theming, and API helpers.

## Directories

- None.

## Files

- `auth-autumn-ids.ts`: Helpers for consistent Autumn customer and entity id formats.
- `auth-client.ts`: Better Auth client and shared auth hooks.
- `auth-server.autumn.ts`: Autumn server client creation and customer or entity sync helpers.
- `auth-server.email.ts`: Better Auth email delivery and message template helpers.
- `auth-server.firebase.ts`: Firebase Admin bootstrap and Firestore singleton setup for auth.
- `auth-server.ts`: Better Auth server instance, adapter wiring, and provider hooks.
- `auth-ui-toast.ts`: Dashboard compatibility wrapper that re-exports the shared Better Auth toast helpers.
- `auth-user-normalization.ts`: Auth user payload normalization helpers for Firestore-safe writes.
- `auth.ts`: Dashboard auth guard helpers.
- `billing-api.ts`: Shared billing scope types used by the dashboard billing UI.
- `chat-usage.ts`: Shared chat usage constants and size-based billing helpers.
- `cn.ts`: Class name merge helper.
- `dashboard-log-level.ts`: Dashboard log-level helpers shared between route loaders and server env consumers.
- `env.ts`: Dashboard server environment accessors for auth, billing, email, and Firebase credentials.
- `route-guards.ts`: Route guard utilities.
- `route-paths.ts`: Centralized route path helpers and constants.
  Rules:
  - Add reused route constants here instead of duplicating path strings across route files.
- `social-links.ts`: Maps shared template social links into dashboard footer link configs.
- `theme.ts`: Theme state and DOM helpers.
- `ui.ts`: Shared dashboard UI helper exports.

## Writing Rules

- Keep shared app logic here when it is not tied to a single route or component subtree.
- Centralize dashboard environment reads, normalization helpers, and shared route helpers here instead of scattering raw `process.env` access through routes or components.
- Preserve stable helper APIs because many routes and components depend on this directory.
