/**
 * Dashboard unit-test configuration.
 */
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  resolve: {
    alias: {
      '@cories-firebase-startup-template-v3/common': path.resolve(
        __dirname,
        '../common/src/index.ts'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules/**', '.output/**', 'tests/e2e/**'],
    passWithNoTests: false,
  },
});
