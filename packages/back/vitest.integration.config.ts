/**
 * Backend integration-test configuration.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.int.test.ts'],
    exclude: ['node_modules/**', 'lib/**', 'dist/**'],
    passWithNoTests: false,
  },
});
