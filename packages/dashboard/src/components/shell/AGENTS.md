# packages/dashboard/src/components/shell

Authenticated and unauthenticated app shell components.

## Directories

- None.

## Files

- `SidebarAccountPanel.tsx`: Extracted signed-in sidebar account and organization switcher section.
- `SidebarNavLink.tsx`: Reusable signed-in sidebar navigation link renderer.
- `SignedInSidebar.tsx`: Authenticated navigation and sidebar shell.
- `SignedOutHeader.tsx`: Signed-out header variant.
- `signed-in-sidebar.constants.ts`: Signed-in sidebar nav definitions and shared class constants.

## Writing Rules

- Keep auth-shell gating and layout concerns here rather than inside feature pages.
- Prefer small composable shell pieces because many routes depend on them.
