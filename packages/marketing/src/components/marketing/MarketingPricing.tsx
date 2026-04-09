/**
 * Pricing teaser section for the marketing page.
 */
import { Check } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { getDashboardBillingUrl } from '../../lib/dashboard-links';
import { logMarketingEvent } from '../../lib/marketing-logging';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const pricingDestinations = [
  {
    name: 'Subscriptions',
    description:
      'Send people into the dashboard subscriptions screen, where plan selection is already wired to checkout.',
    features: [
      'Opens the live subscriptions billing page',
      'Uses the existing subscription checkout flow',
      'Resolves user or organization scope from the signed-in session',
    ],
    destination: 'subscriptions' as const,
    ctaLabel: 'Open subscriptions',
    highlighted: true,
  },
  {
    name: 'Wallet top-ups',
    description:
      'Hand off to the wallet page when you want the pricing story to lead into usage credits and balance purchases.',
    features: [
      'Opens the live wallet billing page',
      'Uses the existing wallet top-up checkout flow',
      'Keeps wallet and subscription billing inside one audited product surface',
    ],
    destination: 'wallet' as const,
    ctaLabel: 'Open wallet billing',
    highlighted: false,
  },
];

/**
 * Shows the pricing handoff options for billing.
 */
export default function MarketingPricing() {
  return (
    <section id='pricing' className='marketing-section'>
      <div className='marketing-container grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-14'>
        <SectionHeading
          eyebrow='Billing handoff'
          title='Marketing pricing now hands off to the live billing flow.'
          description='The public site stays static, while pricing calls-to-action route visitors into the dashboard billing screens that already manage checkout and wallet actions.'
          support={
            <div className='space-y-3 lg:max-w-xl'>
              <div className='rounded-[22px] border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)] px-6 py-5 text-sm leading-6 text-[var(--ink-soft)] shadow-[var(--shadow-card)]'>
                Visitors may be asked to sign in first, because the dashboard
                resolves billing against the active user or organization session
                before opening checkout.
              </div>
              <div className='flex flex-wrap gap-3'>
                <div className='rounded-full border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]'>
                  Static site
                </div>
                <div className='rounded-full border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]'>
                  Live billing handoff
                </div>
              </div>
            </div>
          }
        />
        <div className='grid gap-5 xl:grid-cols-2'>
          {pricingDestinations.map(plan => {
            const billingUrl = getDashboardBillingUrl(plan.destination);

            return (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'border-[color-mix(in_srgb,var(--primary)_32%,var(--line-strong))] bg-[var(--surface-emphasis)]'
                    : ''
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className='m-0 text-sm leading-6 text-[var(--ink-soft)]'>
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className='space-y-5'>
                  <div className='grid gap-4'>
                    {plan.features.map(feature => (
                      <div key={feature} className='flex items-start gap-3'>
                        <Check
                          className='mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]'
                          aria-hidden='true'
                        />
                        <p className='m-0 text-sm leading-6 text-[var(--ink-soft)]'>
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    variant={plan.highlighted ? 'default' : 'secondary'}
                    className='w-full'
                  >
                    <a
                      href={billingUrl}
                      onClick={() =>
                        logMarketingEvent('ctaClick', {
                          placement: 'pricing-card',
                          billingDestination: plan.destination,
                          href: billingUrl,
                        })
                      }
                    >
                      {plan.ctaLabel}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
