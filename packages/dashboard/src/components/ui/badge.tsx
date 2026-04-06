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
        success: 'bg-[color-mix(in_srgb,#16a34a_18%,white)] text-[#166534]',
        warning: 'bg-[color-mix(in_srgb,#f59e0b_18%,white)] text-[#92400e]',
        danger: 'bg-[color-mix(in_srgb,#ef4444_18%,white)] text-[#991b1b]',
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
