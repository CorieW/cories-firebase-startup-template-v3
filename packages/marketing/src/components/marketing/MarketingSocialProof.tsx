/**
 * Social proof and positioning section for the marketing page.
 */
import { Badge } from '../ui/badge';

const proofItems = [
  'Firebase auth flows ready to extend',
  'Billing-aware dashboard already designed',
  'Warm premium theme across light and dark modes',
  'Template structure that keeps app and site separate',
];

const partnerLabels = [
  'Firebase',
  'Better Auth',
  'Autumn',
  'TanStack',
  'Tailwind',
];

const headerHighlights = [
  'One shared tone from landing page to dashboard shell',
  'A stronger first impression before sign-in or demo walkthroughs',
];

/**
 * Highlights the stack credibility and immediate launch benefits.
 */
export default function MarketingSocialProof() {
  return (
    <section className='marketing-section-tight border-y border-[color-mix(in_srgb,var(--line)_60%,transparent)]'>
      <div className='marketing-container grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-14'>
        <div className='space-y-6 lg:max-w-lg'>
          <Badge variant='muted' className='w-fit'>
            Why it lands better
          </Badge>
          <div className='space-y-4'>
            <h2 className='m-0 max-w-[14ch] text-[clamp(2rem,4vw,3rem)] leading-[1.02] font-bold tracking-[-0.05em] text-[var(--ink)]'>
              The public story now feels as considered as the product.
            </h2>
            <p className='m-0 text-sm leading-7 text-[var(--ink-soft)] sm:text-base'>
              The stack already solves auth, billing, and app structure. The
              marketing package makes that maturity visible before anyone clicks
              into the dashboard.
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
            {headerHighlights.map(item => (
              <div
                key={item}
                className='rounded-[22px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-sm'
              >
                <p className='m-0 text-sm leading-6 text-[var(--ink)]'>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='space-y-6'>
          <div className='flex flex-wrap gap-3'>
            {partnerLabels.map(label => (
              <div
                key={label}
                className='rounded-full border border-[color-mix(in_srgb,var(--line)_66%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] shadow-[var(--shadow-card)]'
              >
                {label}
              </div>
            ))}
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            {proofItems.map((item, index) => (
              <div
                key={item}
                className={`rounded-[24px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] px-5 py-5 text-sm leading-6 shadow-[var(--shadow-card)] ${
                  index === 0
                    ? 'bg-[var(--surface)] md:col-span-2'
                    : 'bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)]'
                } text-[var(--ink-soft)]`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
