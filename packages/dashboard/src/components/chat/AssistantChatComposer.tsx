/**
 * Extracted message composer and submit controls for the assistant chat panel.
 */
import { LoaderCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';

export default function AssistantChatComposer({
  draftCharacterCount,
  draftMessage,
  draftUsageLabel,
  draftUsageUnits,
  handleSubmit,
  isCustomerPending,
  isSending,
  onDraftChange,
}: {
  draftCharacterCount: number;
  draftMessage: string;
  draftUsageLabel: string;
  draftUsageUnits: number;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isCustomerPending: boolean;
  isSending: boolean;
  onDraftChange: (value: string) => void;
}) {
  return (
    <form
      onSubmit={event => {
        void handleSubmit(event);
      }}
      className='border-t border-[var(--line)] p-4'
    >
      <label htmlFor='assistant-chat-message' className='sr-only'>
        Chat message
      </label>
      <textarea
        id='assistant-chat-message'
        value={draftMessage}
        onChange={event => {
          onDraftChange(event.target.value);
        }}
        placeholder='Ask anything...'
        maxLength={500}
        rows={4}
        className='min-h-28 w-full resize-y rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-3 text-sm text-[var(--ink)] outline-none transition-[border-color,background-color,color] focus:border-[var(--line-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)]'
      />
      <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
        <p className='m-0 text-sm text-[var(--ink-soft)]'>
          {draftCharacterCount}/500 billable {' characters'}
          {draftUsageUnits > 0 ? ` • ${draftUsageLabel}` : ''}
        </p>
        <Button
          type='submit'
          disabled={isSending || isCustomerPending || !draftMessage.trim()}
          className='min-w-36 gap-2'
        >
          {isSending ? (
            <LoaderCircle aria-hidden='true' className='h-4 w-4 animate-spin' />
          ) : (
            <Send aria-hidden='true' className='h-4 w-4' />
          )}
          {isSending ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
