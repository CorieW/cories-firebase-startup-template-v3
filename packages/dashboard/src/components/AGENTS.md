# packages/dashboard/src/components

Shared presentation components grouped by product area.

## Directories

- `auth/`: Auth route wrappers and Better Auth UI composition.
- `billing/`: Billing-specific UI blocks.
- `chat/`: Chat UI pieces.
- `shell/`: Authenticated and unauthenticated app shell pieces.
- `support/`: Support-page cards, content, and search components.
- `toast/`: Toast notification provider components.
- `ui/`: Low-level reusable UI primitives.

## Files

- `AppBrand.tsx`: Shared brand mark and text component.
- `Footer.tsx`: Dashboard wrapper around shared site footer.
- `Header.tsx`: Top navigation or header component.
- `NotFoundPage.tsx`: Root 404 component.
- `PageHeader.tsx`: Reusable page heading component.
- `SocialLink.tsx`: Compatibility wrapper around shared footer social link pill.
- `ThemeToggle.tsx`: Theme switcher component.

## Writing Rules

- Keep cross-page components generic and move domain-specific behavior into child feature folders.
- Pair complex shared components with tests when they carry meaningful state or interaction logic.
- Keep low-level reusable primitives in `ui/` and leave feature-specific composition in sibling dirs.
