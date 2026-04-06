// @vitest-environment jsdom

/**
 * Tests support search validation and success feedback.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SupportSearchCard from '@/components/support/SupportSearchCard';
import { ToastProvider } from '@/components/toast/ToastProvider';

function renderSupportSearchCard() {
  render(
    <ToastProvider>
      <SupportSearchCard />
    </ToastProvider>
  );
}

describe('SupportSearchCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a warning toast when searching with an empty query', () => {
    renderSupportSearchCard();

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('Add a search term')).toBeTruthy();
  });

  it('shows a success toast when search terms match support resources', () => {
    renderSupportSearchCard();

    fireEvent.change(screen.getByRole('textbox', { name: /Search support/i }), {
      target: { value: 'documentation' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText(/support match/i)).toBeTruthy();
  });
});
