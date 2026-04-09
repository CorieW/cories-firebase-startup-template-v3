# packages/docs/src/components

Reusable docs presentation components for the shell, MDX blocks, and route rendering.

## Directories

- None.

## Files

- `AppBrand.tsx`: Shared brand lockup used in the docs shell.
- `DocEmbed.tsx`: Trusted iframe embed block for MDX docs pages.
- `DocImage.tsx`: Rich image block for MDX docs pages.
- `DocVideo.tsx`: Rich video block for MDX docs pages.
- `DocsPageContent.tsx`: Client-rendered MDX page body for docs content routes.
- `DocsSearchTriggers.tsx`: Search trigger wrappers used by the docs shell.
- `DocsShell.tsx`: Shared docs navigation shell built on top of Fumadocs DocsLayout.
- `DocsSidebarBanner.tsx`: Editorial sidebar intro banner for the docs package.
- `DocsThemeSwitch.tsx`: Shared-theme toggle used by the docs navigation shell.
- `mdx.tsx`: Shared MDX component registry for docs content.

## Writing Rules

- Keep MDX-facing components composable and presentation-focused so docs authors get consistent rich blocks without route coupling.
- Update this file when this directory gains, loses, renames, or materially repurposes an immediate file.
