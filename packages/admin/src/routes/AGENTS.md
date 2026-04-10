# packages/admin/src/routes

File-based route modules for admin app, including auth entry points and protected read-only tools.

## Directories

- None.

## Files

- `__root.tsx`: Admin root route that wires shared shell behavior and request-scoped session loading.
- `api.auth.$.ts`: Better Auth catch-all API route for admin app.
- `audit.tsx`: Protected audit timeline route with lightweight filter controls and pagination.
- `index.tsx`: Protected admin overview route with summary metrics and recent audit activity.
- `organizations.$organizationId.tsx`: Protected organization detail route for single tenant.
- `organizations.tsx`: Protected organization dir route with search and pagination.
- `sign-in.$.tsx`: Admin auth entry route for sign-in and email verification flows.
- `users.$userId.tsx`: Protected user detail route for single Better Auth user.
- `users.tsx`: Protected user dir route with search and pagination.

## Writing Rules

- Keep these modules focused on route guards, search validation, loader orchestration, and page composition.
- Update file when route files are added, removed, renamed, or repurposed in big way.
