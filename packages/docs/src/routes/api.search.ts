/**
 * Search API route for Fumadocs' built-in Orama search client.
 */
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { docsSearchHandler } = await import('../lib/source.server');

        return docsSearchHandler.GET(request);
      },
    },
  },
});
