/**
 * Tests billing dashboard helper functions and error parsing.
 */
import { describe, expect, it } from 'vitest';
import {
  getAutumnErrorMessage,
  getWalletTopUpPlan,
  parseAutumnErrorBody,
} from '@/components/billing/billing-dashboard.lib';

describe('billing-dashboard.lib', () => {
  it('extracts a message from a JSON Autumn error body', () => {
    expect(
      parseAutumnErrorBody(
        JSON.stringify({
          message: 'Autumn customer lookup failed.',
        })
      )
    ).toBe('Autumn customer lookup failed.');
  });

  it('translates wallet currency mismatch errors into a more actionable message', () => {
    expect(
      getAutumnErrorMessage(
        {
          body: JSON.stringify({
            message:
              "(Stripe Error) The price specified only supports `usd`. This doesn't match the expected currency: `gbp`.",
          }),
        },
        'fallback'
      )
    ).toContain('Wallet top-up is configured for USD');
  });

  it('prefers a named wallet top-up product before falling back to prepaid items', () => {
    const plan = getWalletTopUpPlan([
      {
        id: 'starter',
        name: 'Starter',
        description: 'Monthly plan',
        items: [],
      },
      {
        id: 'top_up',
        name: 'Wallet Top Up',
        description: 'One-off credits',
        items: [],
      },
    ] as any);

    expect(plan?.id).toBe('top_up');
  });
});
