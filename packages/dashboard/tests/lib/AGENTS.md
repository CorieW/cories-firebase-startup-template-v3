# packages/dashboard/tests/lib

Unit tests for shared dashboard auth, environment, billing, routing, and theming helpers.

## Directories

- None.

## Files

- `auth-autumn-ids.test.ts`: Tests Autumn-safe customer and entity id helpers.
- `auth-ui-toast.test.ts`: Tests Better Auth toast normalization and dashboard toast mapping.
- `auth-user-normalization.test.ts`: Tests auth user write normalization before Firestore persistence.
- `auth.test.ts`: Tests dashboard auth guard helpers.
- `billing-api.test.ts`: Tests billing scope and Autumn provider key helpers for personal and org switching.
- `chat-usage.test.ts`: Tests shared chat usage sizing and credit-cost helpers.
- `env.test.ts`: Tests dashboard environment normalization for Firebase credentials.
- `route-guards.test.ts`: Tests route guard helpers.
- `social-links.test.ts`: Tests dashboard footer social links derived from shared template globals.
- `theme.test.ts`: Tests theme helpers.

## Writing Rules

- Keep these suites focused on exported helper contracts and normalization behavior rather than internal implementation details.
- Add new shared helper tests here instead of colocating them with `src/lib` modules.
- Update file when new helper suites are added, removed, or repurposed in big way.
