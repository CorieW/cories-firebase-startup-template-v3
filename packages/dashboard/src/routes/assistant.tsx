/**
 * Simple wallet-backed product chat route module.
 */
import { createFileRoute } from '@tanstack/react-router';
import AssistantChatPanel from '../components/chat/AssistantChatPanel';
import { APP_CHAT_ROUTE_PATH } from '../lib/route-paths';
import { contentWrapClass, pageContainerClass } from '../lib/ui';

export const Route = createFileRoute(APP_CHAT_ROUTE_PATH)({
  component: AssistantChatPage,
});

/**
 * Assistant chat route.
 */
function AssistantChatPage() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <AssistantChatPanel />
    </main>
  );
}
