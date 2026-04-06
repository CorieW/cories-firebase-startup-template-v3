/**
 * Backend unit-test configuration.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'lib/**', 'dist/**', 'tests/**/*.int.test.ts'],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    },
  },
});
