/**
 * Shared Better Auth UI toast normalization and bridge helpers.
 */
import type { ToastPayload, ToastVariant } from './SharedToastProvider.js';

export type BetterAuthToastVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

export interface BetterAuthToastInput {
  message?: string;
  variant?: BetterAuthToastVariant;
}

type ShowToast = (variant: ToastVariant, payload: ToastPayload) => string;

const BETTER_AUTH_TOAST_TITLES: Record<ToastVariant, string> = {
  error: 'Action failed',
  info: 'Notice',
  success: 'Success',
  warning: 'Warning',
};

function extractToastMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    if (
      (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
      (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))
    ) {
      try {
        return extractToastMessage(JSON.parse(trimmedValue)) ?? trimmedValue;
      } catch {
        return trimmedValue;
      }
    }

    return trimmedValue;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidateRecord = value as Record<string, unknown>;

  return (
    extractToastMessage(candidateRecord.message) ??
    extractToastMessage(candidateRecord.error) ??
    extractToastMessage(candidateRecord.body) ??
    null
  );
}

export function normalizeBetterAuthToastMessage(
  message?: string
): string | null {
  return extractToastMessage(message);
}

export function mapBetterAuthToastVariant(
  variant?: BetterAuthToastVariant
): ToastVariant {
  if (variant === 'success' || variant === 'error' || variant === 'warning') {
    return variant;
  }

  return 'info';
}

/**
 * Renders Better Auth UI toast events through the shared toast provider.
 */
export function showBetterAuthToast(
  input: BetterAuthToastInput,
  showToast: ShowToast
): void {
  const description = normalizeBetterAuthToastMessage(input.message);

  if (!description) {
    return;
  }

  const variant = mapBetterAuthToastVariant(input.variant);

  showToast(variant, {
    title: BETTER_AUTH_TOAST_TITLES[variant],
    description,
    durationMs: variant === 'error' ? 7200 : undefined,
  });
}
