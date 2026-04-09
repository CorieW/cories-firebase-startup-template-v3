/**
 * Root docs landing route backed by the docs content source.
 */
import { createFileRoute } from '@tanstack/react-router';
import DocsPageContent, {
  preloadDocsPageContent,
} from '../components/DocsPageContent';
import type { LoadedDocsPage } from '../lib/docs-types';
import { loadDocsPage } from '../lib/load-docs-page';

export const Route = createFileRoute('/')({
  component: IndexRouteComponent,
  loader: async () => {
    const page = (await loadDocsPage({ data: [] })) as LoadedDocsPage;
    await preloadDocsPageContent(page.path);
    return page;
  },
});

function IndexRouteComponent() {
  return <DocsPageContent loaderData={Route.useLoaderData()} />;
}
