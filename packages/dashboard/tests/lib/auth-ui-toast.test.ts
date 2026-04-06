/**
 * Tests Better Auth toast normalization and dashboard toast mapping.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  mapBetterAuthToastVariant,
  normalizeBetterAuthToastMessage,
  showBetterAuthToast,
} from '@/lib/auth-ui-toast';

describe('normalizeBetterAuthToastMessage', () => {
  it('extracts nested messages from JSON-shaped error strings', () => {
    expect(
      normalizeBetterAuthToastMessage(
        '{"message":"customer_id: cannot contain \\":\\". Use only letters, numbers, underscores, and hyphens."}'
      )
    ).toBe(
      'customer_id: cannot contain ":". Use only letters, numbers, underscores, and hyphens.'
    );
  });

  it('returns null for empty messages', () => {
    expect(normalizeBetterAuthToastMessage('   ')).toBeNull();
    expect(normalizeBetterAuthToastMessage()).toBeNull();
  });
});

describe('mapBetterAuthToastVariant', () => {
  it('maps default-like variants to the dashboard info toast', () => {
    expect(mapBetterAuthToastVariant()).toBe('info');
    expect(mapBetterAuthToastVariant('default')).toBe('info');
    expect(mapBetterAuthToastVariant('info')).toBe('info');
  });
});

describe('showBetterAuthToast', () => {
  it('renders errors through the shared toast provider', () => {
    const showToast = vi.fn(() => 'toast-id');

    showBetterAuthToast(
      {
        message: 'Unable to finish sign up.',
        variant: 'error',
      },
      showToast
    );

    expect(showToast).toHaveBeenCalledWith('error', {
      title: 'Action failed',
      description: 'Unable to finish sign up.',
      durationMs: 7200,
    });
  });

  it('skips blank toast messages', () => {
    const showToast = vi.fn(() => 'toast-id');

    showBetterAuthToast(
      {
        message: '   ',
        variant: 'warning',
      },
      showToast
    );

    expect(showToast).not.toHaveBeenCalled();
  });
});
