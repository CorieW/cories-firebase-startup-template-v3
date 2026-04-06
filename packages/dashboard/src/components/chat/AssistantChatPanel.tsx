/**
 * Minimal product chat panel that tracks Autumn chat usage.
 */
import AssistantChatComposer from './AssistantChatComposer';
import AssistantChatTranscript from './AssistantChatTranscript';
import { useAssistantChat } from './use-assistant-chat';

/**
 * Assistant chat panel with transcript and composer.
 */
export default function AssistantChatPanel() {
  const chat = useAssistantChat();

  return (
    <section className='grid gap-3'>
      <AssistantChatTranscript
        messages={chat.messages}
        messagesEndRef={chat.messagesEndRef}
      />
      <AssistantChatComposer
        draftCharacterCount={chat.draftCharacterCount}
        draftMessage={chat.draftMessage}
        draftUsageLabel={chat.draftUsageLabel}
        draftUsageUnits={chat.draftUsageUnits}
        handleSubmit={chat.handleSubmit}
        isCustomerPending={chat.isCustomerPending}
        isSending={chat.isSending}
        onDraftChange={chat.setDraftMessage}
      />
    </section>
  );
}
