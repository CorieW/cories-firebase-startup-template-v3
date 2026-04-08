/**
 * Tests chat-usage route validation and pricing snapshot recording.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const scopedLoggerMock = vi.hoisted(() => ({
  action: vi.fn(),
  log: vi.fn(),
}));
const getSessionMock = vi.fn();
const getAutumnCustomerIdMock = vi.fn();
const getOrCreateMock = vi.fn();
const getFeatureMock = vi.fn();
const trackMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => {
    return (config: unknown) => config;
  },
}));

vi.mock('@cories-firebase-startup-template-v3/common/logging', async () => {
  const actual = await vi.importActual<
    typeof import('@cories-firebase-startup-template-v3/common/logging')
  >('@cories-firebase-startup-template-v3/common/logging');

  return {
    ...actual,
    default: {
      ...actual.default,
      createScopedLogger: () => scopedLoggerMock,
    },
    createScopedLogger: () => scopedLoggerMock,
  };
});

vi.mock('@/lib/auth-autumn-ids', () => ({
  getAutumnCustomerId: getAutumnCustomerIdMock,
}));

vi.mock('@/lib/auth-server', () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
  getAutumnServerClient: () => ({
    customers: {
      getOrCreate: getOrCreateMock,
    },
    features: {
      get: getFeatureMock,
    },
    track: trackMock,
  }),
}));

describe('api.chat-usage route', () => {
  beforeEach(() => {
    vi.resetModules();
    scopedLoggerMock.action.mockReset();
    scopedLoggerMock.log.mockReset();
    getSessionMock.mockReset();
    getAutumnCustomerIdMock.mockReset();
    getOrCreateMock.mockReset();
    getFeatureMock.mockReset();
    trackMock.mockReset();

    getSessionMock.mockResolvedValue({
      session: {
        activeOrganizationId: null,
      },
      user: {
        id: 'user_123',
      },
    });
    getAutumnCustomerIdMock.mockReturnValue('autumn-user-123');
    getOrCreateMock.mockResolvedValue({
      balances: {
        usd_credits: {
          featureId: 'usd_credits',
        },
      },
    });
    getFeatureMock.mockResolvedValue({
      id: 'usd_credits',
      creditSchema: [
        {
          meteredFeatureId: 'chat_messages',
          creditCost: 7,
        },
      ],
    });
    trackMock.mockResolvedValue({
      ok: true,
    });
  });

  it('records a wallet pricing snapshot using the wallet feature definition', async () => {
    const { Route } = await import('@/routes/api.chat-usage');
    const route = Route as unknown as {
      server: {
        handlers: {
          POST: (input: { request: Request }) => Promise<Response>;
        };
      };
    };

    const response = await route.server.handlers.POST({
      request: new Request('http://localhost/api/chat-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'hello',
        }),
      }),
    });

    expect(getOrCreateMock).toHaveBeenCalledWith({
      customerId: 'autumn-user-123',
      expand: ['balances.feature'],
    });
    expect(getFeatureMock).toHaveBeenCalledWith({
      featureId: 'usd_credits',
    });
    expect(trackMock).toHaveBeenCalledWith({
      customerId: 'autumn-user-123',
      featureId: 'chat_messages',
      value: 2,
      properties: {
        surface: 'assistant-chat-page',
        messageSize: 5,
        usageUnits: 2,
        walletCreditCostSnapshot: 7,
        walletDebitAmountSnapshot: 14,
      },
    });
    await expect(response.json()).resolves.toEqual({
      ok: true,
      usageUnits: 2,
    });
    expect(scopedLoggerMock.log).toHaveBeenCalledWith(
      'RESPONSE',
      expect.objectContaining({
        action: 'recordChatUsage',
        status: 'success',
        usageUnits: 2,
      }),
      'info'
    );
  });
});
