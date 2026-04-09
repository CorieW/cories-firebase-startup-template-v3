/**
 * Support docs route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import SupportArticlesCard from '../components/support/SupportArticlesCard';
import SupportOptionsGrid from '../components/support/SupportOptionsGrid';
import SupportSearchCard from '../components/support/SupportSearchCard';
import { SUPPORT_ROUTE_PATHS } from '../lib/route-paths';
import { contentWrapClass, pageContainerClass } from '../lib/ui';

export const Route = createFileRoute(SUPPORT_ROUTE_PATHS.docs)({
  component: SupportDocsPage,
});

/**
 * Displays self-serve documentation and support resources.
 */
function SupportDocsPage() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Support'
        title='Support docs'
        description='Browse setup guides, troubleshooting notes, and common help articles at your own pace.'
      />
      <div className='grid gap-3'>
        <SupportSearchCard optionIds={['documentation', 'faq']} />
        <SupportOptionsGrid optionIds={['documentation', 'faq']} />
        <SupportArticlesCard />
      </div>
    </main>
  );
}
