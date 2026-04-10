# .github/actions/setup-workflow-env

Reusable action for injecting shared environment config into workflows.

## Directories

- None.

## Files

- `action.yml`: GitHub Action def used across workflows. Rules: Keep required inputs aligned with workflow usage and repo secrets.

## Writing Rules

- Prefer reusable setup logic here instead of duplicating workflow steps.
- Update calling workflows when this action changes its inputs or outputs.
