/**
 * Shadcn-style button primitive for marketing actions.
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[999px] border text-sm font-semibold transition-[background-color,border-color,color] duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--primary)] text-[var(--primary-ink)] hover:bg-[color-mix(in_srgb,var(--primary)_92%,black_8%)]',
        secondary:
          'border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--line-strong))] hover:bg-[var(--surface-soft)]',
        ghost:
          'border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-6 text-sm',
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Renders a reusable action button that can wrap links or buttons.
 */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
