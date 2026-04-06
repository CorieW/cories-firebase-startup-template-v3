# packages/back/src/webhooks

Webhook handlers and exports for external provider callbacks.

## Directories

- None.

## Files

- `index.ts`: Webhook export barrel.

## Writing Rules

- Keep webhook files focused on exported handlers plus provider-specific verification, response flow, and orchestration.
- Move reusable header parsing, request normalization, or mutation helpers into sibling modules or shared utilities once they stop being tiny and single-purpose.
