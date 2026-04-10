/**
 * Support chat panel UI.
 */
import {
  TEMPLATE_SUPPORT,
  TEMPLATE_SUPPORT_EMAIL_HREF,
} from '@cories-firebase-startup-template-v3/common';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { panelClass, panelMutedClass } from '../../lib/ui';
import { useToast } from '../toast/ToastProvider';

export type ChatSource = 'live-chat' | 'contact-support' | 'settings';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: Date;
}

interface SupportChatPanelProps {
  source: ChatSource;
  onBack: () => void;
}

interface ChatContext {
  title: string;
  description: string;
  greeting: string;
  status: string;
}

const CHAT_CONTEXT_BY_SOURCE: Record<ChatSource, ChatContext> = {
  'live-chat': {
    title: 'Live chat support',
    description: 'Chat in real time with a support specialist.',
    greeting: 'Welcome to live chat. How can we help today?',
    status: 'Support team is online now',
  },
  'contact-support': {
    title: 'Contact support',
    description:
      'Share details and we will route your request to the right team.',
    greeting: 'Thanks for reaching out. What can we help you solve?',
    status: 'Typical first reply: under 2 hours',
  },
  settings: {
    title: 'Settings support',
    description: 'Get help with account or organization configuration.',
    greeting: 'Tell us which setting you are trying to update.',
    status: 'Typical first reply: under 2 hours',
  },
};

const MAX_CHAT_MESSAGE_LENGTH = 500;

/**
 * Interactive support chat panel with a local simulated support response.
 */
export default function SupportChatPanel({
  source,
  onBack,
}: SupportChatPanelProps) {
  const context = useMemo(() => CHAT_CONTEXT_BY_SOURCE[source], [source]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const responseTimerIdsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        sender: 'support',
        text: context.greeting,
        timestamp: new Date(),
      },
    ]);
  }, [context.greeting]);

  useEffect(() => {
    const endAnchor = messagesEndRef.current;
    if (endAnchor && typeof endAnchor.scrollIntoView === 'function') {
      endAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      responseTimerIdsRef.current.forEach(timerId => {
        clearTimeout(timerId);
      });
      responseTimerIdsRef.current = [];
    };
  }, []);

  function sendMessage() {
    const trimmed = draftMessage.trim();
    if (!trimmed) {
      toast.warning({
        title: 'Write a message first',
        description: 'Type your question before sending.',
      });
      return;
    }

    if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
      toast.warning({
        title: 'Message is too long',
        description: `Keep messages under ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
      });
      return;
    }

    try {
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-user`,
          sender: 'user',
          text: trimmed,
          timestamp: new Date(),
        },
      ]);
      setDraftMessage('');
      toast.success({
        title: 'Message sent',
        description: 'A support specialist will follow up shortly.',
      });

      const responseTimerId = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-support`,
            sender: 'support',
            text: 'Thanks for the details. A support specialist will follow up shortly.',
            timestamp: new Date(),
          },
        ]);
      }, 900);

      responseTimerIdsRef.current.push(responseTimerId);
    } catch {
      toast.error({
        title: 'Message failed to send',
        description: 'Please retry in a few moments.',
      });
    }
  }

  return (
    <section className='grid gap-3'>
      <button
        type='button'
        onClick={() => {
          toast.info({
            title: 'Returning to support',
            description: 'Taking you back to the support overview.',
          });
          onBack();
        }}
        className={`${panelMutedClass} inline-flex h-10 w-fit items-center gap-2 px-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]`}
      >
        <ArrowLeft aria-hidden='true' className='h-4 w-4' />
        Back to support
      </button>

      <article className={`${panelClass} overflow-hidden`}>
        <header className='border-b border-[var(--line)] p-4'>
          <div className='flex items-center gap-3'>
            <MessageCircle
              aria-hidden='true'
              className='h-6 w-6 text-[var(--ink)]'
            />
            <div>
              <h2 className='m-0 text-lg font-bold text-[var(--ink)]'>
                {context.title}
              </h2>
              <p className='m-0 text-sm text-[var(--ink-soft)]'>
                {context.status}
              </p>
            </div>
          </div>
          <p className='mt-3 mb-0 text-sm leading-6 text-[var(--ink-soft)]'>
            {context.description}
          </p>
        </header>

        <div className='h-[56vh] min-h-[22rem] overflow-y-auto p-4'>
          <div className='grid gap-3'>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-[12px] px-3 py-2 text-sm leading-6 min-[560px]:max-w-[72%] ${
                    message.sender === 'user'
                      ? 'bg-[var(--primary)] text-[var(--primary-ink)]'
                      : 'bg-[var(--surface-soft)] text-[var(--ink)]'
                  }`}
                >
                  <p className='m-0'>{message.text}</p>
                  <p
                    className={`mt-1 mb-0 text-xs ${
                      message.sender === 'user'
                        ? 'text-[var(--primary-ink)]'
                        : 'text-[var(--ink-soft)]'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className='border-t border-[var(--line)] p-4'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={draftMessage}
              onChange={event => {
                setDraftMessage(event.target.value);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder='Write a message to support'
              maxLength={MAX_CHAT_MESSAGE_LENGTH}
              className='h-10 flex-1 rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-sm text-[var(--ink)] transition-[border-color,background-color,color] outline-none focus:border-[var(--line-strong)] focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)] focus:outline-none'
              aria-label='Chat message'
            />
            <button
              type='button'
              onClick={sendMessage}
              disabled={!draftMessage.trim()}
              className='inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-transparent bg-[var(--primary)] text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-55'
              aria-label='Send message'
            >
              <Send aria-hidden='true' className='h-4 w-4' />
            </button>
          </div>
        </div>
      </article>

      <div
        className={`${panelMutedClass} px-4 py-3 text-sm text-[var(--ink-soft)]`}
      >
        Need to follow up by email instead?{' '}
        <a
          href={TEMPLATE_SUPPORT_EMAIL_HREF}
          className='font-semibold text-[var(--ink)] underline underline-offset-4'
        >
          {TEMPLATE_SUPPORT.emailAddress}
        </a>
      </div>
    </section>
  );
}
