/**
 * Feature grid that sells the new marketing package.
 */
import {
  CreditCard,
  Gauge,
  Layers3,
  MessageSquareText,
  MoonStar,
  ShieldCheck,
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const features = [
  {
    title: 'Shared visual language',
    description:
      'Warm surfaces, gold accents, solid color blocking, and rounded geometry that already match the dashboard.',
    Icon: Layers3,
  },
  {
    title: 'Static by design',
    description:
      'A simple Vite package keeps the public site fast, stable, and easy to deploy independently.',
    Icon: Gauge,
  },
  {
    title: 'Shadcn-style primitives',
    description:
      'Buttons, badges, and cards keep the page expressive without piling on custom boilerplate.',
    Icon: MessageSquareText,
  },
  {
    title: 'Dark mode included',
    description:
      'The same light, dark, and system theme behavior carries through from the dashboard experience.',
    Icon: MoonStar,
  },
  {
    title: 'Billing-aware storytelling',
    description:
      'Pricing and monetization sections echo the dashboard billing work so the story feels connected.',
    Icon: CreditCard,
  },
  {
    title: 'Trust-first presentation',
    description:
      'Clean hierarchy, polished surfaces, and security-forward messaging help early products feel ready.',
    Icon: ShieldCheck,
  },
];

const featureCardClasses = [
  'xl:col-span-2',
  'xl:col-span-2',
  'xl:col-span-2',
  'xl:col-span-3',
  'xl:col-span-3',
  'xl:col-span-6',
];

/**
 * Shows the landing page's key benefits in a card grid.
 */
export default function MarketingFeatureGrid() {
  return (
    <section id='features' className='marketing-section'>
      <div className='marketing-container space-y-10'>
        <SectionHeading
          eyebrow='Feature set'
          title='A marketing page that amplifies the template instead of distracting from it.'
          description='Every section is tuned to make the starter feel more premium while staying consistent with the authenticated dashboard experience.'
        />
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-6'>
          {features.map(({ title, description, Icon }, index) => (
            <Card
              key={title}
              className={`h-full ${
                index === features.length - 1
                  ? 'border-[color-mix(in_srgb,var(--primary)_24%,var(--line-strong))] bg-[color-mix(in_srgb,var(--surface-emphasis)_82%,var(--surface)_18%)]'
                  : ''
              } ${featureCardClasses[index]}`}
            >
              <CardHeader className='gap-4'>
                <p className='m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]'>
                  0{index + 1}
                </p>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface-soft))]'>
                  <Icon
                    className='h-5 w-5 text-[var(--primary)]'
                    aria-hidden='true'
                  />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
