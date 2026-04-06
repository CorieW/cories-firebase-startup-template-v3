/**
 * Skeleton or loading primitive.
 */
import * as React from 'react';
import { cn } from '../../lib/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]',
        className
      )}
      {...props}
    />
  );
}
