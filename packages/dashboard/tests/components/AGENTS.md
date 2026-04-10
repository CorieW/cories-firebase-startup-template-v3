# packages/dashboard/tests/components

Component and feature tests for shared dashboard UI grouped by product area.

## Directories

- `billing/`: Billing dashboard tests and shared billing test helpers.
- `chat/`: Chat-panel tests for assistant and support flows.
- `shell/`: Authenticated shell and sidebar behavior tests.
- `support/`: Support-card and support-page interaction tests.
- `toast/`: Toast provider behavior tests.

## Files

- `Header.test.tsx`: Tests header auth-shell gating behavior.
- `NotFoundPage.test.tsx`: Tests dashboard not-found experience.
- `ThemeToggle.test.tsx`: Tests theme toggle state and document updates.

## Writing Rules

- Keep tests grouped by component area they exercise, even when suite uses shared providers or mocks.
- Move test-only helpers into this subtree rather than leaving them under `src`.
- Update file when shared component test coverage expands into new feature subdirectory or new root suite.
