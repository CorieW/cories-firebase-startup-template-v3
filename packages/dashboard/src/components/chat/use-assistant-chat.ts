/**
 * Assistant chat state, Autumn usage checks, and submit handling.
 */
import { default as commonLogging } from '@cories-firebase-startup-template-v3/common/logging';
import { useCustomer } from 'autumn-js/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CHAT_FEATURE_ID,
  MAX_CHAT_MESSAGE_LENGTH,
  WALLET_FEATURE_ID,
  getChatMessageCharacterCount,
  getChatUsageUnits,
  normalizeChatMessage,
} from '../../lib/chat-usage';
import { useToast } from '../toast/ToastProvider';
import {
  buildAssistantReply,
  getChatUsageErrorMessage,
  getRequestErrorMessage,
} from './assistant-chat.lib';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const { createScopedLogger, serializeErrorForLogging } = commonLogging;
const chatLogger = createScopedLogger('CHAT_UI');

export function useAssistantChat() {
  const queryClient = useQueryClient();
  const {
    data: customer,
    check,
    refetch,
    error: customerError,
    isPending: isCustomerPending,
  } = useCustomer();
  const { toast } = useToast();
  const [draftMessage, setDraftMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-greeting',
      sender: 'assistant',
      text: 'Hi there. Send a message to start the conversation.',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const walletBalance = useMemo(() => {
    return (
      customer?.balances?.[WALLET_FEATURE_ID] ??
      Object.values(customer?.balances ?? {}).find(balance => {
        return (
          balance.featureId === WALLET_FEATURE_ID ||
          balance.feature?.id === WALLET_FEATURE_ID
        );
      }) ??
      null
    );
  }, [customer]);

  const chatBalance = useMemo(() => {
    return (
      customer?.balances?.[CHAT_FEATURE_ID] ??
      Object.values(customer?.balances ?? {}).find(
        balance => balance.featureId === CHAT_FEATURE_ID
      ) ??
      null
    );
  }, [customer]);

  const messageCreditCost = useMemo(() => {
    return (
      walletBalance?.feature?.creditSchema?.find(entry => {
        return entry.meteredFeatureId === CHAT_FEATURE_ID;
      })?.creditCost ?? null
    );
  }, [walletBalance]);

  const draftCharacterCount = useMemo(() => {
    return getChatMessageCharacterCount(draftMessage);
  }, [draftMessage]);

  const draftUsageUnits = useMemo(() => {
    return getChatUsageUnits(draftMessage);
  }, [draftMessage]);

  const requiredChatUsageUnits = draftUsageUnits > 0 ? draftUsageUnits : 1;

  const requiredChatCreditCost = useMemo(() => {
    if (
      typeof messageCreditCost !== 'number' ||
      !Number.isFinite(messageCreditCost) ||
      messageCreditCost <= 0
    ) {
      return null;
    }

    return requiredChatUsageUnits * messageCreditCost;
  }, [messageCreditCost, requiredChatUsageUnits]);

  const customerErrorMessage = useMemo(() => {
    return customerError
      ? getRequestErrorMessage(
          customerError,
          'We could not load your billing record.'
        )
      : null;
  }, [customerError]);

  const chatAccessResult = useMemo(() => {
    if (!customer?.id) {
      return {
        access: null,
        errorMessage: null,
      };
    }

    try {
      return {
        access: check({
          featureId: CHAT_FEATURE_ID,
          requiredBalance: requiredChatUsageUnits,
        }),
        errorMessage: null,
      };
    } catch (caughtError) {
      return {
        access: null,
        errorMessage: getRequestErrorMessage(
          caughtError,
          'We could not validate your chat access right now.'
        ),
      };
    }
  }, [check, customer, requiredChatUsageUnits]);

  const chatAccess = chatAccessResult.access;

  useEffect(() => {
    if (!customerErrorMessage) {
      return;
    }

    chatLogger.log(
      'CUSTOMER_ERROR',
      {
        action: 'loadChatCustomer',
        status: 'error',
        message: customerErrorMessage,
      },
      'error'
    );
    toast.error({
      title: 'Billing is unavailable',
      description: customerErrorMessage,
      durationMs: 7200,
    });
  }, [customerErrorMessage, toast]);

  useEffect(() => {
    if (!chatAccessResult.errorMessage) {
      return;
    }

    chatLogger.log(
      'ACCESS_ERROR',
      {
        action: 'checkChatAccess',
        status: 'error',
        message: chatAccessResult.errorMessage,
      },
      'error'
    );
    toast.error({
      title: 'Chat access check failed',
      description: chatAccessResult.errorMessage,
      durationMs: 7200,
    });
  }, [chatAccessResult.errorMessage, toast]);

  const messageAllowanceCount = useMemo(() => {
    if (
      typeof chatBalance?.remaining === 'number' &&
      Number.isFinite(chatBalance.remaining)
    ) {
      return Math.max(
        0,
        Math.floor(chatBalance.remaining / requiredChatUsageUnits)
      );
    }

    if (
      typeof walletBalance?.remaining === 'number' &&
      Number.isFinite(walletBalance.remaining) &&
      typeof requiredChatCreditCost === 'number' &&
      requiredChatCreditCost > 0
    ) {
      return Math.max(
        0,
        Math.floor(walletBalance.remaining / requiredChatCreditCost)
      );
    }

    return null;
  }, [
    chatBalance,
    requiredChatCreditCost,
    requiredChatUsageUnits,
    walletBalance,
  ]);

  const canSendChatMessage = useMemo(() => {
    if (messageAllowanceCount !== null) {
      return messageAllowanceCount >= 1;
    }

    if (chatAccess) {
      return chatAccess.allowed;
    }

    return true;
  }, [chatAccess, messageAllowanceCount]);

  useEffect(() => {
    const endAnchor = messagesEndRef.current;
    if (endAnchor && typeof endAnchor.scrollIntoView === 'function') {
      endAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedMessage = normalizeChatMessage(draftMessage);
    const route =
      typeof window !== 'undefined' ? window.location.pathname : null;

    if (!normalizedMessage) {
      chatLogger.log(
        'SEND_BLOCKED',
        {
          action: 'sendChatMessage',
          status: 'blocked',
          route,
          reason: 'missing-message',
        },
        'warn'
      );
      toast.warning({
        title: 'Write a message first',
        description: 'Type something before sending.',
      });
      return;
    }

    if (draftCharacterCount > MAX_CHAT_MESSAGE_LENGTH) {
      chatLogger.log(
        'SEND_BLOCKED',
        {
          action: 'sendChatMessage',
          status: 'blocked',
          route,
          reason: 'message-too-long',
          messageCharacterCount: draftCharacterCount,
        },
        'warn'
      );
      toast.warning({
        title: 'Message is too long',
        description: `Keep messages under ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
      });
      return;
    }

    if (!customer?.id) {
      chatLogger.log(
        'SEND_BLOCKED',
        {
          action: 'sendChatMessage',
          status: 'blocked',
          route,
          reason: 'missing-customer',
        },
        'warn'
      );
      toast.error({
        title: 'Chat is not ready yet',
        description: 'We could not load your billing customer record.',
      });
      return;
    }

    if (!canSendChatMessage) {
      chatLogger.log(
        'SEND_BLOCKED',
        {
          action: 'sendChatMessage',
          status: 'blocked',
          route,
          reason: 'insufficient-balance',
          messageCharacterCount: draftCharacterCount,
          usageUnits: draftUsageUnits,
        },
        'warn'
      );
      toast.warning({
        title: 'No chat balance left',
        description:
          'Top up your wallet or shorten the message before sending.',
      });
      return;
    }

    setIsSending(true);
    chatLogger.action(
      'sendChatMessage',
      {
        route,
        customerId: customer.id,
        messageCharacterCount: draftCharacterCount,
        usageUnits: draftUsageUnits,
      },
      'info'
    );

    try {
      const response = await fetch('/api/chat-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: normalizedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(await getChatUsageErrorMessage(response));
      }

      const sentAt = new Date();
      setMessages(previous => [
        ...previous,
        {
          id: `${sentAt.getTime()}-user`,
          sender: 'user',
          text: normalizedMessage,
          timestamp: sentAt,
        },
        {
          id: `${sentAt.getTime()}-assistant`,
          sender: 'assistant',
          text: buildAssistantReply(normalizedMessage),
          timestamp: new Date(sentAt.getTime() + 1),
        },
      ]);
      setDraftMessage('');
      await queryClient.invalidateQueries({ queryKey: ['autumn'] });
      void refetch();
      chatLogger.log(
        'SEND_RESULT',
        {
          action: 'sendChatMessage',
          status: 'success',
          route,
          customerId: customer.id,
          messageCharacterCount: draftCharacterCount,
          usageUnits: draftUsageUnits,
        },
        'info'
      );
    } catch (caughtError) {
      chatLogger.log(
        'SEND_RESULT',
        {
          action: 'sendChatMessage',
          status: 'error',
          route,
          customerId: customer.id,
          messageCharacterCount: draftCharacterCount,
          usageUnits: draftUsageUnits,
          error: serializeErrorForLogging(caughtError),
        },
        'error'
      );
      toast.error({
        title: 'Message failed to send',
        description: getRequestErrorMessage(
          caughtError,
          'Usage tracking did not complete. Please try again.'
        ),
      });
      return;
    } finally {
      setIsSending(false);
    }
  }

  const draftUsageLabel =
    draftUsageUnits > 0
      ? `${draftUsageUnits} ${draftUsageUnits === 1 ? 'usage unit' : 'usage units'}`
      : 'Configured by billing rules';

  return {
    canSendChatMessage,
    draftCharacterCount,
    draftMessage,
    draftUsageLabel,
    draftUsageUnits,
    handleSubmit,
    isCustomerPending,
    isSending,
    messages,
    messagesEndRef,
    setDraftMessage,
  };
}
