# scripts

Repo helper scripts for environment export, rename flow, dep toggling, dashboard smoke checks, and AGENTS scaffolding, syncing, and validation.

## Directories

- None.

## Files

- `export-ci-env.mjs`: Exports CI env vars for workflows.
- `pack-common.js`: Packs common package for tgz-based workflows.
- `rename-project.js`: Renames project and package identifiers across repo.
- `toggle-common-dependency.js`: Switches backend common dep between workspace and tgz modes.
- `verify-dashboard-preview.mjs`: Verifies public and protected route behavior against built dashboard server.

## Writing Rules

- Keep scripts deterministic and safe to run from automation.
- Add or update integration tests in `packages/common/tests/script-contracts.integration.test.ts` when script behavior changes.
- Always have comment at top of script that documents what script does, and numbered steps of what script takes.
