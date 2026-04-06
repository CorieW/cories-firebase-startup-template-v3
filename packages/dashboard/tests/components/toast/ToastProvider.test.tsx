// @vitest-environment jsdom

/**
 * Tests toast rendering, dismissal, and auto-expiry behavior.
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '@/components/toast/ToastProvider';

function ToastHarness() {
  const { toast } = useToast();

  return (
    <div>
      <button
        type='button'
        onClick={() => {
          toast.success({
            title: 'Settings saved',
            description: 'All changes were stored successfully.',
            durationMs: 700,
          });
        }}
      >
        Show success
      </button>
      <button
        type='button'
        onClick={() => {
          toast.warning({
            title: 'Heads up',
            description: 'You are close to your usage limit.',
            durationMs: 5000,
          });
        }}
      >
        Show warning
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders and auto-dismisses a success toast', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show success' }));

    expect(screen.getByText('Settings saved')).not.toBeNull();
    expect(
      screen.getByText('All changes were stored successfully.')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(701);
    });

    act(() => {
      vi.advanceTimersByTime(201);
    });

    expect(screen.queryByText('Settings saved')).toBeNull();
  });

  it('supports manual dismissal', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show warning' }));
    expect(screen.getByText('Heads up')).not.toBeNull();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Dismiss Warning notification',
      })
    );

    act(() => {
      vi.advanceTimersByTime(201);
    });

    expect(screen.queryByText('Heads up')).toBeNull();
  });
});
