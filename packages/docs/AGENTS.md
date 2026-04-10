# packages/docs

Public TanStack Start docs workspace powered by Fumadocs, MDX content, and package-scoped tests.

## Directories

- `content/`: MDX docs content tree and section metadata for navigation and search.
- `src/`: Docs app source for routing, shell components, content loaders, and styles.
- `tests/`: Package-level unit, integration, and E2E coverage for docs behavior.

## Files

- `.gitignore`: Docs-local ignore rules for generated outputs and local artifacts.
- `apphosting.yaml`: Firebase App Hosting config for docs server deploy.
- `package.json`: Docs workspace manifest, scripts.
  Rules:
  - Keep scripts aligned with root workspace commands and App Hosting expectations.
- `playwright.config.ts`: Playwright smoke config for docs app.
- `source.config.ts`: Fumadocs MDX collection config and frontmatter schema.
- `tsconfig.json`: Docs TypeScript config.
- `vite.config.ts`: Vite build and dev-server config for docs app.
- `vitest.config.ts`: Docs unit-test config.

## Writing Rules

- Keep docs authoring file-based under `content/` and keep runtime code focused on shell, loaders, and MDX components under `src/`.
- Update file when docs workspace gains, loses, renames, or repurposes in big way immediate children.
