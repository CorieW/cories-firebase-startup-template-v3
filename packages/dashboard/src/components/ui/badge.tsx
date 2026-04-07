/**
 * Badge primitive.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-[var(--surface-soft)] text-[var(--ink)]',
        success: 'bg-[var(--success-surface)] text-[var(--success)]',
        warning: 'bg-[var(--warning-surface)] text-[var(--warning)]',
        danger: 'bg-[var(--danger-surface)] text-[var(--danger)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
