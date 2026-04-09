/**
 * Logged-in dashboard home route.
 */
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { ROOT_ROUTE_PATH } from '../lib/route-paths';
import {
  contentWrapClass,
  pageContainerClass,
  panelClass,
  panelMutedClass,
} from '../lib/ui';

export const Route = createFileRoute(ROOT_ROUTE_PATH)({
  component: DashboardHomePage,
});

const homeHighlights = [
  {
    label: 'Status',
    value: 'Signed in',
    detail: 'Your dashboard shell is ready for app-specific modules.',
  },
  {
    label: 'Routing',
    value: 'Home is live',
    detail: 'This route now acts as the default landing page after auth.',
  },
  {
    label: 'Next step',
    value: 'Build features',
    detail:
      'Use this page as the place for high-level product summaries later.',
  },
] as const;

const starterSections = [
  {
    title: 'Overview container',
    description:
      'This area is intentionally lightweight so you have a clean place for KPIs, onboarding, or recent activity.',
  },
  {
    title: 'Team notes',
    description:
      'Add the most important signed-in information here once your product-specific data model is ready.',
  },
] as const;

/**
 * Displays a minimal authenticated landing page for the dashboard app.
 */
function DashboardHomePage() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Dashboard'
        title='Home'
        description='A simple signed-in landing page for overview content, quick stats, and future product modules.'
      />

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className='grid gap-3 md:grid-cols-3'>
          {homeHighlights.map(item => (
            <article key={item.label} className={`${panelMutedClass} p-4`}>
              <p className='text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]'>
                {item.label}
              </p>
              <h2 className='mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]'>
                {item.value}
              </h2>
              <p className='mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className='mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]'>
        {starterSections.map(section => (
          <article key={section.title} className={`${panelClass} p-5 sm:p-6`}>
            <h2 className='text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]'>
              {section.title}
            </h2>
            <p className='mt-3 text-sm leading-6 text-[var(--ink-soft)]'>
              {section.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
