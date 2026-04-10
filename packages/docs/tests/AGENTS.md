# packages/docs/tests

Package-scoped verification for docs rendering, content loading, and smoke journeys.

## Directories

- `components/`: Rendering tests for docs shell and MDX media blocks.
- `e2e/`: Playwright smoke coverage for real docs navigation and search.
- `lib/`: Integration tests for docs content loading and search indexing.

## Files

- None.

## Writing Rules

- Keep test coverage focused on shell behavior, source correctness, and authoring contracts instead of brittle implementation details.
- Update file when `tests/` gains, loses, renames, or repurposes in big way immediate child.
