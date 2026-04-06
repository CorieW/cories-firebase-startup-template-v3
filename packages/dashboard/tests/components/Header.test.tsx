// @vitest-environment jsdom

/**
 * Tests header auth-shell gating behavior.
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/Header';

const routerState = {
  pathname: '/',
};

const signedInSidebarMock = vi.fn(
  ({ isSessionPending }: { isSessionPending?: boolean }) => (
    <div data-testid='signed-in-sidebar'>
      {isSessionPending ? 'pending sidebar' : 'ready sidebar'}
    </div>
  )
);

const signedOutHeaderMock = vi.fn(
  ({ isAuthRoute }: { isAuthRoute: boolean }) => (
    <div data-testid='signed-out-header'>
      {isAuthRoute ? 'auth route' : 'marketing route'}
    </div>
  )
);

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string;
  }) => select({ location: { pathname: routerState.pathname } }),
}));

vi.mock('@/components/shell/SignedInSidebar', () => ({
  default: (props: { isSessionPending?: boolean }) =>
    signedInSidebarMock(props),
}));

vi.mock('@/components/shell/SignedOutHeader', () => ({
  default: (props: { isAuthRoute: boolean }) => signedOutHeaderMock(props),
}));

describe('Header', () => {
  afterEach(() => {
    cleanup();
    routerState.pathname = '/';
    signedInSidebarMock.mockClear();
    signedOutHeaderMock.mockClear();
  });

  it('renders the signed-out header for unauthenticated routes', () => {
    render(<Header isSessionPending={false} showSignedInShell={false} />);

    expect(screen.getByTestId('signed-out-header').textContent).toBe(
      'marketing route'
    );
    expect(screen.queryByTestId('signed-in-sidebar')).toBeNull();
  });

  it('keeps the signed-in shell visible while the session is still pending', () => {
    render(<Header isSessionPending showSignedInShell />);

    expect(screen.getByTestId('signed-in-sidebar').textContent).toBe(
      'pending sidebar'
    );
    expect(screen.queryByTestId('signed-out-header')).toBeNull();
  });

  it('tells the signed-out header when the current route is an auth route', () => {
    routerState.pathname = '/sign-in';

    render(<Header isSessionPending={false} showSignedInShell={false} />);

    expect(screen.getByTestId('signed-out-header').textContent).toBe(
      'auth route'
    );
  });
});
