# .github

GitHub-specific automation defs for CI, coverage, and dep upkeep.

## Directories

- `actions/`: Reusable GitHub Actions shared by workflows.
- `workflows/`: Workflow entrypoints for CI and automation.

## Files

- `dependabot.yml`: Dependabot update policy for repo deps.

## Writing Rules

- Keep shared automation behavior centralized here rather than in ad hoc workflow steps.
- Update index when workflows or reusable actions are added, removed, or repurposed.
