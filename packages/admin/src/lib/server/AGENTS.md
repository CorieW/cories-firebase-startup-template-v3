# packages/admin/src/lib/server

Server-only admin data access layer for auth, Firestore lookups, audit logging, billing reads, and environment access.

## Directories

- None.

## Files

- `admin-directory.ts`: Reads and normalizes `app_admins/{uid}` allowlist records into session-safe shapes.
- `audit-data.ts`: Loads paginated recent admin audit entries with lightweight filtering.
- `audit-log.ts`: Persists audit entries and sanitizes metadata before storage.
- `auth-server.email.ts`: Email delivery helpers used by admin Better Auth server.
- `auth-server.firebase.ts`: Firebase Admin and Firestore initialization for admin app.
- `auth-server.ts`: Better Auth server config for admin authentication routes.
- `billing-data.ts`: Read-only Autumn helpers shared by admin user and org detail billing summaries.
- `env.ts`: Typed admin environment accessors for auth, billing, email, and Firebase credentials.
- `firestore-serialization.ts`: Firestore document serialization helpers for loader-safe JSON.
- `organization-data.ts`: Paginated org dir loaders plus single-org detail reads.
- `overview-data.ts`: Aggregated overview metrics and recent audit summary loaders.
- `user-data.ts`: Paginated user dir loaders plus single-user detail reads.

## Writing Rules

- Keep privileged reads and writes here, and return normalized data objects instead of leaking raw SDK details into routes.
- Update file when server helper files are added, removed, renamed, or repurposed in big way.
