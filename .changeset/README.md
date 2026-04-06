# Changesets

This repo uses Changesets to track version bumps for the workspace packages under `packages/*`.

## Common Commands

- Create a new changeset: `pnpm changeset`
- Review pending release impact: `pnpm changeset:status`
- Apply pending version bumps locally: `pnpm changeset:version`

## When To Add One

- Add a changeset when your PR changes a package in `packages/*` and that change should be reflected in the next package version.
- Skip a changeset for repo-only work that should not affect package versions, such as workflow edits, documentation-only updates, or purely local tooling changes.

## CI Flow

- PRs that change `packages/*` are expected to include at least one `.changeset/*.md` file.
- Pushes to `main` run the `Release` workflow, which creates or updates a version PR from the pending changesets.
