/**
 * Tests admin user billing summary helpers.
 */
import type { Balance, ListCustomersList } from 'autumn-js';
import { describe, expect, it } from 'vitest';
import { summarizeAdminUserBilling } from '@/lib/server/user-data';

function createBalance(input: {
  feature?: Balance['feature'];
  featureId: string;
  granted: number;
  nextResetAt: number | null;
  remaining: number;
  usage: number;
}): Balance {
  return {
    feature: input.feature,
    featureId: input.featureId,
    granted: input.granted,
    maxPurchase: null,
    nextResetAt: input.nextResetAt,
    overageAllowed: false,
    remaining: input.remaining,
    unlimited: false,
    usage: input.usage,
  } as Balance;
}

function createCustomer(input: {
  balances: ListCustomersList['balances'];
  id: string;
}): ListCustomersList {
  return {
    balances: input.balances,
    id: input.id,
  } as ListCustomersList;
}

describe('admin user billing summary', () => {
  it('returns a ready wallet summary for the personal Autumn customer', () => {
    const summary = summarizeAdminUserBilling({
      customerId: 'user-user_123',
      customers: [
        createCustomer({
          balances: {
            usd_credits: createBalance({
              feature: {
                name: 'USD credits',
              } as Balance['feature'],
              featureId: 'usd_credits',
              granted: 120,
              nextResetAt: 1_710_000_000_000,
              remaining: 95.5,
              usage: 24.5,
            }),
          },
          id: 'user-user_123',
        }),
      ],
    });

    expect(summary).toEqual({
      customerId: 'user-user_123',
      status: 'ready',
      walletBalance: {
        featureId: 'usd_credits',
        featureName: 'USD credits',
        granted: 120,
        nextResetAt: '2024-03-09T16:00:00.000Z',
        remaining: 95.5,
        usage: 24.5,
      },
    });
  });

  it('falls back to a feature id match when the wallet is not keyed directly', () => {
    const summary = summarizeAdminUserBilling({
      customerId: 'user-user_456',
      customers: [
        createCustomer({
          balances: {
            prepaid_wallet: createBalance({
              featureId: 'usd_credits',
              granted: 75,
              nextResetAt: null,
              remaining: 40,
              usage: 35,
            }),
          },
          id: 'user-user_456',
        }),
      ],
    });

    expect(summary.status).toBe('ready');
    expect(summary.walletBalance?.remaining).toBe(40);
  });

  it('returns sparse states when the customer or wallet balance is missing', () => {
    expect(
      summarizeAdminUserBilling({
        customerId: 'user-missing',
        customers: [],
      }),
    ).toEqual({
      customerId: 'user-missing',
      status: 'missing-customer',
      walletBalance: null,
    });

    expect(
      summarizeAdminUserBilling({
        customerId: 'user-no-wallet',
        customers: [
          createCustomer({
            balances: {},
            id: 'user-no-wallet',
          }),
        ],
      }),
    ).toEqual({
      customerId: 'user-no-wallet',
      status: 'missing-wallet',
      walletBalance: null,
    });
  });
});
