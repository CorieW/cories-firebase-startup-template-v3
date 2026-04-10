/**
 * Support articles card UI.
 */
import { BookOpen } from 'lucide-react';
import { panelClass } from '../../lib/ui';
import { SUPPORT_ARTICLES } from './support-content';

/**
 * Curated list of support resources for common tasks.
 */
export default function SupportArticlesCard() {
  return (
    <section id='popular-articles' className={`${panelClass} p-5`}>
      <h2 className='m-0 text-xl font-bold text-[var(--ink)]'>
        Popular articles
      </h2>
      <p className='mt-2 mb-0 text-sm leading-6 text-[var(--ink-soft)]'>
        Start with these guides for the most common support topics.
      </p>
      <div className='mt-3 grid gap-2'>
        {SUPPORT_ARTICLES.map(article => (
          <a
            key={article.title}
            href={article.href}
            target='_blank'
            rel='noreferrer'
            className='flex items-start gap-3 rounded-[12px] border border-transparent px-3 py-2 no-underline transition-[background-color,border-color] hover:border-[var(--line)] hover:bg-[var(--surface)]'
          >
            <BookOpen
              aria-hidden='true'
              className='mt-0.5 h-4 w-4 shrink-0 text-[var(--ink)]'
            />
            <span>
              <span className='block text-sm font-semibold text-[var(--ink)]'>
                {article.title}
              </span>
              <span className='block text-sm text-[var(--ink-soft)]'>
                {article.description}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
