# .github/workflows

Workflow entrypoints for CI, coverage, E2E, AGENTS validation, and Changesets release automation.

## Directories

- None.

## Files

- `changesets.yml`: Pull request workflow that requires a changeset when workspace packages change.
- `ci.yml`: Main CI workflow.
- `e2e-full.yml`: Full end-to-end suite workflow.
- `e2e-smoke-pr.yml`: PR smoke E2E workflow.
- `pr-coverage.yml`: Pull request coverage reporting workflow.
- `release.yml`: Main-branch workflow that creates or updates the Changesets version PR.
- `upload-coverage.yml`: Coverage upload workflow.
- `validate-agents.yml`: AGENTS hierarchy validation workflow for AGENTS and validator changes.

## Writing Rules

- Keep workflow names and triggers clear because they surface in the GitHub UI.
- Prefer shared setup via reusable actions instead of copy-pasted environment wiring.
