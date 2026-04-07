/**
 * Hero section for the static marketing page.
 */
import { ArrowRight } from 'lucide-react';
import { logMarketingEvent } from '../../lib/marketing-logging';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const metrics = [
  { value: '3x', label: 'faster first launch' },
  { value: '1', label: 'visual system across app + site' },
  { value: '0', label: 'extra backend needed for the landing page' },
];

/**
 * Introduces the product and its launch-ready positioning.
 */
export default function MarketingHero() {
  return (
    <section className='marketing-hero marketing-container'>
      <div className='relative overflow-hidden rounded-[36px] border border-[color-mix(in_srgb,var(--primary)_18%,var(--line))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_92%,transparent),color-mix(in_srgb,var(--surface-soft)_86%,var(--surface)_14%))] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-10 lg:px-12 lg:py-14'>
        <div className='pointer-events-none absolute left-[62%] top-[-14%] h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--hero-a),transparent_72%)] blur-3xl' />
        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--primary)_28%,var(--line)),transparent)]' />

        <div className='relative space-y-8 lg:max-w-[46rem]'>
          <div className='space-y-5'>
            <Badge className='w-fit'>Launch-ready marketing system</Badge>
            <div className='space-y-4'>
              <p className='m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]'>
                Built for launch weeks, demo links, and early customer calls
              </p>
              <h1 className='m-0 max-w-[13ch] text-[clamp(3.3rem,7vw,6.2rem)] leading-[0.9] font-extrabold tracking-[-0.08em] text-[var(--ink)]'>
                Launch the site your dashboard deserves.
              </h1>
              <p className='max-w-[38rem] text-base leading-7 text-[var(--ink-soft)] sm:text-lg sm:leading-8 xl:text-xl'>
                A polished landing page that shares the dashboard&apos;s warm
                editorial tone, pairs cleanly with Firebase auth and billing,
                and gives founders something presentable on day one.
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button asChild size='lg'>
              <a
                href='#pricing'
                onClick={() =>
                  logMarketingEvent('ctaClick', {
                    placement: 'hero-primary',
                    destination: '#pricing',
                  })
                }
              >
                Explore the package
                <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </a>
            </Button>
            <Button asChild variant='secondary' size='lg'>
              <a
                href='#story'
                onClick={() =>
                  logMarketingEvent('ctaClick', {
                    placement: 'hero-secondary',
                    destination: '#story',
                  })
                }
              >
                See how it fits
              </a>
            </Button>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            {metrics.map(metric => (
              <div
                key={metric.label}
                className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[color-mix(in_srgb,var(--surface)_84%,transparent)] px-4 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-sm sm:px-5 sm:py-4'
              >
                <p className='m-0 text-3xl font-extrabold tracking-[-0.06em] text-[var(--ink)]'>
                  {metric.value}
                </p>
                <p className='mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
