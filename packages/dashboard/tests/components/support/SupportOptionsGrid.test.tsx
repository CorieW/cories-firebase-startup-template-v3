// @vitest-environment jsdom

/**
 * Tests support option links and live-chat actions.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SupportOptionsGrid from '@/components/support/SupportOptionsGrid';
import { ToastProvider } from '@/components/toast/ToastProvider';

function renderSupportOptionsGrid(onLiveChatClick = vi.fn()) {
  return render(
    <ToastProvider>
      <SupportOptionsGrid onLiveChatClick={onLiveChatClick} />
    </ToastProvider>
  );
}

describe('SupportOptionsGrid', () => {
  afterEach(() => {
    cleanup();
  });

  it('calls the live chat handler when the live chat card is clicked', () => {
    const onLiveChatClick = vi.fn();
    renderSupportOptionsGrid(onLiveChatClick);

    fireEvent.click(screen.getByRole('button', { name: /Live Chat/i }));

    expect(onLiveChatClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Live Chat').length).toBeGreaterThan(0);
    expect(screen.getByText('Opening live chat support.')).not.toBeNull();
  });

  it('renders support resource links for docs, email support, and faq', () => {
    renderSupportOptionsGrid();

    expect(
      screen.getByRole('link', { name: /Documentation/i }).getAttribute('href')
    ).toBe('https://docs.yourcompany.com');
    expect(
      screen.getByRole('link', { name: /Email Support/i }).getAttribute('href')
    ).toBe('mailto:support@yourcompany.com');
    expect(
      screen.getByRole('link', { name: /FAQ/i }).getAttribute('href')
    ).toBe('#popular-articles');
  });

  it('shows a toast when documentation is opened', () => {
    renderSupportOptionsGrid();

    fireEvent.click(screen.getByRole('link', { name: /Documentation/i }));

    expect(screen.getAllByText('Documentation').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Opening the documentation in a new tab.')
    ).not.toBeNull();
  });
});
