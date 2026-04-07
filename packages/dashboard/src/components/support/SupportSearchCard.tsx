/**
 * Support search card component.
 */
import { Search } from 'lucide-react';
import { useState } from 'react';
import { panelClass } from '../../lib/ui';
import { useToast } from '../toast/ToastProvider';
import { SUPPORT_ARTICLES, SUPPORT_OPTIONS } from './support-content';

function includesSearchQuery(searchQuery: string, values: string[]): boolean {
  return values.some(value => value.toLowerCase().includes(searchQuery));
}

/**
 * Search input used as the first entry point on the support page.
 */
export default function SupportSearchCard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  function handleSearch() {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      toast.warning({
        title: 'Add a search term',
        description: 'Enter a topic like billing, account, or setup first.',
      });
      return;
    }

    try {
      const normalizedQuery = trimmedQuery.toLowerCase();
      const articleMatches = SUPPORT_ARTICLES.filter(article =>
        includesSearchQuery(normalizedQuery, [
          article.title,
          article.description,
          article.href,
        ])
      );
      const optionMatches = SUPPORT_OPTIONS.filter(option =>
        includesSearchQuery(normalizedQuery, [
          option.title,
          option.description,
          option.cta,
        ])
      );
      const totalMatches = articleMatches.length + optionMatches.length;

      if (totalMatches > 0) {
        toast.success({
          title: `${totalMatches} support ${totalMatches === 1 ? 'match' : 'matches'} found`,
          description: 'Scroll to popular articles or support channels below.',
        });

        const articlesSection = document.getElementById('popular-articles');
        if (
          articlesSection &&
          typeof articlesSection.scrollIntoView === 'function'
        ) {
          articlesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
        return;
      }

      toast.info({
        title: 'No direct match found',
        description:
          'Try broader keywords, then use live chat if you still need help.',
      });
    } catch {
      toast.error({
        title: 'Search is temporarily unavailable',
        description: 'Please try again in a moment.',
      });
    }
  }

  return (
    <section className={`${panelClass} p-4`}>
      <form
        className='flex flex-col gap-2 sm:flex-row'
        onSubmit={event => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <div className='relative flex-1'>
          <Search
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]'
            aria-hidden='true'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={event => {
              setSearchQuery(event.target.value);
            }}
            placeholder='Search docs, FAQ, and troubleshooting guides'
            className='h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none transition-[border-color,background-color,color] focus:border-[var(--line-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)]'
            aria-label='Search support resources'
          />
        </div>
        <button
          type='submit'
          className='inline-flex h-11 items-center justify-center rounded-[12px] border border-transparent bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]'
        >
          Search
        </button>
      </form>
    </section>
  );
}
