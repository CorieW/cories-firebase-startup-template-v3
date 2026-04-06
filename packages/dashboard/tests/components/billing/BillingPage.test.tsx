// @vitest-environment jsdom

/**
 * Tests page-level billing scope orchestration and remount behavior.
 */
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BillingPage from '@/components/billing/BillingPage';

const scopeState = {
  activeOrganizationId: null as string | null | undefined,
  sessionActiveOrganizationId: null as string | null | undefined,
};

const lifecycle = {
  mounts: 0,
  unmounts: 0,
};

vi.mock('@/lib/auth-client', () => ({
  useAuthSession: () => ({
    session: {
      activeOrganizationId: scopeState.sessionActiveOrganizationId,
      userId: 'user_1',
    },
    user: {
      id: 'user_1',
      email: 'user@example.com',
      name: 'Test User',
    },
  }),
  useActiveOrganization: () => ({
    data: scopeState.activeOrganizationId
      ? {
          id: scopeState.activeOrganizationId,
          name: 'Example Org',
        }
      : null,
  }),
}));

vi.mock('@/components/PageHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid='billing-page-title'>{title}</div>
  ),
}));

vi.mock('@/components/billing/BillingDashboard', async () => {
  const React = await import('react');

  return {
    default: ({
      scope,
      view,
    }: {
      scope: 'user' | 'organization';
      view: 'subscriptions' | 'wallet';
    }) => {
      React.useEffect(() => {
        lifecycle.mounts += 1;

        return () => {
          lifecycle.unmounts += 1;
        };
      }, []);

      return (
        <div data-testid='billing-dashboard'>
          {scope}:{view}
        </div>
      );
    },
  };
});

describe('BillingPage', () => {
  beforeEach(() => {
    scopeState.activeOrganizationId = null;
    scopeState.sessionActiveOrganizationId = null;
    lifecycle.mounts = 0;
    lifecycle.unmounts = 0;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('remounts the billing dashboard when the resolved scope changes', () => {
    const rendered = render(<BillingPage section='wallet' />);

    expect(rendered.getByTestId('billing-dashboard').textContent).toBe(
      'user:wallet'
    );
    expect(lifecycle.mounts).toBe(1);
    expect(lifecycle.unmounts).toBe(0);

    scopeState.activeOrganizationId = 'org_1';
    rendered.rerender(<BillingPage section='wallet' />);

    expect(rendered.getByTestId('billing-dashboard').textContent).toBe(
      'organization:wallet'
    );
    expect(lifecycle.mounts).toBe(2);
    expect(lifecycle.unmounts).toBe(1);
  });

  it('uses the resolved personal scope when the session org id lags behind', () => {
    scopeState.activeOrganizationId = 'org_1';
    scopeState.sessionActiveOrganizationId = 'org_1';

    const rendered = render(<BillingPage section='wallet' />);

    expect(rendered.getByTestId('billing-dashboard').textContent).toBe(
      'organization:wallet'
    );

    scopeState.activeOrganizationId = null;
    rendered.rerender(<BillingPage section='wallet' />);

    expect(rendered.getByTestId('billing-dashboard').textContent).toBe(
      'user:wallet'
    );
    expect(lifecycle.mounts).toBe(2);
    expect(lifecycle.unmounts).toBe(1);
  });
});
