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
        'flex h-11 w-full rounded-[12px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_76%,var(--surface)_24%)] px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] transition-[border-color,background-color,box-shadow] focus-visible:border-[color-mix(in_srgb,var(--primary)_24%,var(--line-strong))] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
