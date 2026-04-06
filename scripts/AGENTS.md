# scripts

Repository helper scripts for environment export, rename flow, dependency toggling, dashboard smoke checks, and AGENTS scaffolding, syncing, and validation.

## Directories

- None.

## Files

- `export-ci-env.mjs`: Exports CI environment variables for workflows.
- `pack-common.js`: Packs the common package for tgz-based workflows.
- `rename-project.js`: Renames project and package identifiers across the repo.
- `toggle-common-dependency.js`: Switches the backend common dependency between workspace and tgz modes.
- `verify-dashboard-preview.mjs`: Verifies public and protected route behavior against the built dashboard server.

## Writing Rules

- Keep scripts deterministic and safe to run from automation.
- Add or update integration tests in `packages/common/tests/script-contracts.integration.test.ts` when script behavior changes.
- Always have a comment at the top of the script that documents what the script does, and the numbered steps of what the script takes.
