/**
 * Class name merge helper.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Composes and merges Tailwind-compatible class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
