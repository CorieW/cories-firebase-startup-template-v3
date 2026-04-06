# packages/dashboard/src/routes

File-based route modules for the dashboard app.

## Directories

- None.

## Files

- `__root.tsx`: Root route shell, layout, and global providers.
- `api.auth.$.ts`: Better Auth API route mounted under the dashboard server.
- `api.chat-usage.ts`: Server route that records app chat usage against Autumn billing.
- `assistant.tsx`: Simple wallet-backed product chat route module.
- `chat.tsx`: Chat route module.
- `create-organization.tsx`: Organization creation route.
- `index.tsx`: Landing or home route module.
- `organization-profile.$.tsx`: Organization profile route module.
- `organization-profile.accept-invitation.tsx`: Organization invitation acceptance route module.
- `pricing.subscriptions.tsx`: Generic subscriptions pricing route that resolves billing scope from the active session.
- `pricing.tsx`: Generic pricing index route that redirects to subscriptions.
- `pricing.wallet.tsx`: Generic wallet pricing route that resolves billing scope from the active session.
- `sign-in.$.tsx`: Sign-in route module.
- `sign-up.$.tsx`: Sign-up route module.
- `support.tsx`: Support route module.
- `user-profile.$.tsx`: User profile route module.

## Writing Rules

- Keep each route module centered on the exported `Route`, route-level redirects or validation, and the page component.
- Keep route modules responsible for route composition and loader-level coordination, not shared UI primitives.
- Prefer route-local helpers only when they are tiny and single-use; move reusable parsing, normalization, and data helpers into `../lib`.
- Keep pricing-route redirects and scope guards explicit so billing entrypoints stay easy to audit when paths change.
