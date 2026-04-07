/**
 * Badge primitive for small marketing labels.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em]',
  {
    variants: {
      variant: {
        default:
          'border-[color-mix(in_srgb,var(--primary)_28%,var(--line))] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[color-mix(in_srgb,var(--primary)_68%,var(--ink-soft))]',
        muted:
          'border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_82%,var(--surface)_18%)] text-[var(--ink-soft)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Displays compact labels used for section eyebrows and highlights.
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
