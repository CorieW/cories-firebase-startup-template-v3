/**
 * Server route that records app chat usage against Autumn billing.
 */
import { createFileRoute } from '@tanstack/react-router';
import { default as commonLogging } from '@cories-firebase-startup-template-v3/common/logging';
import { getAutumnCustomerId } from '../lib/auth-autumn-ids';
import { auth, getAutumnServerClient } from '../lib/auth-server';
import {
  CHAT_FEATURE_ID,
  MAX_CHAT_MESSAGE_LENGTH,
  WALLET_FEATURE_ID,
  getChatMessageCharacterCount,
  getChatUsageUnits,
  getWalletUsageSnapshot,
  normalizeChatMessage,
} from '../lib/chat-usage';

const { createScopedLogger, serializeErrorForLogging } = commonLogging;
const chatUsageLogger = createScopedLogger('CHAT_USAGE_API');
let requestSequence = 0;

type AutumnBalanceLike = {
  featureId?: string | null;
  feature?: {
    id?: string | null;
    creditSchema?: Array<{
      meteredFeatureId?: string | null;
      creditCost?: number | null;
    }> | null;
  } | null;
};

function nextRequestId() {
  requestSequence += 1;
  return `chat-usage-${Date.now()}-${requestSequence}`;
}

export const Route = createFileRoute('/api/chat-usage')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestId = nextRequestId();
        const startedAt = Date.now();

        chatUsageLogger.log(
          'REQUEST',
          {
            action: 'recordChatUsage',
            requestId,
            method: request.method,
            route: new URL(request.url).pathname,
            status: 'start',
          },
          'debug'
        );

        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session?.session || !session.user) {
          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'unauthorized',
              durationMs: Date.now() - startedAt,
            },
            'warn'
          );
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const autumnClient = getAutumnServerClient();
        if (!autumnClient) {
          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'unavailable',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
              orgId: session.session.activeOrganizationId ?? null,
              reason: 'autumn-not-configured',
            },
            'warn'
          );
          return Response.json(
            { error: 'Autumn is not configured' },
            { status: 503 }
          );
        }

        let payload: unknown;

        try {
          payload = await request.json();
        } catch {
          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'invalid-request-body',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
            },
            'warn'
          );
          return Response.json(
            { error: 'Invalid request body' },
            { status: 400 }
          );
        }

        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload &&
          typeof payload.message === 'string'
            ? normalizeChatMessage(payload.message)
            : '';

        const messageCharacterCount = getChatMessageCharacterCount(message);

        if (!message) {
          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'validation-failed',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
              reason: 'message-required',
            },
            'warn'
          );
          return Response.json(
            { error: 'Message is required' },
            { status: 400 }
          );
        }

        if (messageCharacterCount > MAX_CHAT_MESSAGE_LENGTH) {
          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'validation-failed',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
              messageCharacterCount,
              reason: 'message-too-long',
            },
            'warn'
          );
          return Response.json(
            { error: 'Message is too long' },
            { status: 400 }
          );
        }

        const customerId = session.session.activeOrganizationId
          ? getAutumnCustomerId('org', session.session.activeOrganizationId)
          : getAutumnCustomerId('user', session.user.id);
        const usageUnits = getChatUsageUnits(message);
        try {
          const customer = await autumnClient.customers.getOrCreate({
            customerId,
            expand: ['balances.feature'],
          });
          const balances = Object.values(
            customer.balances ?? {}
          ) as AutumnBalanceLike[];
          const walletBalance =
            customer.balances?.[WALLET_FEATURE_ID] ??
            balances.find(balance => {
              return (
                balance.featureId === WALLET_FEATURE_ID ||
                balance.feature?.id === WALLET_FEATURE_ID
              );
            }) ??
            null;
          const walletBalanceCreditCost =
            walletBalance?.feature?.creditSchema?.find(entry => {
              return entry.meteredFeatureId === CHAT_FEATURE_ID;
            })?.creditCost ?? null;
          const walletFeature =
            walletBalance?.feature ??
            (await autumnClient.features
              .get({
                featureId: WALLET_FEATURE_ID,
              })
              .catch(() => null));
          const walletFeatureCreditCost =
            walletFeature?.creditSchema?.find(
              (entry: {
                meteredFeatureId?: string | null;
                creditCost?: number | null;
              }) => {
                return entry.meteredFeatureId === CHAT_FEATURE_ID;
              }
            )?.creditCost ?? null;
          const walletUsageSnapshot = getWalletUsageSnapshot(
            usageUnits,
            walletBalanceCreditCost ?? walletFeatureCreditCost
          );

          await autumnClient.track({
            customerId,
            featureId: CHAT_FEATURE_ID,
            value: usageUnits,
            properties: {
              surface: 'assistant-chat-page',
              messageSize: messageCharacterCount,
              usageUnits,
              ...(walletUsageSnapshot ?? {}),
            },
          });

          chatUsageLogger.log(
            'RESPONSE',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'success',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
              orgId: session.session.activeOrganizationId ?? null,
              customerId,
              messageCharacterCount,
              usageUnits,
              walletCreditCostSnapshot:
                walletUsageSnapshot?.walletCreditCostSnapshot ?? null,
            },
            'info'
          );

          return Response.json({ ok: true, usageUnits });
        } catch (error) {
          chatUsageLogger.log(
            'RESPONSE_ERROR',
            {
              action: 'recordChatUsage',
              requestId,
              status: 'error',
              durationMs: Date.now() - startedAt,
              userId: session.user.id,
              orgId: session.session.activeOrganizationId ?? null,
              customerId,
              messageCharacterCount,
              usageUnits,
              error: serializeErrorForLogging(error),
            },
            'error'
          );
          throw error;
        }
      },
    },
  },
});
