// @vitest-environment jsdom

/**
 * Tests subscription view behavior for the billing dashboard.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  activeMemberState,
  attachMock,
  cleanupBillingDashboard,
  createBillingDashboardElement,
  customerState,
  defaultInvoices,
  openCustomerPortalMock,
  plansState,
  renderBillingDashboard,
  resetBillingDashboardTestState,
  updateSubscriptionMock,
} from './billing-dashboard.test-helpers';

describe('BillingDashboard subscriptions', () => {
  beforeEach(() => {
    resetBillingDashboardTestState();
  });

  afterEach(() => {
    cleanupBillingDashboard();
  });

  it('renders the current Autumn subscription and plan actions', () => {
    render(createBillingDashboardElement('user', 'subscriptions'));

    expect(screen.queryByText('Plans and billing')).not.toBeNull();
    expect(screen.getByText('Active subscriptions')).not.toBeNull();
    expect(screen.getAllByText('Growth').length).toBeGreaterThan(0);
    expect(screen.queryByText('Team')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Current plan' })
        .hasAttribute('disabled')
    ).toBe(true);
    expect(
      screen.queryByRole('button', { name: 'Choose plan' })
    ).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Cancel plan' })
    ).not.toBeNull();
  });

  it('renders skeleton placeholders while billing details are loading', () => {
    customerState.isPending = true;

    render(createBillingDashboardElement('user', 'subscriptions'));

    expect(
      screen.getByRole('status', { name: 'Loading billing details' })
    ).not.toBeNull();
    expect(screen.getByText('Plans and billing')).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Open billing portal' })
    ).toBeNull();
    expect(screen.queryByText('Active subscriptions')).toBeNull();
  });

  it('shows an active subscription when Autumn returns only the planId', () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    render(createBillingDashboardElement('user', 'subscriptions'));

    const activeSubscriptionsCard = screen.getByText(
      'Active subscriptions'
    ).parentElement;

    expect(activeSubscriptionsCard?.textContent).toContain('Growth');
    expect(activeSubscriptionsCard?.textContent).not.toContain(
      'No active paid plan yet.'
    );
    expect(
      screen
        .getByRole('button', { name: 'Current plan' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('treats scheduled plan changes as scheduled instead of current', () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_pro',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
        {
          id: 'sub_mini',
          planId: 'starter',
          status: 'scheduled',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_100_000_000,
          currentPeriodStart: 1_700_100_000_000,
          currentPeriodEnd: 1_700_200_000_000,
          quantity: 1,
        },
      ],
    };

    render(createBillingDashboardElement('user', 'subscriptions'));

    const activeSubscriptionsCard = screen.getByText(
      'Active subscriptions'
    ).parentElement;

    expect(activeSubscriptionsCard?.textContent).toContain('Growth');
    expect(activeSubscriptionsCard?.textContent).toContain('Scheduled next:');
    expect(activeSubscriptionsCard?.textContent).toContain('Starter');
    expect(
      screen.getAllByRole('button', { name: 'Current plan' })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole('button', { name: 'Undo cancellation' })
    ).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Scheduled' })).toHaveLength(
      1
    );
    expect(screen.getAllByRole('button', { name: 'Unschedule' })).toHaveLength(
      1
    );
    expect(
      screen.queryAllByRole('button', { name: 'Choose plan' })
    ).toHaveLength(0);
  });

  it('does not show the free tier as scheduled when a paid plan is canceling without another next plan', () => {
    plansState.data = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Free plan',
        group: 'user',
        items: [],
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Scale with more room',
        group: 'user',
        price: {
          amount: 19.99,
          interval: 'month',
        },
        items: [],
      },
    ];
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    render(createBillingDashboardElement('user', 'subscriptions'));

    const activeSubscriptionsCard = screen.getByText(
      'Active subscriptions'
    ).parentElement;

    expect(activeSubscriptionsCard?.textContent).not.toContain(
      'Scheduled next:'
    );
    expect(activeSubscriptionsCard?.textContent).not.toContain('Starter');
    expect(screen.queryByText('Starter')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Scheduled' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unschedule' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Undo cancellation' })
    ).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Choose plan' })).toBeNull();
  });

  it('shows ungrouped plans in both user and organization billing', () => {
    plansState.data = [
      {
        id: 'shared_free',
        name: 'Free',
        description: 'Shared free plan',
        group: null,
        items: [],
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Scale with more room',
        group: 'user',
        price: {
          amount: 19.99,
          interval: 'month',
        },
        items: [],
      },
      {
        id: 'team',
        name: 'Team',
        description: 'Collaborate across your organization',
        group: 'org',
        price: {
          amount: 49,
          interval: 'month',
        },
        items: [],
      },
    ];
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_shared_free',
          planId: 'shared_free',
          status: 'active',
          autoEnable: true,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    const { rerender } = render(
      createBillingDashboardElement('user', 'subscriptions')
    );

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Growth').length).toBeGreaterThan(0);
    expect(screen.queryByText('Team')).toBeNull();

    rerender(createBillingDashboardElement('organization', 'subscriptions'));

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
    expect(screen.queryByText('Growth')).toBeNull();
  });

  it('unschedules a future plan before it starts', async () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
        {
          id: 'sub_starter',
          planId: 'starter',
          status: 'scheduled',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_100_000_000,
          currentPeriodStart: 1_700_100_000_000,
          currentPeriodEnd: 1_700_200_000_000,
          quantity: 1,
        },
      ],
    };

    renderBillingDashboard('user', 'subscriptions');

    fireEvent.click(screen.getByRole('button', { name: 'Unschedule' }));

    await waitFor(() => {
      expect(updateSubscriptionMock).toHaveBeenCalledWith({
        subscriptionId: 'sub_growth',
        planId: 'growth',
        cancelAction: 'uncancel',
        redirectMode: 'never',
      });
    });

    expect(screen.getByText('Plan kept active')).not.toBeNull();
    expect(
      screen.getByText('The scheduled cancellation has been removed.')
    ).not.toBeNull();
  });

  it('undoes a scheduled cancellation when there is no next plan', async () => {
    plansState.data = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Free plan',
        group: 'user',
        items: [],
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Scale with more room',
        group: 'user',
        price: {
          amount: 19.99,
          interval: 'month',
        },
        items: [],
      },
    ];
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    renderBillingDashboard('user', 'subscriptions');

    fireEvent.click(screen.getByRole('button', { name: 'Undo cancellation' }));

    await waitFor(() => {
      expect(updateSubscriptionMock).toHaveBeenCalledWith({
        subscriptionId: 'sub_growth',
        planId: 'growth',
        cancelAction: 'uncancel',
        redirectMode: 'never',
      });
    });

    expect(screen.getByText('Plan kept active')).not.toBeNull();
    expect(
      screen.getByText('The scheduled cancellation has been removed.')
    ).not.toBeNull();
  });

  it('keeps the unschedule button label stable when a choose-plan action becomes scheduled', async () => {
    let resolveAttach: (() => void) | undefined;
    attachMock.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveAttach = resolve;
        })
    );

    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    const view = render(createBillingDashboardElement('user', 'subscriptions'));

    fireEvent.click(screen.getByRole('button', { name: 'Choose plan' }));

    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
        {
          id: 'sub_starter',
          planId: 'starter',
          status: 'scheduled',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_100_000_000,
          currentPeriodStart: 1_700_100_000_000,
          currentPeriodEnd: 1_700_200_000_000,
          quantity: 1,
        },
      ],
    };

    view.rerender(createBillingDashboardElement('user', 'subscriptions'));

    expect(screen.getByRole('button', { name: 'Unschedule' })).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Undo cancellation' })
    ).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Unscheduling...' })
    ).toBeNull();

    if (resolveAttach) {
      resolveAttach();
    }
  });

  it('does not show unschedule UI for a scheduled free tier', () => {
    plansState.data = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Free plan',
        group: 'user',
        items: [],
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Scale with more room',
        group: 'user',
        price: {
          amount: 19.99,
          interval: 'month',
        },
        items: [],
      },
    ];
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: 1_700_100_000_000,
          expiresAt: 1_700_100_000_000,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
        {
          id: 'sub_starter',
          planId: 'starter',
          status: 'scheduled',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_100_000_000,
          currentPeriodStart: 1_700_100_000_000,
          currentPeriodEnd: 1_700_200_000_000,
          quantity: 1,
        },
      ],
    };

    render(createBillingDashboardElement('user', 'subscriptions'));

    expect(screen.queryByText('Starter')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Scheduled' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unschedule' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Undo cancellation' })
    ).not.toBeNull();
  });

  it('cancels the current plan at the end of the billing cycle', async () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_growth',
          planId: 'growth',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    renderBillingDashboard('user', 'subscriptions');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel plan' }));

    await waitFor(() => {
      expect(updateSubscriptionMock).toHaveBeenCalledWith({
        subscriptionId: 'sub_growth',
        planId: 'growth',
        cancelAction: 'cancel_end_of_cycle',
        redirectMode: 'never',
      });
    });

    expect(screen.getByText('Plan cancellation scheduled')).not.toBeNull();
    expect(
      screen.getByText(
        'Your subscription will stay active until the end of the current billing period.'
      )
    ).not.toBeNull();
  });

  it('does not show cancel UI for free current plans', () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          id: 'sub_starter',
          planId: 'starter',
          status: 'active',
          autoEnable: false,
          addOn: false,
          pastDue: false,
          canceledAt: null,
          expiresAt: null,
          trialEndsAt: null,
          startedAt: 1_700_000_000_000,
          currentPeriodStart: 1_700_000_000_000,
          currentPeriodEnd: 1_700_100_000_000,
          quantity: 1,
        },
      ],
    };

    plansState.data = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Free plan',
        group: 'user',
        items: [],
      },
    ];

    render(createBillingDashboardElement('user', 'subscriptions'));

    expect(screen.getByRole('button', { name: 'Current plan' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel plan' })).toBeNull();
  });

  it('excludes one-off top-ups from the active subscriptions summary', () => {
    customerState.data = {
      ...customerState.data,
      subscriptions: [
        {
          plan: {
            id: 'growth',
            name: 'Growth',
          },
        },
        {
          plan: {
            id: 'top_up',
            name: 'Top Up',
          },
        },
      ],
    };

    render(createBillingDashboardElement('user', 'subscriptions'));

    const activeSubscriptionsCard = screen.getByText(
      'Active subscriptions'
    ).parentElement;

    expect(activeSubscriptionsCard?.textContent).toContain('Growth');
    expect(activeSubscriptionsCard?.textContent).not.toContain('Top Up');
    expect(screen.queryByText('Top Up')).toBeNull();
  });

  it('shows only organization plans for organization billing', () => {
    customerState.data = {
      id: 'org:123',
      invoices: defaultInvoices,
      entities: [{ id: 'member:1' }],
      subscriptions: [
        {
          plan: {
            id: 'team',
            name: 'Team',
          },
        },
      ],
    };

    render(createBillingDashboardElement('organization', 'subscriptions'));

    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
    expect(screen.queryByText('Starter')).toBeNull();
    expect(screen.queryByText('Growth')).toBeNull();
  });

  it('opens the billing portal with the current page as the return url', async () => {
    renderBillingDashboard('user', 'subscriptions');

    fireEvent.click(
      screen.getByRole('button', { name: 'Open billing portal' })
    );

    await waitFor(() => {
      expect(openCustomerPortalMock).toHaveBeenCalledWith({
        returnUrl: window.location.href,
      });
    });
  });

  it('shows a toast when billing rejects opening the billing portal', async () => {
    openCustomerPortalMock.mockRejectedValueOnce({
      body: JSON.stringify({
        message: 'Autumn could not open the customer portal right now.',
      }),
    });

    renderBillingDashboard('user', 'subscriptions');

    fireEvent.click(
      screen.getByRole('button', { name: 'Open billing portal' })
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to open billing portal')).not.toBeNull();
    });

    expect(
      screen.getAllByText(
        'Billing could not open the customer portal right now.'
      ).length
    ).toBeGreaterThan(0);
  });

  it('shows a toast when billing details fail to load', async () => {
    customerState.error = {
      body: JSON.stringify({
        message: 'Autumn customer lookup failed.',
      }),
    };

    renderBillingDashboard('user', 'subscriptions');

    await waitFor(() => {
      expect(screen.getByText('Unable to load billing details')).not.toBeNull();
    });

    expect(screen.getAllByText('Billing customer lookup failed.').length).toBe(
      2
    );
  });

  it('blocks organization plan changes for non-admin members', () => {
    activeMemberState.data = {
      role: 'member',
    };

    render(createBillingDashboardElement('organization', 'subscriptions'));

    expect(
      screen
        .getByRole('button', { name: 'Choose plan' })
        .hasAttribute('disabled')
    ).toBe(true);
    expect(
      screen.getByText(
        'Members can view billing, but only owners and admins can change plans.'
      )
    ).not.toBeNull();
  });

  it('starts the checkout attach flow when a paid plan is selected', async () => {
    plansState.data = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Free plan',
        group: 'user',
        items: [],
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Scale with more room',
        group: 'user',
        price: {
          amount: 19.99,
          interval: 'month',
        },
        items: [],
      },
      {
        id: 'scale',
        name: 'Scale',
        description: 'More capacity for growing teams',
        group: 'user',
        price: {
          amount: 49,
          interval: 'month',
        },
        items: [],
      },
    ];

    render(createBillingDashboardElement('user', 'subscriptions'));

    expect(screen.queryByText('Starter')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Choose plan' }));

    await waitFor(() => {
      expect(attachMock).toHaveBeenCalledWith({ planId: 'scale' });
    });
  });
});
