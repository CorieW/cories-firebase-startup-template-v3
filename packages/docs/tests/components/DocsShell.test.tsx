// @vitest-environment jsdom

/**
 * Smoke tests for the shared docs navigation shell.
 */
import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DocsShell from '@/components/DocsShell';
import { source } from '@/lib/source.server';

vi.mock('@/components/AppBrand', () => ({
  default: () => <span data-testid='docs-brand'>Docs Brand</span>,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
  useRouterState: ({
    select,
  }: {
    select: (state: {
      isLoading: boolean;
      location: { pathname: string };
    }) => unknown;
  }) =>
    select({
      isLoading: false,
      location: { pathname: '/' },
    }),
}));

describe('DocsShell', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-preference', 'light');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });
    globalThis.ResizeObserver = class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    };
    globalThis.IntersectionObserver = class IntersectionObserver {
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    } as unknown as typeof IntersectionObserver;
  });

  it('renders the shared brand, sidebar, search, and toc controls', () => {
    render(
      <RootProvider
        search={{ links: [['Docs home', '/']] }}
        theme={{ enabled: false }}
      >
        <DocsShell tree={source.getPageTree()}>
          <DocsPage
            toc={[{ depth: 2, title: 'Section one', url: '#section-one' }]}
          >
            <DocsTitle>Test page</DocsTitle>
            <DocsBody>
              <h2 id='section-one'>Section one</h2>
              <p>Body copy</p>
            </DocsBody>
          </DocsPage>
        </DocsShell>
      </RootProvider>
    );

    expect(screen.getAllByTestId('docs-brand').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Getting Started').length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Open Search' }).length
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Dark mode' })).toBeNull();
    expect(screen.getAllByText('Section one').length).toBeGreaterThan(0);
  });
});
