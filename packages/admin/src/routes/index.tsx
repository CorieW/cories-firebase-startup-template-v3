/**
 * Admin app home route placeholder.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  badgeClass,
  cardClass,
  pageContainerClass,
  subtleCardClass,
} from '../lib/ui';

export const Route = createFileRoute('/')({
  component: AdminHomePage,
});

/**
 * Renders a lightweight starter screen for the admin console.
 */
function AdminHomePage() {
  return (
    <main className={`${pageContainerClass} py-10`}>
      <section className={`${cardClass} overflow-hidden p-8 sm:p-10`}>
        <div className='flex flex-col gap-4'>
          <span className={`${badgeClass} w-fit`}>Admin</span>
          <div className='max-w-3xl space-y-3'>
            <h1 className='m-0 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl'>
              Admin console scaffold is ready.
            </h1>
            <p className='m-0 text-base leading-7 text-[var(--admin-ink-soft)]'>
              The router is now bootstrapped for the admin package. Replace this
              placeholder with your staff dashboard, audit views, and support
              tools as you build them out.
            </p>
          </div>
        </div>

        <div
          className={`${subtleCardClass} mt-8 grid gap-4 p-5 text-sm text-[var(--admin-ink-soft)] sm:grid-cols-3`}
        >
          <section>
            <h2 className='m-0 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink)]'>
              Users
            </h2>
            <p className='mt-2 mb-0'>Directory and profile review routes.</p>
          </section>
          <section>
            <h2 className='m-0 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink)]'>
              Organizations
            </h2>
            <p className='mt-2 mb-0'>Org lookup, status, and ownership checks.</p>
          </section>
          <section>
            <h2 className='m-0 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink)]'>
              Billing & Audit
            </h2>
            <p className='mt-2 mb-0'>
              Read-only billing diagnostics and audit timelines.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
