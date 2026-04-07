/**
 * Shared section heading used across the marketing page.
 */
import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  align?: 'left' | 'center' | 'right';
  support?: ReactNode;
}

/**
 * Renders a consistent heading block for landing page sections.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  support,
}: SectionHeadingProps) {
  const alignmentClass =
    align === 'center'
      ? 'items-center text-center'
      : align === 'right'
        ? 'ml-auto items-end text-right'
        : '';

  return (
    <div
      className={`flex w-full max-w-2xl flex-col gap-5 sm:gap-6 ${alignmentClass}`}
    >
      <div className='space-y-4'>
        {eyebrow ? (
          <Badge variant='muted' className='w-fit'>
            {eyebrow}
          </Badge>
        ) : null}
        <h2 className='m-0 text-[clamp(2rem,4vw,3.4rem)] leading-[1] font-bold tracking-[-0.05em] text-[var(--ink)]'>
          {title}
        </h2>
        <p className='m-0 text-base leading-7 text-[var(--ink-soft)] sm:text-lg sm:leading-8'>
          {description}
        </p>
      </div>
      {support ? <div className='w-full'>{support}</div> : null}
    </div>
  );
}
