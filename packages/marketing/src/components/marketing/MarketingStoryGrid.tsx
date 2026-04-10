/**
 * Story section that explains how marketing and dashboard packages fit together.
 */
import { ArrowUpRight, Check, PenTool, Rocket, Workflow } from 'lucide-react';
import SectionHeading from './SectionHeading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const steps = [
  {
    title: 'Tell the product story',
    description:
      'Lead with positioning, social proof, and the problem your template solves for early-stage teams.',
    Icon: PenTool,
  },
  {
    title: 'Capture intent cleanly',
    description:
      'Direct visitors toward pricing, email capture, or sign-up handoff without exposing app complexity too early.',
    Icon: Workflow,
  },
  {
    title: 'Transition into the product',
    description:
      'Move people from public site to dashboard with the same visual cues, spacing system, and confidence.',
    Icon: Rocket,
  },
];

const callouts = [
  'Keeps the public surface area intentionally simple',
  'Lets the dashboard stay focused on logged-in workflows',
  'Creates a clearer path from first click to activation',
];

/**
 * Explains the package boundary and the launch flow it supports.
 */
export default function MarketingStoryGrid() {
  return (
    <section id='story' className='marketing-section'>
      <div className='marketing-container grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-14'>
        <SectionHeading
          eyebrow='Package boundary'
          title='Separate package, shared brand system, smoother launch path.'
          description='The dashboard remains your product surface. The marketing package handles the public narrative with a stronger first impression and a cleaner handoff.'
          support={
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
              <div className='rounded-[20px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-card)]'>
                <p className='m-0 text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase'>
                  Public narrative
                </p>
                <p className='m-0 mt-2 text-sm leading-6 text-[var(--ink)]'>
                  Marketing pages stay focused on trust, positioning, and
                  conversion.
                </p>
              </div>
              <div className='rounded-[20px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_76%,var(--surface)_24%)] px-5 py-4 shadow-[var(--shadow-card)]'>
                <p className='m-0 text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase'>
                  Product surface
                </p>
                <p className='m-0 mt-2 text-sm leading-6 text-[var(--ink)]'>
                  The dashboard stays dedicated to signed-in workflows and
                  billing actions.
                </p>
              </div>
            </div>
          }
        />
        <div className='grid gap-5'>
          <Card>
            <CardHeader>
              <CardTitle>Launch sequence</CardTitle>
              <CardDescription>
                The landing page keeps the sales story crisp while the dashboard
                stays optimized for authenticated work.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-5'>
              {steps.map(({ title, description, Icon }, index) => (
                <div
                  key={title}
                  className='flex gap-4 rounded-[22px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_74%,var(--surface)_26%)] p-5'
                >
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--surface)]'>
                    <Icon
                      className='h-5 w-5 text-[var(--primary)]'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='m-0 text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase'>
                      Step {index + 1}
                    </p>
                    <h3 className='m-0 mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]'>
                      {title}
                    </h3>
                    <p className='m-0 mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className='grid gap-5 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Why separate it?</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3'>
                {callouts.map(item => (
                  <div key={item} className='flex items-start gap-3'>
                    <Check
                      className='mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]'
                      aria-hidden='true'
                    />
                    <p className='m-0 text-sm leading-6 text-[var(--ink-soft)]'>
                      {item}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className='border-[color-mix(in_srgb,var(--primary)_28%,var(--line))] bg-[var(--surface-emphasis)]'>
              <CardHeader>
                <CardTitle>Template-level benefit</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='m-0 text-sm leading-6 text-[var(--ink-soft)]'>
                  Future projects can swap the copy and visuals without having
                  to untangle dashboard logic, auth providers, or route guards.
                </p>
                <div className='inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)]'>
                  Reusable public-site foundation
                  <ArrowUpRight
                    className='h-4 w-4 text-[var(--primary)]'
                    aria-hidden='true'
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
