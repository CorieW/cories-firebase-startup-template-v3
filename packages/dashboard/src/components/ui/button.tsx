/**
 * Button primitive.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[12px] border text-sm font-semibold transition-[background-color,border-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--primary)] text-[var(--primary-ink)] hover:bg-[color-mix(in_srgb,var(--primary)_92%,black_8%)]',
        secondary:
          'border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--line-strong))] hover:bg-[color-mix(in_srgb,var(--primary)_5%,var(--surface-soft))]',
        ghost:
          'border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[10px] px-3 text-xs',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
