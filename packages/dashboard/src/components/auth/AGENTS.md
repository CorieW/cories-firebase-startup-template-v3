# packages/dashboard/src/components/auth

Authentication-specific dashboard wrappers and page-level auth UI components.

## Directories

- None.

## Files

- `BetterAuthForms.tsx`: Shared Better Auth UI route wrapper for sign-in, sign-up, and related auth views.

## Writing Rules

- Keep auth route wrappers thin and let Better Auth UI own form internals.
- Put reusable auth view mapping logic here instead of duplicating it across route modules.
