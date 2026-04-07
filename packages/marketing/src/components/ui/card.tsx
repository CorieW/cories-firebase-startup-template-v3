/**
 * Card primitives used across the marketing page.
 */
import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Wraps content in the marketing page's elevated surface style.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    />
  );
}

/**
 * Provides consistent spacing for a card header.
 */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-3 p-6', className)} {...props} />
  );
}

/**
 * Renders a card title with shared tracking and emphasis.
 */
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'm-0 text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders supporting card text with the muted ink color.
 */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('m-0 text-sm leading-6 text-[var(--ink-soft)]', className)}
      {...props}
    />
  );
}

/**
 * Provides consistent padding for card body content.
 */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}
