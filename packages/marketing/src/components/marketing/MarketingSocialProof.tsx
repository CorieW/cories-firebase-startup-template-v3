/**
 * Social proof and positioning section for the marketing page.
 */
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
    <section className='marketing-section-tight grid gap-10 border-y border-[color-mix(in_srgb,var(--line)_60%,transparent)] lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center lg:gap-12'>
      <div className='space-y-8 lg:order-1'>
        <div className='flex flex-wrap gap-4 lg:justify-start'>
          {partnerLabels.map(label => (
            <div
              key={label}
              className='rounded-full border border-[color-mix(in_srgb,var(--line)_66%,transparent)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)]'
            >
              {label}
            </div>
          ))}
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          {proofItems.map(item => (
            <div
              key={item}
              className='rounded-[22px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)] px-5 py-4 text-sm leading-6 text-[var(--ink-soft)]'
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className='space-y-6 lg:order-2 lg:max-w-md'>
        <h2 className='m-0 max-w-[14ch] text-[clamp(2rem,4vw,3rem)] leading-[1.02] font-bold tracking-[-0.05em] text-[var(--ink)]'>
          The public story now feels as considered as the product.
        </h2>
        <p className='m-0 text-sm leading-7 text-[var(--ink-soft)] sm:text-base'>
          The stack already solves auth, billing, and app structure. The
          marketing package makes that maturity visible before anyone clicks
          into the dashboard.
        </p>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
          {headerHighlights.map(item => (
            <div
              key={item}
              className='rounded-[20px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[var(--surface)] px-5 py-4 text-sm leading-6 text-[var(--ink-soft)]'
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
