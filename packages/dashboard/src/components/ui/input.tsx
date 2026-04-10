/**
 * Input primitive.
 */
import * as React from 'react';
import { cn } from '../../lib/cn';

export function Input({
  className,
  type = 'text',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2 text-sm text-[var(--ink)] transition-[border-color,background-color,color] placeholder:text-[var(--ink-soft)] focus-visible:border-[var(--line-strong)] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
