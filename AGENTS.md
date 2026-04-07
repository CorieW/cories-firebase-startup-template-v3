# .

Repository root for the Firebase startup template monorepo. Start here for repo-wide policies, package layout, shared tooling, and AGENTS hierarchy guidance.

## Directories

- `.changeset/`: Changesets configuration and contributor guidance for workspace versioning.
- `.cursor/`: Committed Cursor editor settings for this workspace.
- `.github/`: GitHub Actions workflows and repository automation.
- `config/`: Shared linting and formatting configuration.
- `packages/`: Workspace packages for backend, common, dashboard, admin, and marketing code.
- `scripts/`: Repository helper scripts for maintenance and validation.

## Files

- `.firebaserc`: Firebase project alias and target configuration.
  Rules:
  - Keep project ids and any Firebase target mappings aligned with deployment config.
- `.gitignore`: Ignore rules for generated artifacts and local-only files.
- `LICENSE`: Repository license text.
- `README.md`: Primary setup and usage guide.
  Rules:
  - Keep commands and setup steps in sync with workspace scripts.
- `firebase.json`: Firebase emulator and deployment configuration.
  Rules:
  - Keep App Hosting and Functions deployment config aligned with package structure.
- `firestore.indexes.json`: Firestore composite index definitions.
- `firestore.rules`: Firestore security rules.
- `package.json`: Root workspace manifest and cross-package scripts.
  Rules:
  - Keep root scripts aligned with package-level commands.
- `pnpm-workspace.yaml`: pnpm workspace package globs.
- `vitest.workspace.ts`: Vitest workspace coordination config.

## Generated Files

- `pnpm-lock.yaml`: pnpm dependency lockfile.
  Rules:
  - Refresh it through pnpm when the dependency graph changes.

## Writing Rules

- Read this file first, then descend into child AGENTS files for the target area.
- Keep repo-wide policy sections authoritative; child AGENTS files may narrow them locally.
- Document only immediate children here and update entries when top-level inventory changes.
- Use `pnpm agents:check` and `pnpm agents:fix` for AGENTS-guided maintenance in this repo.

## AGENTS Hierarchy

- Read AGENTS files from root to leaf.
- Let deeper AGENTS files override parent guidance for their own subtree.
- Do not add nested `AGENTS.md` files inside `.codex/skills/`; repo-local skills should rely on `SKILL.md` and `references/` instead.
- Treat tracked vendor/build outputs as excluded unless they are intentionally documented generated artifacts.
- Exclude `.git`, all `node_modules`, `packages/back/lib`, `packages/common/lib`, `packages/dashboard/.output`, `packages/dashboard/.tanstack`, `packages/dashboard/playwright-report`, `packages/dashboard/test-results`, `packages/admin/.output`, `packages/admin/.tanstack`, `packages/admin/playwright-report`, and `packages/admin/test-results`.

## Documentation Policy

- Ensure README.md is being updated as things are being added/changed.

## Coding Policy

- Treat this repository as a template for real future projects, not as a long-lived legacy app.
- Do not describe code as "legacy" or preserve outdated patterns for backward-compatibility theater when a cleaner template-level approach is appropriate.
- Prioritize testing for key functionality.
- Do not add dedicated tests for minor behavior unless that behavior is especially risky or business-critical.
- For changes that are not strictly adding a new feature (such as refactors, fixes, or removals), you should ask for permission in advance before adding any new tests.
- Minor functionality may still be included in test coverage (whether E2E, integration, or unit) when it fits naturally into existing testing.
- Add a short top-level comment to every non-generated file that supports comments, explaining what the file does.
- Add doc comments to important code units, such as classes, functions, and files, where they improve maintainability.
- Add inline comments when logic is unclear, non-obvious, or sufficiently complex to benefit from explanation.
- Write comments in plain language. Keep them concise and avoid jargon.
- Code should be modular and highly separated into components.
- Follow SOLID principles as closely as possible.
- Log primary actions (e.g. network requests, page switching, form submission, etc...) without being too noisy (keystroke logging, button clicking, scrolling).

## Testing Policy

- Use unit tests to validate key functionality across both common scenarios and relevant edge cases.
- Use integration tests to verify key functionality that depends on multiple parts of the system working together.
- Use Playwright for E2E testing to validate real user interactions across supported browsers.
- Treat billing as a high-risk area and give billing changes heavier-than-normal unit, integration, and E2E coverage to reduce costly regressions.
- E2E tests should simulate the real thing as closely as possible. This means, no mocking or stubbing of dependencies unless absolutely necessary.
- E2E tests should cover primary user journeys, not every small UI detail in isolation.
- Tests should not be flimsy to change; they should be robust and reliable. For example, do not write tests that are only valid for a specific implementation detail.
