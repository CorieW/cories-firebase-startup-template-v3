/**
 * Testimonials section for credibility and tone.
 */
import { Quote } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const testimonials = [
  {
    quote:
      'This finally makes the template feel launchable instead of just technically complete.',
    author: 'Solo founder',
    role: 'Shipping a B2B SaaS MVP',
  },
  {
    quote:
      'The public site and the dashboard now feel like the same product, which matters a lot in early demos.',
    author: 'Product consultant',
    role: 'Helping teams go from concept to first customers',
  },
];

/**
 * Renders qualitative proof in a polished testimonial layout.
 */
export default function MarketingTestimonials() {
  return (
    <section className='marketing-section'>
      <div className='marketing-container space-y-10'>
        <SectionHeading
          eyebrow='Credibility'
          title='Made to help the starter feel credible in demos, screenshots, and early outreach.'
          description='The design keeps the warm premium aesthetic from the dashboard, then pushes it further with more narrative pacing and presentation.'
        />
        <div className='grid gap-5 lg:grid-cols-2'>
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.author}
              className={
                index === 1
                  ? 'border-[color-mix(in_srgb,var(--primary)_24%,var(--line-strong))] bg-[color-mix(in_srgb,var(--surface-emphasis)_82%,var(--surface)_18%)]'
                  : ''
              }
            >
              <CardHeader className='gap-4'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface-soft))]'>
                  <Quote
                    className='h-5 w-5 text-[var(--primary)]'
                    aria-hidden='true'
                  />
                </div>
                <CardTitle className='text-2xl leading-[1.2]'>
                  “{testimonial.quote}”
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                  {testimonial.author}
                </p>
                <p className='m-0 mt-1 text-sm text-[var(--ink-soft)]'>
                  {testimonial.role}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
