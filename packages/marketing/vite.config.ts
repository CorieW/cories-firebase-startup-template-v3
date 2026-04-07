/**
 * Vite build and dev-server configuration for the marketing site.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@cories-firebase-startup-template-v3/common/client',
        replacement: fileURLToPath(
          new URL('../common/src/client/index.ts', import.meta.url)
        ),
      },
      {
        find: '@cories-firebase-startup-template-v3/common',
        replacement: fileURLToPath(
          new URL('../common/src/index.ts', import.meta.url)
        ),
      },
    ],
  },
  plugins: [tailwindcss(), react()],
});
