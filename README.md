# Corie's Firebase Startup Template

Monorepo Firebase app template. Has dashboard, docs, admin, app-specific Firebase Fns backend, shared TypeScript package.

## Prerequisites

- Node.js 22.x
- pnpm
- Firebase CLI (`firebase-tools`) 14.4.0 or newer
- Firebase project on Blaze plan with Firestore and Fns enabled

Need App Hosting only when ready to deploy dashboard or docs.

## Quick Start: First Local Run

1. Make new repo from template. Clone local.

1. Install deps from repo root.

```bash
pnpm install
```

1. Rename project and package scope.

```bash
pnpm rename <new-name>
```

1. Reinstall deps. Check workspace still builds.

```bash
pnpm install
pnpm build
```

1. Point template at Firebase project.

- Update `.firebaserc` so default project matches your Firebase project ID.
- Search repo for `demo-startup-template`. Replace project-specific placeholders you want gone now.
- Log in to Firebase. Pick project.

```bash
firebase login
firebase use <your-project-id>
```

1. Make local env files.

```bash
cp packages/dashboard/.env.example packages/dashboard/.env
cp packages/admin/.env.example packages/admin/.env
cp packages/back/.env.example packages/back/.env
```

1. Fill required local env values.

Dashboard env (`packages/dashboard/.env`):

- Need now: `FIREBASE_PROJECT_ID`
- Need later for prod: `APP_URL`, `BETTER_AUTH_SECRET`
- Optional now or later: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTUMN_SECRET_KEY`, `AUTUMN_SEAT_FEATURE_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Not using Google OAuth, Autumn, or Resend yet: delete placeholder values or leave unset. Dashboard treats non-empty values as configured.
- Leave `FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"` for local dev unless you changed emulator port on purpose.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` can stay unset locally when using emulator or app default credentials.

Admin env (`packages/admin/.env`):

- Need now: `APP_URL`, `BETTER_AUTH_SECRET`, `FIREBASE_PROJECT_ID`
- `APP_URL` usually stays `http://localhost:3002` for local dev.
- `BETTER_AUTH_SECRET` must match dashboard value so admin auth tokens work across both apps.
- Admin and dashboard use separate Better Auth cookie namespaces, so sign-in does not carry across automatically.
- Optional now or later: `AUTUMN_SECRET_KEY`, `ADMIN_EXTERNAL_TOOLS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Leave `FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"` for local emulator use unless you changed Firestore emulator port on purpose.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` can stay unset locally when using emulator or app default credentials.
- Not using Autumn or Resend yet: delete placeholder values or leave unset. Admin treats non-empty values as configured.
- `ADMIN_EXTERNAL_TOOLS` powers optional admin sidebar shortcuts. Value is JSON array like `[{"label":"Firebase","href":"https://console.firebase.google.com/project/your-project-id/overview"},{"label":"Autumn","href":"https://app.useautumn.com"}]`.

Backend env (`packages/back/.env`):

- Need now: `PROJECT_ID`, `PRIVATE_KEY`, `CLIENT_EMAIL`, `MY_FIRESTORE_EMULATOR_HOST`
- Backend package needs real Firebase Admin credentials even for local Fns flow.

1. Start local dev from repo root.

```bash
pnpm dev
```

1. Check app runs.

- Open `http://localhost:3000`
- Expect marketing page on `http://localhost:3000`
- Expect dashboard on `http://localhost:3001`
- Expect admin app on `http://localhost:3002`
- Expect docs app on `http://localhost:3003`
- Expect `common` and `back` watch builds plus Firestore and Fns emulators

1. Make first admin user.

- Make normal Better Auth user first through dashboard flow. Admin app does not allow public sign-up.
- Find that user's uid in `auth_users` Firestore collection.
- Create Firestore doc at `app_admins/{uid}` with `admin` role and active status.

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

- After allowlist record exists, sign in at `http://localhost:3002/sign-in` with same user account.

## Full Setup: Project Bootstrap

Do these after first local run works.

1. Create or connect App Hosting backend for dashboard.

```bash
firebase apphosting:backends:create --project <your-project-id>
```

- When prompted for root dir, use `packages/dashboard`
- `firebase.json` is set for `backendId: frontend`; if you pick different backend ID, update `firebase.json`
- `firebase.json` already includes App Hosting entries for dashboard (`backendId: frontend`) and docs (`backendId: docs`)
- Admin app runs locally at `packages/admin`; template does not wire it to Firebase App Hosting out of box

1. Configure prod integrations you need.

- Better Auth providers
- Autumn products, features, and `AUTUMN_SEAT_FEATURE_ID`
- Resend sender details
- App Hosting env vars and secrets in `packages/dashboard/apphosting.yaml`

1. Customize template for product.

- Rename shared template branding, support contact details, boilerplate constants, and default footer social links in `packages/common/src/global.ts` first so marketing, dashboard, and admin shells all pick up new product identity
- Update docs metadata, starter pages, content org under `packages/docs/content/docs`
- Refresh marketing layout, story, visual tokens in `packages/marketing/src/components/marketing` and `packages/marketing/src/styles.css`
- Default marketing homepage opens with full-window hero slideshow. Tailor slide copy, CTA targets, background treatments in `packages/marketing/src/components/marketing/MarketingHero.tsx`
- Update branding, colors, copy, static assets in `packages/dashboard`
- Adjust docs shell, theme overrides in `packages/docs/src`
- Adjust shared dashboard visual tokens in `packages/dashboard/src/styles.css` and reusable dashboard surface/action classes in `packages/dashboard/src/lib/ui.ts`
- Reuse shared frontend auth, brand, theme helpers, shared theme token CSS from `packages/common/src/client` before you duplicate app-entry UI, browser theme logic, or palette constants
- Reuse shared frontend document, root util classes from `packages/common/src/client` so typography, text rendering stay aligned across app shells
- Keep frontend Tailwind scans pointed at `packages/common/src` so shared component utils compile consistently in dashboard, admin, marketing, and docs
- Update SEO files in `packages/dashboard/index.html` and `packages/dashboard/public`
- Update shared user-facing messages in `packages/common/src/messages/messages.json`
- Implement or extend backend callables, triggers in `packages/back/src`

1. Set up repo automation if you want included workflows.

- Make GitHub labels `automated` and `deps` for Dependabot triage
- Configure [Codecov](https://about.codecov.io/) if you want coverage reporting from included workflows

## Docs Authoring

- Docs content in `packages/docs/content/docs`
- Add new pages as `.mdx` files. Use nearby `meta.json` files to control section structure and ordering
- Docs app exposes shared MDX component registry for callouts, tabs, steps, code blocks, images, video, and embeds
- Run docs package alone: `pnpm dev:docs`
- Search uses Fumadocs built-in Orama integration. Indexes MDX content tree automatically during build, test runs

## Stack

- Dashboard (`packages/dashboard`): TanStack Start, React 19, Better Auth, Better Auth UI, Autumn, Tailwind
- Docs (`packages/docs`): TanStack Start, Fumadocs, MDX, Tailwind
- Admin (`packages/admin`): TanStack Start, Better Auth, Better Auth UI, Firebase Admin, read-only admin tooling
- Backend (`packages/back`): Firebase Fns, Firebase Admin, TypeScript
- Shared (`packages/common`): shared API types, constants, utils, messages
- Tooling: pnpm workspaces, ESLint, Knip, Prettier, prettier-plugin-tailwindcss, Vitest, Playwright, Firebase Emulator Suite

## Architecture

- Better Auth runs inside dashboard Nitro server at `/api/auth/*`
- Dashboard email/password sign-up creates session right away. No email verification before access
- Admin app runs its own Better Auth server at `/api/auth/*` and expects admin users to already exist in Better Auth plus be allowlisted in Firestore `app_admins/{uid}` with `role: "admin"`
- Dashboard and admin share Better Auth backend data, secret. Each app uses its own cookie prefix, so browser sessions stay separate
- Dashboard and admin auth entry routes share Better Auth UI wrapper from `packages/common/src/client`
- Dashboard, admin, marketing, and docs share base frontend theme constants from `packages/common/src/client`
- Dashboard, admin, and docs document roots share body util class baseline from `packages/common/src/client`
- Dashboard support navigation lives under `/support`, with Docs at `/support/docs` and Contact forwarding straight into support chat
- Admin shell uses fixed dark theme so internal tooling visual treatment stays consistent
- Docs app uses Fumadocs on TanStack Start with MDX pages under `packages/docs/content/docs` and `meta.json` files for page tree structure
- Admin listing routes keep pagination state in URL search params so filters, page position can be shared direct
- Admin user detail page can also show read-only personal Autumn wallet balance when `AUTUMN_SECRET_KEY` is configured for admin app
- Admin Playwright coverage seeds Firestore auth and admin records locally. Then enables Autumn-backed billing assertions for user and org detail views when admin test env exposes `AUTUMN_SECRET_KEY`
- Better Auth UI owns sign-in, sign-up, account, org, member, and invitation flows
- Autumn owns subscription checkout, billing portal, invoices, and seat-linked billing state
- App-owned profile docs live in Firestore `users/{id}`. Better Auth writes auth and org data to `auth_*` collections
- `packages/back` is for app-specific Firebase Fns, not template auth or billing ownership

## Common Commands

- Start local dev: `pnpm dev`
- Start docs only: `pnpm dev:docs`
- Build all workspaces: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Unused files, exports, deps: `pnpm lint:knip`
- Full cleanup check: `pnpm cleanup:check`
- Format check: `pnpm format:check`
- Format write: `pnpm format`
- Prettier formatting also sorts Tailwind util classes through `prettier-plugin-tailwindcss`
- Check AGENTS hierarchy: `pnpm agents:check`
- Fix AGENTS hierarchy docs: `pnpm agents:fix`
- Add changeset: `pnpm changeset`
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
- Deploy helpers temporarily pack `packages/common` and switch backend package to local tgz. App workspaces keep shared package linked through workspace during normal dev and CI
- Firestore indexes deploy: `firebase deploy --only firestore:indexes`
- Direct dashboard deploy: `firebase deploy --only apphosting:frontend`
- Direct docs deploy: `firebase deploy --only apphosting:docs`
- Direct Functions deploy: `firebase deploy --only functions`
- Admin user and org detail pages rely on included `auth_members` composite indexes, so deploy `firestore.indexes.json` before using those views against prod

## Versioning

- When PR changes code in `packages/*` and should bump package version, add changeset with `pnpm changeset`
- On pushes to `main`, `Release` workflow uses Changesets to create or update version PR for pending changesets
- Repo versions private workspace packages through Changesets. Does not publish them to npm by default

## Included CI Automation

- `.github/workflows/ci.yml`
- `.github/workflows/changesets.yml`
- `.github/workflows/pr-coverage.yml`
- `.github/workflows/release.yml`
- `.github/workflows/upload-coverage.yml`
- `.github/dependabot.yml`
