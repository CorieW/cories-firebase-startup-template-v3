/**
 * Card primitive.
 */
import * as React from 'react';
import { cn } from '../../lib/cn';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[18px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_98%,white_2%)_0%,var(--surface)_100%)] text-[var(--ink)] shadow-[0_1px_0_rgba(255,255,255,0.48),0_12px_28px_rgba(17,12,6,0.04)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 p-5', className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'm-0 text-base font-semibold tracking-[-0.01em] text-[var(--ink)]',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('m-0 text-sm text-[var(--ink-soft)]', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}
