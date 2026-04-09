// @vitest-environment jsdom

/**
 * Tests wallet view behavior for the billing dashboard.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  attachMock,
  cleanupBillingDashboard,
  createBillingDashboardElement,
  customerState,
  eventsState,
  plansState,
  renderBillingDashboard,
  resetBillingDashboardTestState,
  scopedLoggerMock,
} from './billing-dashboard.test-helpers';

describe('BillingDashboard wallet', () => {
  beforeEach(() => {
    resetBillingDashboardTestState();
  });

  afterEach(() => {
    cleanupBillingDashboard();
  });

  it('renders wallet balance details and recent wallet transactions', () => {
    customerState.data = {
      id: 'user:123',
      invoices: [],
      entities: [{ id: 'member:1' }],
      subscriptions: [
        {
          plan: {
            id: 'growth',
            name: 'Growth',
          },
        },
      ],
      purchases: [
        {
          planId: 'top_up',
          startedAt: 1_700_000_000_000,
          expiresAt: null,
          quantity: 1,
          plan: {
            id: 'top_up',
            name: 'Top Up',
            description: 'Adds more usd credits',
            group: null,
            version: 1,
            addOn: true,
            autoEnable: false,
            price: null,
            items: [
              {
                featureId: 'usd_credits',
                included: 100,
                unlimited: false,
                reset: null,
                price: null,
              },
            ],
            createdAt: 1_700_000_000_000,
            env: 'sandbox',
            archived: false,
            baseVariantId: null,
          },
        },
      ],
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
          granted: 120,
          remaining: 80,
          usage: 40,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: 500,
          nextResetAt: 1_700_100_000_000,
          feature: {
            id: 'usd_credits',
            name: 'USD credits',
            type: 'credit_system',
            consumable: true,
            archived: false,
            creditSchema: [
              {
                meteredFeatureId: 'assistant-message',
                creditCost: 2,
              },
            ],
            display: {
              singular: 'usd credit',
              plural: 'usd credits',
            },
          },
        },
        'assistant-message': {
          featureId: 'assistant-message',
          granted: 0,
          remaining: 0,
          usage: 3,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: null,
          nextResetAt: null,
          feature: {
            id: 'assistant-message',
            name: 'Assistant message',
            type: 'metered',
            consumable: true,
            archived: false,
          },
        },
      },
    };
    eventsState.list = [
      {
        id: 'evt_123',
        timestamp: 1_700_050_000_000,
        featureId: 'assistant-message',
        customerId: 'user:123',
        value: 3,
        properties: {
          walletCreditCostSnapshot: '2',
          walletDebitAmountSnapshot: '6',
        },
      },
    ];

    render(createBillingDashboardElement('user', 'wallet'));

    expect(screen.getByText('Remaining balance')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Add funds' })).not.toBeNull();
    expect(screen.getByText('$80.00')).not.toBeNull();
    expect(screen.getByText('Usage history')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Choose plan' })).toBeNull();
    expect(screen.getByText('Top Up')).not.toBeNull();
    expect(screen.getByText('+$100.00')).not.toBeNull();
    expect(screen.getByText('Assistant message')).not.toBeNull();
    expect(screen.getByText('-$6.00')).not.toBeNull();
  });

  it('places add funds below the wallet summary cards', () => {
    render(createBillingDashboardElement('user', 'wallet'));

    const remainingBalanceHeading = screen.getByText('Remaining balance');
    const totalAddedHeading = screen.getByText('Total added');
    const totalUsedHeading = screen.getByText('Total used');
    const addFundsHeading = screen.getAllByText('Add funds')[0];

    expect(
      remainingBalanceHeading.compareDocumentPosition(addFundsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      totalAddedHeading.compareDocumentPosition(addFundsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      totalUsedHeading.compareDocumentPosition(addFundsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('renders dashboard skeleton placeholders while billing details are loading', () => {
    customerState.isPending = true;

    render(createBillingDashboardElement('user', 'wallet'));

    expect(
      screen.getByRole('status', { name: 'Loading billing details' })
    ).not.toBeNull();
    expect(screen.getByText('Wallet balance and activity')).not.toBeNull();
    expect(screen.queryByText('Remaining balance')).toBeNull();
  });

  it('renders wallet activity skeleton rows while events are loading', () => {
    customerState.data = {
      id: 'user:123',
      invoices: [],
      entities: [{ id: 'member:1' }],
      subscriptions: [],
      purchases: [],
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
          granted: 120,
          remaining: 80,
          usage: 40,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: 500,
          nextResetAt: 1_700_100_000_000,
          feature: {
            id: 'usd_credits',
            name: 'USD credits',
            type: 'credit_system',
            consumable: true,
            archived: false,
          },
        },
      },
    };
    eventsState.isPending = true;

    render(createBillingDashboardElement('user', 'wallet'));

    expect(
      screen.getByRole('status', { name: 'Loading wallet transactions' })
    ).not.toBeNull();
    expect(screen.getByText('Remaining balance')).not.toBeNull();
    expect(screen.queryByText('No usage history yet.')).toBeNull();
  });

  it('uses a readable fallback label when Autumn omits the metered feature name', () => {
    customerState.data = {
      id: 'user:123',
      invoices: [],
      entities: [{ id: 'member:1' }],
      subscriptions: [],
      purchases: [],
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
          granted: 120,
          remaining: 80,
          usage: 40,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: 500,
          nextResetAt: 1_700_100_000_000,
          feature: {
            id: 'usd_credits',
            name: 'USD credits',
            type: 'credit_system',
            consumable: true,
            archived: false,
            creditSchema: [
              {
                meteredFeatureId: 'chat_messages',
                creditCost: 2,
              },
            ],
            display: {
              singular: 'usd credit',
              plural: 'usd credits',
            },
          },
        },
      },
    };
    eventsState.list = [
      {
        id: 'evt_chat_123',
        timestamp: 1_700_050_000_000,
        featureId: 'chat_messages',
        customerId: 'user:123',
        value: 3,
        properties: {
          walletCreditCostSnapshot: '2',
          walletDebitAmountSnapshot: '6',
        },
      },
    ];

    render(createBillingDashboardElement('user', 'wallet'));

    expect(screen.getByText('Chat Messages')).not.toBeNull();
    expect(screen.getByText('-$6.00')).not.toBeNull();
  });

  it('prefers recorded wallet cost snapshots over the current credit cost', () => {
    customerState.data = {
      id: 'user:123',
      invoices: [],
      entities: [{ id: 'member:1' }],
      subscriptions: [],
      purchases: [],
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
          granted: 120,
          remaining: 80,
          usage: 40,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: 500,
          nextResetAt: 1_700_100_000_000,
          feature: {
            id: 'usd_credits',
            name: 'USD credits',
            type: 'credit_system',
            consumable: true,
            archived: false,
            creditSchema: [
              {
                meteredFeatureId: 'chat_messages',
                creditCost: 9,
              },
            ],
            display: {
              singular: 'usd credit',
              plural: 'usd credits',
            },
          },
        },
      },
    };
    eventsState.list = [
      {
        id: 'evt_chat_snapshot',
        timestamp: 1_700_050_000_000,
        featureId: 'chat_messages',
        customerId: 'user:123',
        value: 3,
        properties: {
          walletCreditCostSnapshot: '2',
          walletDebitAmountSnapshot: '6',
        },
      },
    ];

    render(createBillingDashboardElement('user', 'wallet'));

    expect(screen.getByText('-$6.00')).not.toBeNull();
    expect(screen.queryByText('-$27.00')).toBeNull();
    expect(screen.getByText('3 units')).not.toBeNull();
  });

  it('does not recalculate old usage with the current cost when no snapshot exists', () => {
    customerState.data = {
      id: 'user:123',
      invoices: [],
      entities: [{ id: 'member:1' }],
      subscriptions: [],
      purchases: [],
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
          granted: 120,
          remaining: 80,
          usage: 40,
          unlimited: false,
          overageAllowed: false,
          maxPurchase: 500,
          nextResetAt: 1_700_100_000_000,
          feature: {
            id: 'usd_credits',
            name: 'USD credits',
            type: 'credit_system',
            consumable: true,
            archived: false,
            creditSchema: [
              {
                meteredFeatureId: 'chat_messages',
                creditCost: 9,
              },
            ],
            display: {
              singular: 'usd credit',
              plural: 'usd credits',
            },
          },
        },
      },
    };
    eventsState.list = [
      {
        id: 'evt_chat_legacy',
        timestamp: 1_700_050_000_000,
        featureId: 'chat_messages',
        customerId: 'user:123',
        value: 3,
        properties: {},
      },
    ];

    render(createBillingDashboardElement('user', 'wallet'));

    expect(screen.getByText('3 units')).not.toBeNull();
    expect(screen.queryByText('-$0.00')).toBeNull();
    expect(screen.queryByText('-$27.00')).toBeNull();
  });

  it('starts an Autumn checkout flow for the top_up product', async () => {
    render(createBillingDashboardElement('user', 'wallet'));

    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '250' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add funds' }));

    await waitFor(() => {
      expect(attachMock).toHaveBeenCalledWith({
        planId: 'top_up',
        successUrl: window.location.href,
        featureQuantities: [
          {
            featureId: 'usd_credits',
            quantity: 250,
          },
        ],
      });
    });

    expect(scopedLoggerMock.action).toHaveBeenCalledWith(
      'topUpWallet',
      expect.objectContaining({
        scope: 'user',
        view: 'wallet',
        planId: 'top_up',
        requestedQuantity: 250,
      }),
      'info'
    );
    expect(scopedLoggerMock.log).toHaveBeenCalledWith(
      'ACTION_RESULT',
      expect.objectContaining({
        action: 'topUpWallet',
        status: 'success',
      }),
      'info'
    );
  });

  it('accepts only whole numbers in the top-up input', () => {
    render(createBillingDashboardElement('user', 'wallet'));

    const amountInput = screen.getByDisplayValue('1') as HTMLInputElement;

    fireEvent.change(amountInput, {
      target: { value: '12.5' },
    });

    expect(amountInput.value).toBe('1');

    fireEvent.change(amountInput, {
      target: { value: '125' },
    });

    expect(amountInput.value).toBe('125');
  });

  it('blocks wallet top-up when the wallet plan item is missing', () => {
    plansState.data = [
      {
        id: 'top_up',
        name: 'Top Up',
        description: 'One-off usd credit top-up',
        group: null,
        price: {
          amount: 1,
          interval: 'one_off',
        },
        items: [],
      },
    ];

    render(createBillingDashboardElement('user', 'wallet'));

    const addFundsButton = screen.getByRole('button', { name: 'Add funds' });

    expect(addFundsButton).not.toBeNull();
    expect(addFundsButton.hasAttribute('disabled')).toBe(true);
    expect(
      screen.getByText(
        'The "top_up" top-up product does not currently include a balance feature item, so checkout cannot honor the requested quantity or grant balance. Update the product to include the intended balance feature and pricing before enabling top-ups here.'
      )
    ).not.toBeNull();
    expect(attachMock).not.toHaveBeenCalled();
  });

  it('shows a helpful message when billing returns a wallet currency mismatch', async () => {
    attachMock.mockRejectedValueOnce({
      body: JSON.stringify({
        message:
          "(Stripe Error) The price specified only supports `usd`. This doesn't match the expected currency: `gbp`.",
        code: 'stripe_error',
        env: 'sandbox',
      }),
      statusCode: 400,
    });

    renderBillingDashboard('user', 'wallet');

    fireEvent.click(screen.getByRole('button', { name: 'Add funds' }));

    await waitFor(() => {
      expect(
        screen.getAllByText(
          'Wallet top-up is configured for USD, but your current billing currency is GBP. Add a matching GBP price to the top-up product or align your billing currencies.'
        ).length
      ).toBeGreaterThan(0);
    });

    expect(screen.getByText('Unable to start wallet top-up')).not.toBeNull();
  });

  it('shows a plain-text rate-limit message in the wallet toast', async () => {
    attachMock.mockRejectedValueOnce({
      statusCode: 429,
      body: 'Too many requests, please try again later.',
    });

    renderBillingDashboard('user', 'wallet');

    fireEvent.click(screen.getByRole('button', { name: 'Add funds' }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Too many requests, please try again later.').length
      ).toBeGreaterThan(0);
    });

    expect(screen.getByText('Unable to start wallet top-up')).not.toBeNull();
  });
});
