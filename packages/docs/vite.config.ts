/**
 * Vite build and dev-server configuration for the docs app.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import mdx from 'fumadocs-mdx/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as docsConfig from './source.config';

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
  plugins: [
    mdx(docsConfig),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
