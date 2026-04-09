/**
 * Fumadocs MDX collection configuration for the docs app.
 */
import { z } from 'zod';
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    files: ['**/*.mdx'],
    schema: frontmatterSchema.extend({
      title: z.string(),
      description: z.string().optional(),
      summary: z.string().optional(),
      icon: z.string().optional(),
    }),
  },
  meta: {
    files: ['**/meta.json'],
  },
});

export default defineConfig();
