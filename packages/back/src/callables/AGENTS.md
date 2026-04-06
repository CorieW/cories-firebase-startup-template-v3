# packages/back/src/callables

Firebase callable entrypoint definitions exposed by the backend.

## Directories

- None.

## Files

- `index.ts`: Callable export barrel.

## Writing Rules

- Define exported callable functions here and avoid non-callable helper functions in this directory.
- Keep callable modules thin and push parsing, branching, and reusable logic into services or utilities.
