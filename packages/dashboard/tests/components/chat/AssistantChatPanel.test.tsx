// @vitest-environment jsdom

/**
 * Tests the wallet-backed assistant chat panel.
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssistantChatPanel from '@/components/chat/AssistantChatPanel';
import { ToastProvider } from '@/components/toast/ToastProvider';

const scopedLoggerMock = vi.hoisted(() => ({
  action: vi.fn(),
  log: vi.fn(),
}));
const refetchMock = vi.fn();
const fetchMock = vi.fn();
let customerHookError: unknown = null;

const customerState: {
  id: string;
  balances: Record<string, any>;
} = {
  id: 'user:123',
  balances: {
    usd_credits: {
      featureId: 'usd_credits',
      remaining: 240,
      feature: {
        creditSchema: [
          {
            meteredFeatureId: 'chat_messages',
            creditCost: 2,
          },
        ],
      },
    },
    chat_messages: {
      featureId: 'chat_messages',
      remaining: 120,
    },
  },
};

const checkResultState = {
  allowed: true,
};
const checkMock = vi.fn(() => checkResultState);

vi.mock('@cories-firebase-startup-template-v3/common', async () => {
  const actual = await vi.importActual<
    typeof import('@cories-firebase-startup-template-v3/common')
  >('@cories-firebase-startup-template-v3/common');

  return {
    ...actual,
    createScopedLogger: () => scopedLoggerMock,
  };
});

vi.mock('autumn-js/react', () => ({
  useCustomer: () => ({
    data: customerState,
    check: checkMock,
    refetch: refetchMock,
    error: customerHookError,
    isPending: false,
  }),
}));

function renderAssistantChatPanel() {
  const queryClient = new QueryClient();

  return render(
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <AssistantChatPanel />
      </QueryClientProvider>
    </ToastProvider>
  );
}

describe('AssistantChatPanel', () => {
  beforeEach(() => {
    scopedLoggerMock.action.mockReset();
    scopedLoggerMock.log.mockReset();
    refetchMock.mockReset();
    refetchMock.mockResolvedValue(undefined);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
    });
    customerHookError = null;
    checkResultState.allowed = true;
    checkMock.mockReset();
    checkMock.mockImplementation(() => checkResultState);
    vi.stubGlobal('fetch', fetchMock);
    customerState.balances.chat_messages = {
      featureId: 'chat_messages',
      remaining: 120,
    };
    customerState.balances.usd_credits.remaining = 240;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('tracks chat_messages usage when a message is sent', async () => {
    renderAssistantChatPanel();

    expect(screen.queryByText('Wallet balance')).toBeNull();
    expect(screen.queryByText('Current draft cost')).toBeNull();
    expect(screen.queryByText('Chat access')).toBeNull();

    fireEvent.change(screen.getByLabelText('Chat message'), {
      target: { value: 'Can you help me plan the next feature?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/chat-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Can you help me plan the next feature?',
        }),
      });
    });

    expect(
      screen.getByText('Can you help me plan the next feature?')
    ).not.toBeNull();
    expect(screen.getByText(/product-building question/i)).not.toBeNull();
    expect(refetchMock).toHaveBeenCalledTimes(1);
    expect(scopedLoggerMock.action).toHaveBeenCalledWith(
      'sendChatMessage',
      expect.objectContaining({
        customerId: 'user:123',
        usageUnits: 13,
      }),
      'info'
    );
    expect(scopedLoggerMock.log).toHaveBeenCalledWith(
      'SEND_RESULT',
      expect.objectContaining({
        action: 'sendChatMessage',
        status: 'success',
      }),
      'info'
    );
  });

  it('allows sending when the wallet can cover chat_messages without a direct chat balance', async () => {
    delete customerState.balances.chat_messages;
    checkResultState.allowed = false;

    renderAssistantChatPanel();

    fireEvent.change(screen.getByLabelText('Chat message'), {
      target: { value: 'Hello from the wallet-backed path' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/chat-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello from the wallet-backed path',
        }),
      });
    });

    expect(
      screen.getByText('Hello from the wallet-backed path')
    ).not.toBeNull();
  });

  it('shows higher draft usage for longer messages', () => {
    renderAssistantChatPanel();

    fireEvent.change(screen.getByLabelText('Chat message'), {
      target: { value: 'a'.repeat(12) },
    });

    expect(screen.queryByText('$8.00')).toBeNull();
    expect(screen.getByText(/12\/500 billable/i)).not.toBeNull();
    expect(screen.getByText(/4 usage units/i)).not.toBeNull();
  });

  it('blocks sending when Autumn reports that chat usage is not allowed', async () => {
    checkResultState.allowed = false;
    delete customerState.balances.chat_messages;
    customerState.balances.usd_credits.remaining = 0;

    renderAssistantChatPanel();

    fireEvent.change(screen.getByLabelText('Chat message'), {
      target: { value: 'Hello there' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
    });

    expect(
      (screen.getByLabelText('Chat message') as HTMLTextAreaElement).value
    ).toBe('Hello there');
  });

  it('shows the server-provided toast message when chat usage tracking fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      headers: {
        get: () => 'text/plain; charset=UTF-8',
      },
      text: vi
        .fn()
        .mockResolvedValue('Too many requests, please try again later.'),
    });

    renderAssistantChatPanel();

    fireEvent.change(screen.getByLabelText('Chat message'), {
      target: { value: 'Try again please' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByText('Message failed to send')).not.toBeNull();
    });

    expect(
      screen.getByText('Too many requests, please try again later.')
    ).not.toBeNull();
  });

  it('shows a toast when the Autumn customer hook fails', async () => {
    customerHookError = {
      body: JSON.stringify({
        message: 'Autumn customer lookup failed.',
      }),
    };

    renderAssistantChatPanel();

    await waitFor(() => {
      expect(screen.getByText('Autumn billing is unavailable')).not.toBeNull();
    });

    expect(screen.getByText('Autumn customer lookup failed.')).not.toBeNull();
  });

  it('shows a toast when the Autumn access check throws', async () => {
    checkMock.mockImplementation(() => {
      throw new Error('Autumn access check failed.');
    });

    renderAssistantChatPanel();

    await waitFor(() => {
      expect(
        screen.getByText('Autumn chat access check failed')
      ).not.toBeNull();
    });

    expect(screen.getByText('Autumn access check failed.')).not.toBeNull();
  });
});
