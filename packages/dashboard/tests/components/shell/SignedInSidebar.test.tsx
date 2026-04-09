// @vitest-environment jsdom

/**
 * Tests signed-in sidebar navigation, billing groups, and organization state.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SUPPORT_DOCS_HREF } from '@/components/support/support-content';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SignedInSidebar from '@/components/shell/SignedInSidebar';
import { ToastProvider } from '@/components/toast/ToastProvider';

const hookState = {
  activeOrganizationId: null as string | null,
  pathname: '/',
};

vi.mock('@daveyplate/better-auth-ui', () => ({
  OrganizationSwitcher: () => <div data-testid='organization-switcher' />,
  UserButton: () => <button type='button'>User menu</button>,
}));

vi.mock('@/lib/auth-client', () => ({
  useAuthSession: () => ({
    session: {
      activeOrganizationId: hookState.activeOrganizationId,
    },
    user: {
      email: 'user@example.com',
      name: 'Test User',
    },
  }),
}));

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({}),
  Link: ({
    children,
    className,
    search,
    to,
    ...props
  }: {
    children: import('react').ReactNode;
    className?: string;
    search?: Record<string, string>;
    to: string;
  }) => {
    const href = search
      ? `${to}?${new URLSearchParams(search).toString()}`
      : to;

    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  },
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string;
  }) => select({ location: { pathname: hookState.pathname } }),
}));

vi.mock('@/components/AppBrand', () => ({
  default: () => <div>Brand</div>,
}));

vi.mock('@/components/ThemeToggle', () => ({
  default: () => <button type='button'>Theme</button>,
}));

function renderSignedInSidebar() {
  return render(
    <ToastProvider>
      <SignedInSidebar />
    </ToastProvider>
  );
}

describe('SignedInSidebar', () => {
  beforeEach(() => {
    hookState.activeOrganizationId = null;
    hookState.pathname = '/';
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the billing group expanded with all user billing sub-links by default', () => {
    renderSignedInSidebar();

    expect(
      screen
        .getByRole('button', { name: 'Support' })
        .getAttribute('aria-expanded')
    ).toBe('false');
    expect(
      screen
        .getByRole('button', { name: 'Billing' })
        .getAttribute('aria-expanded')
    ).toBe('true');
    expect(
      screen.getByRole('link', { name: 'Subscriptions' }).getAttribute('href')
    ).toBe('/pricing/subscriptions');
    expect(
      screen.getByRole('link', { name: 'Wallet' }).getAttribute('href')
    ).toBe('/pricing/wallet');
    expect(screen.queryByRole('link', { name: 'Transactions' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Chat' }).getAttribute('href')
    ).toBe('/assistant');
    expect(screen.queryByRole('link', { name: 'Contact' })).toBeNull();
  });

  it('expands the support group and shows the support child links', () => {
    renderSignedInSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Support' }));

    expect(
      screen.getByRole('link', { name: 'Contact' }).getAttribute('href')
    ).toBe('/chat?source=contact-support');
    expect(
      screen.getByRole('link', { name: 'Docs' }).getAttribute('href')
    ).toBe(SUPPORT_DOCS_HREF);
    expect(
      screen.getByRole('link', { name: 'Docs' }).getAttribute('target')
    ).toBe('_blank');
  });

  it('shows organization billing links when an active organization exists', () => {
    hookState.activeOrganizationId = 'org_1';

    renderSignedInSidebar();

    expect(
      screen.getByRole('link', { name: 'Subscriptions' }).getAttribute('href')
    ).toBe('/pricing/subscriptions');
    expect(
      screen.getByRole('link', { name: 'Wallet' }).getAttribute('href')
    ).toBe('/pricing/wallet');
    expect(screen.queryByRole('link', { name: 'Transactions' })).toBeNull();
  });

  it('keeps the billing group expanded when a billing child route is active', () => {
    hookState.pathname = '/pricing/wallet';

    renderSignedInSidebar();

    expect(
      screen
        .getByRole('button', { name: 'Billing' })
        .getAttribute('aria-expanded')
    ).toBe('true');
  });

  it('keeps the support group expanded when a support child route is active', () => {
    hookState.pathname = '/support/docs';

    renderSignedInSidebar();

    expect(
      screen
        .getByRole('button', { name: 'Support' })
        .getAttribute('aria-expanded')
    ).toBe('true');
  });
});
