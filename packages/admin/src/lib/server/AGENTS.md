# packages/admin/src/lib/server

Server-only admin data access layer for auth, Firestore lookups, audit logging, billing reads, and environment access.

## Directories

- None.

## Files

- `admin-directory.ts`: Reads and normalizes `app_admins/{uid}` allowlist records into session-safe shapes.
- `audit-data.ts`: Loads paginated recent admin audit entries with lightweight filtering.
- `audit-log.ts`: Persists audit entries and sanitizes metadata before storage.
- `auth-server.email.ts`: Email delivery helpers used by the admin Better Auth server.
- `auth-server.firebase.ts`: Firebase Admin and Firestore initialization for the admin app.
- `auth-server.ts`: Better Auth server configuration for admin authentication routes.
- `billing-data.ts`: Read-only Autumn helpers shared by admin user and organization detail billing summaries.
- `env.ts`: Typed admin environment accessors for auth, billing, email, and Firebase credentials.
- `firestore-serialization.ts`: Firestore document serialization helpers for loader-safe JSON.
- `organization-data.ts`: Paginated organization directory loaders plus single-organization detail reads.
- `overview-data.ts`: Aggregated overview metrics and recent audit summary loaders.
- `user-data.ts`: Paginated user directory loaders plus single-user detail reads.

## Writing Rules

- Keep privileged reads and writes here, and return normalized data objects instead of leaking raw SDK details into routes.
- Update this file when server helper files are added, removed, renamed, or materially repurposed.
