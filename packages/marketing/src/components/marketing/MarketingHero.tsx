/**
 * Hero section for the static marketing page.
 */
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { logMarketingEvent } from '../../lib/marketing-logging';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const highlights = [
  'Warm, premium UI out of the box',
  'Firebase + Better Auth + Autumn already wired',
  'Static marketing site beside the product dashboard',
];

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
    <section className='grid gap-10 pb-18 pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-center lg:gap-16 lg:pb-22 lg:pt-20'>
      <div className='space-y-10'>
        <div className='space-y-5'>
          <h1 className='m-0 max-w-[12ch] text-[clamp(3.4rem,9vw,6.6rem)] leading-[0.92] font-extrabold tracking-[-0.08em] text-[var(--ink)]'>
            Launch the site your dashboard deserves.
          </h1>
          <p className='max-w-2xl text-lg leading-8 text-[var(--ink-soft)] sm:text-xl'>
            A polished landing page that shares the dashboard&apos;s warm
            editorial tone, pairs cleanly with Firebase auth and billing, and
            gives founders something presentable on day one.
          </p>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row'>
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

        <div className='grid gap-4 sm:grid-cols-3'>
          {metrics.map(metric => (
            <div
              key={metric.label}
              className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] px-5 py-4'
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

      <div className='relative'>
        <Card className='relative overflow-hidden border-[color-mix(in_srgb,var(--primary)_24%,var(--line))] bg-[var(--surface-soft)]'>
          <CardHeader className='pb-3 pt-10'>
            <Sparkles
              className='h-5 w-5 text-[var(--primary)]'
              aria-hidden='true'
            />
            <CardTitle className='max-w-[14ch] text-3xl sm:text-4xl'>
              One brand system from homepage to app shell.
            </CardTitle>
          <CardDescription className='max-w-xl text-base'>
              The marketing package extends the dashboard&apos;s palette and
              surfaces into a landing page with more motion, more hierarchy, and
              stronger storytelling.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-5 lg:grid-cols-[1.1fr_0.9fr]'>
            <div className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[var(--surface)] p-5'>
              <div className='grid gap-4'>
                {highlights.map(item => (
                  <div
                    key={item}
                    className='flex items-start gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_76%,var(--surface)_24%)] p-4'
                  >
                    <CheckCircle2
                      className='mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]'
                      aria-hidden='true'
                    />
                    <p className='m-0 text-sm leading-6 text-[var(--ink)]'>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className='grid gap-4'>
              <div className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[var(--surface)] p-5'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-[16px] bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface-soft))] p-3'>
                    <LayoutDashboard
                      className='h-5 w-5 text-[var(--primary)]'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                      Matches the dashboard
                    </p>
                    <p className='m-0 mt-1 text-sm leading-6 text-[var(--ink-soft)]'>
                      Shared tone, spacing, radii, and dark mode behavior.
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[var(--surface-emphasis)] p-5'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-[16px] bg-[var(--surface)] p-3'>
                    <ShieldCheck
                      className='h-5 w-5 text-[var(--info)]'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                      Static, fast, dependable
                    </p>
                    <p className='m-0 mt-1 text-sm leading-6 text-[var(--ink-soft)]'>
                      Zero extra backend surface area for your public site.
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-[24px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[var(--surface)] p-5'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-[16px] bg-[color-mix(in_srgb,var(--surface-soft)_82%,var(--surface)_18%)] p-3'>
                    <Zap
                      className='h-5 w-5 text-[var(--primary)]'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                      Launch-ready sections
                    </p>
                    <p className='m-0 mt-1 text-sm leading-6 text-[var(--ink-soft)]'>
                      Hero, proof, features, pricing, and a stronger final CTA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
