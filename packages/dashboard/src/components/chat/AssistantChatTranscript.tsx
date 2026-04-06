/**
 * Extracted transcript and message list for the assistant chat panel.
 */
import { panelClass } from '../../lib/ui';
import type { ChatMessage } from './use-assistant-chat';

export default function AssistantChatTranscript({
  messages,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <article className={`${panelClass} overflow-hidden`}>
      <div className='border-b border-[color-mix(in_srgb,var(--line)_62%,transparent)] p-4'>
        <h2 className='m-0 text-lg font-bold text-[var(--ink)]'>Assistant</h2>
        <p className='mb-0 mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
          Start a conversation below. Replies are currently lightweight local
          placeholders.
        </p>
      </div>

      <div className='h-[52vh] min-h-[20rem] overflow-y-auto p-4'>
        <div className='grid gap-3'>
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-[14px] px-3 py-2 text-sm leading-6 min-[560px]:max-w-[72%] ${
                  message.sender === 'user'
                    ? 'bg-[var(--primary)] text-[var(--primary-ink)]'
                    : 'bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)] text-[var(--ink)]'
                }`}
              >
                <p className='m-0'>{message.text}</p>
                <p
                  className={`mb-0 mt-1 text-xs ${
                    message.sender === 'user'
                      ? 'text-[color-mix(in_srgb,var(--primary-ink)_82%,transparent_18%)]'
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
    </article>
  );
}
