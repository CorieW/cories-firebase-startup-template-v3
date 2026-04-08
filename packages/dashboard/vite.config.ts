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
        find: '@cories-firebase-startup-template-v3/common/auth',
        replacement: fileURLToPath(
          new URL('../common/src/auth.ts', import.meta.url)
        ),
      },
      {
        find: '@cories-firebase-startup-template-v3/common/logging',
        replacement: fileURLToPath(
          new URL('../common/src/logging.ts', import.meta.url)
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
  ssr: {
    noExternal: [
      '@cories-firebase-startup-template-v3/common',
      '@cories-firebase-startup-template-v3/common/auth',
      '@cories-firebase-startup-template-v3/common/logging',
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
