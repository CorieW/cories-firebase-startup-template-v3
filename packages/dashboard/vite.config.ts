/**
 * Vite build and dev-server configuration.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';

const config = defineConfig({
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
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
