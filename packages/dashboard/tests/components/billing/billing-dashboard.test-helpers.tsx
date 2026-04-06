// @vitest-environment jsdom

/**
 * Shared mocked Autumn and toast setup for billing dashboard tests.
 */
import { cleanup, render } from '@testing-library/react';
import { vi } from 'vitest';
import { ToastProvider } from '@/components/toast/ToastProvider';

const mockedScopedLogger = vi.hoisted(() => ({
  action: vi.fn(),
  log: vi.fn(),
}));
export const scopedLoggerMock = mockedScopedLogger;

export const openCustomerPortalMock = vi.fn();
export const attachMock = vi.fn();
export const updateSubscriptionMock = vi.fn();
export const nextEventsPageMock = vi.fn();

vi.mock('@cories-firebase-startup-template-v3/common', async () => {
  const actual = await vi.importActual<
    typeof import('@cories-firebase-startup-template-v3/common')
  >('@cories-firebase-startup-template-v3/common');

  return {
    ...actual,
    createScopedLogger: () => mockedScopedLogger,
  };
});

export const defaultInvoices = [
  {
    planIds: ['growth'],
    stripeId: 'in_123',
    status: 'paid',
    total: 4900,
    currency: 'usd',
    createdAt: 1_700_000_000_000,
    hostedInvoiceUrl: 'https://example.com/invoices/in_123',
  },
];

export const customerState: {
  data: any;
  isPending: boolean;
  error?: unknown;
  openCustomerPortal: typeof openCustomerPortalMock;
  attach: typeof attachMock;
  updateSubscription: typeof updateSubscriptionMock;
} = {
  data: {
    id: 'user:123',
    invoices: defaultInvoices,
    entities: [{ id: 'member:1' }],
    subscriptions: [
      {
        plan: {
          id: 'growth',
          name: 'Growth',
        },
      },
    ],
  },
  isPending: false,
  error: null,
  openCustomerPortal: openCustomerPortalMock,
  attach: attachMock,
  updateSubscription: updateSubscriptionMock,
};

export const plansState: {
  data: any[];
  error?: unknown;
} = {
  data: [],
  error: null,
};

export const eventsState: {
  list: any[];
  hasMore: boolean;
  isPending: boolean;
  error?: unknown;
  nextPage: typeof nextEventsPageMock;
} = {
  list: [],
  hasMore: false,
  isPending: false,
  error: null,
  nextPage: nextEventsPageMock,
};

export const activeMemberState = {
  data: {
    role: 'owner',
  },
};

vi.mock('autumn-js/react', () => ({
  useCustomer: () => customerState,
  useListPlans: () => plansState,
  useListEvents: () => eventsState,
}));

vi.mock('@/lib/auth-client', () => ({
  useActiveMember: () => activeMemberState,
}));

import BillingDashboard from '@/components/billing/BillingDashboard';

export function resetBillingDashboardTestState() {
  customerState.data = {
    id: 'user:123',
    invoices: defaultInvoices,
    entities: [{ id: 'member:1' }],
    subscriptions: [
      {
        plan: {
          id: 'growth',
          name: 'Growth',
        },
      },
    ],
  };
  customerState.isPending = false;
  customerState.error = null;
  plansState.data = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Start with the essentials',
      group: 'user',
      price: {
        amount: 7.99,
        interval: 'month',
      },
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
    {
      id: 'top_up',
      name: 'Top Up',
      description: 'One-off usd credit top-up',
      group: null,
      items: [
        {
          featureId: 'usd_credits',
          included: 0,
          unlimited: false,
          reset: {
            interval: 'one_off',
          },
          price: {
            amount: 1,
            billingUnits: 1,
            billingMethod: 'prepaid',
            interval: 'one_off',
            maxPurchase: 1000,
          },
        },
      ],
    },
  ];
  plansState.error = null;
  activeMemberState.data = {
    role: 'owner',
  };
  eventsState.list = [];
  eventsState.hasMore = false;
  eventsState.isPending = false;
  eventsState.error = null;
  nextEventsPageMock.mockReset();
  mockedScopedLogger.action.mockReset();
  mockedScopedLogger.log.mockReset();
  openCustomerPortalMock.mockReset().mockResolvedValue(undefined);
  attachMock.mockReset().mockResolvedValue(undefined);
  updateSubscriptionMock.mockReset().mockResolvedValue(undefined);
}

export function renderBillingDashboard(
  scope: 'user' | 'organization',
  view: 'subscriptions' | 'wallet'
) {
  return render(createBillingDashboardElement(scope, view));
}

export function createBillingDashboardElement(
  scope: 'user' | 'organization',
  view: 'subscriptions' | 'wallet'
) {
  return (
    <ToastProvider>
      <BillingDashboard scope={scope} view={view} />
    </ToastProvider>
  );
}

export function cleanupBillingDashboard() {
  cleanup();
}
