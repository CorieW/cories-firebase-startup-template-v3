# .github

GitHub-specific automation definitions for CI, coverage, and dependency upkeep.

## Directories

- `actions/`: Reusable GitHub Actions shared by workflows.
- `workflows/`: Workflow entrypoints for CI and automation.

## Files

- `dependabot.yml`: Dependabot update policy for repository dependencies.

## Writing Rules

- Keep shared automation behavior centralized here rather than in ad hoc workflow steps.
- Update this index when workflows or reusable actions are added, removed, or repurposed.
