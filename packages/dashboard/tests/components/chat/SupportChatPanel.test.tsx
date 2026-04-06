// @vitest-environment jsdom

/**
 * Tests support chat panel messaging and navigation.
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SupportChatPanel from '@/components/chat/SupportChatPanel';
import { ToastProvider } from '@/components/toast/ToastProvider';

function renderSupportChatPanel(
  source: 'live-chat' | 'contact-support' | 'settings',
  onBack: () => void
) {
  render(
    <ToastProvider>
      <SupportChatPanel source={source} onBack={onBack} />
    </ToastProvider>
  );
}

describe('SupportChatPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the source greeting and supports back navigation', () => {
    const onBack = vi.fn();
    renderSupportChatPanel('live-chat', onBack);

    expect(
      screen.getByText('Welcome to live chat. How can we help today?')
    ).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Back to support' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Returning to support')).not.toBeNull();
    expect(
      screen.getByText('Taking you back to the support overview.')
    ).not.toBeNull();
  });

  it('sends a user message and appends a simulated support reply', () => {
    renderSupportChatPanel('contact-support', vi.fn());

    const input = screen.getByRole('textbox', { name: 'Chat message' });
    fireEvent.change(input, {
      target: {
        value: 'I need help with billing',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByText('I need help with billing')).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe('');

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(
      screen.getByText(
        'Thanks for the details. A support specialist will follow up shortly.'
      )
    ).not.toBeNull();
  });
});
