# packages/docs

Public TanStack Start documentation workspace powered by Fumadocs, MDX content, and package-scoped tests.

## Directories

- `content/`: MDX docs content tree and section metadata for navigation and search.
- `src/`: Docs app source for routing, shell components, content loaders, and styles.
- `tests/`: Package-level unit, integration, and E2E coverage for docs behavior.

## Files

- `.gitignore`: Docs-local ignore rules for generated outputs and local artifacts.
- `apphosting.yaml`: Firebase App Hosting config for the docs server deployment.
- `package.json`: Docs workspace manifest and scripts.
  Rules:
  - Keep scripts aligned with root workspace commands and App Hosting expectations.
- `playwright.config.ts`: Playwright smoke configuration for the docs app.
- `source.config.ts`: Fumadocs MDX collection configuration and frontmatter schema.
- `tsconfig.json`: Docs TypeScript configuration.
- `vite.config.ts`: Vite build and dev-server configuration for the docs app.
- `vitest.config.ts`: Docs unit-test configuration.

## Writing Rules

- Keep docs authoring file-based under `content/` and keep runtime code focused on shell, loaders, and MDX components under `src/`.
- Update this file when the docs workspace gains, loses, renames, or materially repurposes immediate children.
