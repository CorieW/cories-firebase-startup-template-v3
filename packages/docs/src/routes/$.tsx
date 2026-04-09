/**
 * Catch-all docs content route for nested MDX pages.
 */
import { createFileRoute } from '@tanstack/react-router';
import DocsPageContent, {
  preloadDocsPageContent,
} from '../components/DocsPageContent';
import { parseDocSlugs } from '../lib/docs-paths';
import type { LoadedDocsPage } from '../lib/docs-types';
import { loadDocsPage } from '../lib/load-docs-page';

export const Route = createFileRoute('/$')({
  component: SplatRouteComponent,
  loader: async ({ params }) => {
    const page = (await loadDocsPage({
      data: parseDocSlugs(params._splat),
    })) as LoadedDocsPage;
    await preloadDocsPageContent(page.path);
    return page;
  },
});

function SplatRouteComponent() {
  return <DocsPageContent loaderData={Route.useLoaderData()} />;
}
