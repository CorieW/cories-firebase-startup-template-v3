/**
 * Docs unit-test configuration.
 */
import path from 'node:path';
import mdx from 'fumadocs-mdx/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import * as docsConfig from './source.config';

export default defineConfig({
  plugins: [mdx(docsConfig), tsconfigPaths({ projects: ['./tsconfig.json'] })],
  resolve: {
    alias: {
      '@cories-firebase-startup-template-v3/common/client': path.resolve(
        __dirname,
        '../common/src/client/index.ts'
      ),
      '@cories-firebase-startup-template-v3/common': path.resolve(
        __dirname,
        '../common/src/index.ts'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules/**', '.output/**', 'tests/e2e/**'],
    passWithNoTests: false,
  },
});
