# packages/marketing/src/components

Component library for the marketing app, covering page sections, shared brand elements, and lightweight UI primitives.

## Directories

- `marketing/`: Section-level components that build the landing page narrative and calls to action.
- `ui/`: Reusable presentation primitives for buttons, badges, and cards.

## Files

- `AppBrand.tsx`: Shared marketing brand lockup used in the header and footer.

## Writing Rules

- Keep shared components reusable across the marketing page, and avoid pushing section-specific copy or layout rules into the `ui/` primitives.
- Update this file when `components/` gains, loses, renames, or materially repurposes an immediate child.
