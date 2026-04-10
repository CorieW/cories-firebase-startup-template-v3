# Corie's Firebase Startup Template

Monorepo template for Firebase apps with TanStack Start dashboard and docs apps, an app-specific Firebase Functions backend, and a shared TypeScript package.

## Prerequisites

- Node.js 22.x
- pnpm
- Firebase CLI (`firebase-tools`) 14.4.0 or newer
- A Firebase project on the Blaze plan with Firestore and Functions enabled

App Hosting is only required when you are ready to deploy the dashboard or docs apps.

## Quick Start: First Local Run

1. Create a new repository from this template and clone it locally.
2. Install dependencies from the repo root.

```bash
pnpm install
```

1. Rename the project and package scope.

```bash
pnpm rename <new-name>
```

1. Reinstall dependencies and verify the workspace still builds.

```bash
pnpm install
pnpm build
```

1. Point the template at your Firebase project.

- Update `.firebaserc` so the default project is your Firebase project ID.
- Search the repo for `demo-startup-template` and replace any remaining project-specific placeholders you want to update now.
- Log in to Firebase and select your project.

```bash
firebase login
firebase use <your-project-id>
```

1. Create your local env files.

```bash
cp packages/dashboard/.env.example packages/dashboard/.env
cp packages/admin/.env.example packages/admin/.env
cp packages/back/.env.example packages/back/.env
```

1. Fill in the required local env values.

Dashboard env (`packages/dashboard/.env`):

- Required now: `FIREBASE_PROJECT_ID`
- Required for production later: `APP_URL`, `BETTER_AUTH_SECRET`
- Optional now or later: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTUMN_SECRET_KEY`, `AUTUMN_SEAT_FEATURE_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- If you are not setting up Google OAuth, Autumn, or Resend yet, delete those placeholder values or leave them unset. The dashboard treats non-empty values as configured.
- Leave `FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"` for local development unless you intentionally changed the emulator port.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` can stay unset locally when you are using the emulator or application default credentials.

Admin env (`packages/admin/.env`):

- Required now: `APP_URL`, `BETTER_AUTH_SECRET`, `FIREBASE_PROJECT_ID`
- `APP_URL` should normally stay `http://localhost:3002` for local development.
- `BETTER_AUTH_SECRET` should match the dashboard value so admin auth tokens are compatible across both apps.
- The admin and dashboard apps use separate Better Auth cookie namespaces, so signing into one app does not automatically sign you into the other.
- Optional now or later: `AUTUMN_SECRET_KEY`, `ADMIN_EXTERNAL_TOOLS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Leave `FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"` in place for local emulator usage unless you intentionally changed the Firestore emulator port.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` can stay unset locally when you are using the emulator or application default credentials.
- If you are not setting up Autumn or Resend yet, delete those placeholder values or leave them unset. The admin app treats non-empty values as configured.
- `ADMIN_EXTERNAL_TOOLS` powers the optional admin sidebar shortcuts and accepts a JSON array like `[{"label":"Firebase","href":"https://console.firebase.google.com/project/your-project-id/overview"},{"label":"Autumn","href":"https://app.useautumn.com"}]`.

Backend env (`packages/back/.env`):

- Required now: `PROJECT_ID`, `PRIVATE_KEY`, `CLIENT_EMAIL`, `MY_FIRESTORE_EMULATOR_HOST`
- The backend package requires real Firebase Admin credentials even for the local Functions flow.

1. Start local development from the repo root.

```bash
pnpm dev
```

1. Verify the app is running.

- Open `http://localhost:3000`
- Expect the marketing page on `http://localhost:3000`, the dashboard on `http://localhost:3001`, the admin app on `http://localhost:3002`, the docs app on `http://localhost:3003`, plus the `common` and `back` watch builds and the Firestore and Functions emulators

1. Create your first admin user.

- Create a normal Better Auth user first through the dashboard flow. The admin app does not allow public sign-up.
- Find that user's uid in the `auth_users` Firestore collection.
- Create a Firestore document at `app_admins/{uid}` with the `admin` role and active status.

```json
{
  "role": "admin",
  "status": "active",
  "notes": "Initial admin",
  "createdAt": "<Firestore Timestamp>",
  "updatedAt": "<Firestore Timestamp>",
  "createdBy": null,
  "updatedBy": null
}
```

- After the allowlist record exists, sign in at `http://localhost:3002/sign-in` with that same user account.

## Full Setup: Project Bootstrap

Complete these after the first local run is working.

1. Create or connect an App Hosting backend for the dashboard.

```bash
firebase apphosting:backends:create --project <your-project-id>
```

- When prompted for the root directory, use `packages/dashboard`
- `firebase.json` is set up for `backendId: frontend`; if you choose a different backend ID, update `firebase.json`
- `firebase.json` now includes App Hosting entries for the dashboard (`backendId: frontend`) and docs (`backendId: docs`). The admin app runs locally at `packages/admin` but is not wired to a Firebase App Hosting backend out of the box.

1. Configure production integrations as needed.

- Better Auth providers
- Autumn products, features, and `AUTUMN_SEAT_FEATURE_ID`
- Resend sender details
- App Hosting env vars and secrets in `packages/dashboard/apphosting.yaml`

1. Customize the template for your product.

- Rename the shared template branding, support contact details, boilerplate constants, and default footer social links in `packages/common/src/global.ts` first so the marketing, dashboard, and admin shells pick up your new product identity consistently
- Update docs-specific metadata, starter pages, and content organization under `packages/docs/content/docs`
- Refresh the marketing page layout, storytelling, and visual tokens in `packages/marketing/src/components/marketing` and `packages/marketing/src/styles.css`
- Update branding, colors, copy, and static assets in `packages/dashboard`
- Adjust the docs shell and theme overrides in `packages/docs/src`
- Adjust the shared dashboard visual tokens in `packages/dashboard/src/styles.css` and reusable dashboard surface/action classes in `packages/dashboard/src/lib/ui.ts`
- Reuse shared frontend auth, brand, theme helpers, and shared theme token CSS from `packages/common/src/client` before duplicating app-entry UI, browser theme logic, or palette constants in app packages
- Reuse shared frontend document/root utility classes from `packages/common/src/client` so typography and text rendering stay aligned across app shells
- Keep frontend Tailwind scans pointed at `packages/common/src` so shared component utilities compile consistently in dashboard, admin, marketing, and docs
- Update SEO-related files in `packages/dashboard/index.html` and `packages/dashboard/public`
- Update shared user-facing messages in `packages/common/src/messages/messages.json`
- Implement or extend backend callables and triggers in `packages/back/src`

## Docs Authoring

- Docs content lives in `packages/docs/content/docs`
- Add new pages as `.mdx` files and use nearby `meta.json` files to control section structure and ordering
- The docs app exposes a shared MDX component registry for callouts, tabs, steps, code blocks, images, video, and embeds
- Run the docs package by itself with `pnpm dev:docs`
- Search is powered by Fumadocs' built-in Orama integration and indexes the MDX content tree automatically during build and test runs

1. Set up repo automation if you want the included workflows.

- Create GitHub labels `automated` and `dependencies` for Dependabot triage
- Configure [Codecov](https://about.codecov.io/) if you want coverage reporting from the included workflows

## Stack

- Dashboard (`packages/dashboard`): TanStack Start, React 19, Better Auth, Better Auth UI, Autumn, Tailwind
- Docs (`packages/docs`): TanStack Start, Fumadocs, MDX, Tailwind
- Admin (`packages/admin`): TanStack Start, Better Auth, Better Auth UI, Firebase Admin, read-only admin tooling
- Backend (`packages/back`): Firebase Functions, Firebase Admin, TypeScript
- Shared (`packages/common`): shared API types, constants, utilities, and messages
- Tooling: pnpm workspaces, ESLint, Prettier, Vitest, Playwright, Firebase Emulator Suite

## Architecture

- Better Auth runs inside the dashboard Nitro server at `/api/auth/*`
- Dashboard email/password sign-up creates a session immediately and does not require email verification before access
- The admin app runs its own Better Auth server at `/api/auth/*` and expects admin users to already exist in Better Auth plus be allowlisted in Firestore `app_admins/{uid}` with `role: "admin"`
- Dashboard and admin share the Better Auth backend data and secret, but each app uses its own cookie prefix so browser sessions stay separate.
- Dashboard and admin auth entry routes share their Better Auth UI wrapper from `packages/common/src/client`
- Dashboard, admin, marketing, and docs share their base frontend theme constants from `packages/common/src/client`
- Dashboard, admin, and docs document roots share their body utility class baseline from `packages/common/src/client`
- Dashboard support navigation is grouped under `/support`, with Docs at `/support/docs` and Contact forwarding straight into support chat
- The admin shell uses a fixed dark theme to keep the internal tooling visual treatment consistent
- The docs app uses Fumadocs on TanStack Start with MDX pages under `packages/docs/content/docs` and `meta.json` files for page tree structure
- Admin listing routes keep pagination state in URL search params so filters and page position can be shared directly
- The admin user detail page can also show a read-only personal Autumn wallet balance when `AUTUMN_SECRET_KEY` is configured for the admin app
- Admin Playwright coverage seeds Firestore auth and admin records locally, then enables Autumn-backed billing assertions for user and organization detail views when the admin test environment exposes `AUTUMN_SECRET_KEY`
- Better Auth UI owns sign-in, sign-up, account, organization, member, and invitation flows
- Autumn owns subscription checkout, billing portal, invoices, and seat-linked billing state
- App-owned profile documents live in Firestore `users/{id}`, while Better Auth writes auth and organization data to `auth_*` collections
- `packages/back` is reserved for app-specific Firebase Functions, not template auth or billing ownership

## Common Commands

- Start local development: `pnpm dev`
- Start docs only: `pnpm dev:docs`
- Build all workspaces: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Format write: `pnpm format`
- Check AGENTS hierarchy: `pnpm agents:check`
- Fix AGENTS hierarchy docs: `pnpm agents:fix`
- Add a changeset: `pnpm changeset`
- Apply pending changesets locally: `pnpm changeset:version`
- Test all packages: `pnpm test`
- Integration tests: `pnpm test:integration`
- CI-equivalent test run: `pnpm test:ci`
- E2E tests: `pnpm test:e2e`
- Coverage: `pnpm test:coverage`

## Deployment

- Dashboard deploy helper: `pnpm deploy:dashboard`
- Docs deploy helper: `pnpm deploy:docs`
- Backend deploy helper: `pnpm deploy:back`
- Full deploy helper: `pnpm deploy`
- The deploy helpers temporarily pack `packages/common` and switch the backend package to a local tgz; the app workspaces keep the shared package linked through the workspace during normal development and CI.
- Firestore indexes deploy: `firebase deploy --only firestore:indexes`
- Direct dashboard deploy: `firebase deploy --only apphosting:frontend`
- Direct docs deploy: `firebase deploy --only apphosting:docs`
- Direct Functions deploy: `firebase deploy --only functions`
- The admin user and organization detail pages rely on the included `auth_members` composite indexes, so deploy `firestore.indexes.json` before using those views against production.

## Versioning

- When a PR changes code in `packages/*` and should result in a package version bump, add a changeset with `pnpm changeset`.
- On pushes to `main`, the `Release` workflow uses Changesets to create or update a version PR for pending changesets.
- This repo versions private workspace packages through Changesets, but it does not publish them to npm by default.

## Included CI Automation

- `.github/workflows/ci.yml`
- `.github/workflows/changesets.yml`
- `.github/workflows/pr-coverage.yml`
- `.github/workflows/release.yml`
- `.github/workflows/upload-coverage.yml`
- `.github/dependabot.yml`
