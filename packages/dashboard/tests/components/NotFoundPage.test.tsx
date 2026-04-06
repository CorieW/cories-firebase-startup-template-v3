// @vitest-environment jsdom

/**
 * Tests the dashboard not-found experience.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotFoundPage from '@/components/NotFoundPage';
import { ToastProvider } from '@/components/toast/ToastProvider';
import { SUPPORT_ROUTE_PATH } from '@/lib/route-paths';

function renderNotFoundPage() {
  render(
    <ToastProvider>
      <NotFoundPage />
    </ToastProvider>
  );
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/missing-route');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('shows the missing path in the page headline', () => {
    renderNotFoundPage();

    expect(screen.getByText('We could not find /missing-route')).not.toBeNull();
  });

  it('renders quick links back to safe destinations', () => {
    renderNotFoundPage();

    expect(screen.getByRole('link', { name: 'Go to home' })).not.toBeNull();
    expect(
      screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')
    ).toBe('/');
    expect(screen.getByRole('link', { name: 'Visit support' })).not.toBeNull();
    expect(
      screen.getByRole('link', { name: 'Visit support' }).getAttribute('href')
    ).toBe(SUPPORT_ROUTE_PATH);
  });

  it('uses browser history when the user clicks go back', () => {
    const historyBackSpy = vi
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});

    renderNotFoundPage();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(historyBackSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Going back')).not.toBeNull();
    expect(
      screen.getByText('Returning you to the previous page.')
    ).not.toBeNull();
  });
});
