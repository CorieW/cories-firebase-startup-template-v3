/**
 * Landing or home route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import {
  contentWrapClass,
  pageContainerClass,
  panelMutedClass,
} from '../lib/ui';

export const Route = createFileRoute('/')({ component: App });

/**
 * Renders a simple starter homepage placeholder.
 */
function App() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Home'
        title='Welcome to your starter app'
        description='This is a basic homepage you can replace with your product-specific content.'
      />
      <section className={`${panelMutedClass} mt-3 p-4`}>
        <p className='m-0 text-sm text-[var(--ink-soft)]'>
          Replace this page with your own hero, onboarding flow, or dashboard
          overview.
        </p>
      </section>
    </main>
  );
}
