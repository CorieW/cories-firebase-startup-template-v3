# packages/common/src/messages

Shared user-facing message catalog and access helpers.

## Directories

- None.

## Files

- `index.ts`: Message export helpers.
- `messages.ts`: Shared message strings.
  Rules:
  - Keep keys stable because multiple packages reference them.

## Writing Rules

- Keep shared copy centralized here when multiple packages use it.
- Update tests when message keys or semantics change.
