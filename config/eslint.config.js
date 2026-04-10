/**
 * Shared ESLint configuration.
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/lib/**',
    '**/coverage/**',
    '**/.vitest/**',
    '**/.output/**',
    '**/.tanstack/**',
    '**/.source/**',
    '**/tests/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.gen.*',
    '**/node_modules/**',
    '**/.pnpm-store/**',
    '**/pnpm-lock.yaml',
    '**/.tmp/**',
    '**/playwright-report/**',
    '**/test-results/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: [
      'scripts/**/*.{js,ts}',
      'config/**/*.{js,ts}',
      '**/*.config.{js,ts,mjs,cjs}',
      'vitest.workspace.ts',
      'packages/back/**/*.{js,ts}',
      'packages/common/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
