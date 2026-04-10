# .

Repo root for Firebase startup template monorepo. Start here for repo-wide policy, package layout, shared tooling, AGENTS hierarchy guide.

## Directories

- `.changeset/`: Changesets config and contributor guide for workspace versioning.
- `.github/`: GitHub Actions workflows and repo automation.
- `config/`: Shared linting and formatting config.
- `packages/`: Workspace packages for backend, common, dashboard, admin, marketing, and docs code.
- `scripts/`: Repo helper scripts for maintenance and validation.

## Files

- `.firebaserc`: Firebase project alias and target config.
  Rules:
  - Keep project ids and any Firebase target mappings aligned with deploy config.
- `.gitignore`: Ignore rules for generated artifacts and local-only files.
- `LICENSE`: Repo license text.
- `README.md`: Primary setup, usage guide.
  Rules:
  - Keep commands and setup steps in sync with workspace scripts.
- `firebase.json`: Firebase emulator and deploy config.
  Rules:
  - Keep App Hosting and Fns deploy config aligned with package structure.
- `firestore.indexes.json`: Firestore composite index defs.
- `firestore.rules`: Firestore security rules.
- `knip.jsonc`: Shared Knip cleanup analysis config.
  Rules:
  - Keep ignore exceptions narrow and explain only repo-level binary or analysis gaps here.
- `package.json`: Root workspace manifest and cross-package scripts.
  Rules:
  - Keep root scripts aligned with package-level commands.
- `pnpm-workspace.yaml`: pnpm workspace package globs.
- `vitest.workspace.ts`: Vitest workspace coordination config.

## Generated Files

- `pnpm-lock.yaml`: pnpm dep lockfile.
  Rules:
  - Refresh it through pnpm when dep graph changes.

## Writing Rules

- Read file first, then descend into child AGENTS files for target area.
- Keep repo-wide policy sections authoritative; child AGENTS files may narrow them locally.
- Document only immediate children here and update entries when top-level inventory changes.
- Use `pnpm agents:check` and `pnpm agents:fix` for AGENTS-guided maintenance in repo.

## AGENTS Hierarchy

- Read AGENTS files from root to leaf.
- Let deeper AGENTS files override parent guide for their own subtree.
- Do not add nested `AGENTS.md` files inside `.codex/skills/`; repo-local skills should rely on `SKILL.md` and `references/` instead.
- Treat tracked vendor/build outputs as excluded unless they are intentionally documented generated artifacts.
- Exclude `.git`, all `node_modules`, `packages/back/lib`, `packages/common/lib`, `packages/dashboard/.output`, `packages/dashboard/.tanstack`, `packages/dashboard/playwright-report`, `packages/dashboard/test-results`, `packages/admin/.output`, `packages/admin/.tanstack`, `packages/admin/playwright-report`, and `packages/admin/test-results`.

## Documentation Policy

- Update README.md when things change.

## Coding Policy

- Treat repo as template for real future projects, not as long-lived legacy app.
- Do not call code "legacy" or keep outdated patterns for backward-compat theater when cleaner template-level approach fits.
- Prioritize testing for key functionality.
- Do not add dedicated tests for minor behavior unless behavior is risky or business-critical.
- For changes not strictly new features (refactors, fixes, removals), ask permission before adding new tests.
- Minor functionality can still land in test coverage (E2E, integration, unit) when it fits existing tests.
- Add short top-level comment to every non-generated file that supports comments, saying what file does.
- Add doc comments to important code units, like classes, fns, files, when they help maintainability.
- Add inline comments when logic is unclear, non-obvious, or complex enough to need explanation.
- Write comments in plain language. Keep them concise. Avoid jargon.
- Code should be modular, split clean into components.
- Follow SOLID as close as practical.
- Log primary actions (network requests, page switching, form submission, etc.) without too much noise (keystroke logging, button clicking, scrolling).

## Testing Policy

- Use unit tests for key functionality across common scenarios, relevant edge cases.
- Use integration tests for key functionality that depends on multiple parts working together.
- Use Playwright for E2E testing of real user interactions across supported browsers.
- Treat billing as high-risk. Give billing changes heavier unit, integration, E2E coverage to cut costly regressions.
- E2E tests should simulate real thing as close as possible. No mocking or stubbing deps unless absolutely necessary.
- E2E tests should cover primary user journeys, not every small UI detail alone.
- Tests should not be flimsy. Make them robust, reliable. Do not write tests valid only for specific implementation detail.
