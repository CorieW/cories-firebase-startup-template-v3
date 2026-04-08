/**
 * Chat route module.
 */
import commonLogging from '@cories-firebase-startup-template-v3/common/logging';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SupportChatPanel, {
  type ChatSource,
} from '../components/chat/SupportChatPanel';
import { useToast } from '../components/toast/ToastProvider';
import { SUPPORT_ROUTE_PATH } from '../lib/route-paths';
import { contentWrapClass, pageContainerClass } from '../lib/ui';

export const CHAT_ROUTE_PATH = '/chat';
const { createScopedLogger } = commonLogging;
const chatRouteLogger = createScopedLogger('CHAT_ROUTE');

interface ChatSearchParams {
  source?: string;
}

function normalizeChatSource(source: unknown): ChatSource {
  if (source === 'contact-support' || source === 'settings') {
    return source;
  }

  return 'live-chat';
}

function isKnownChatSource(value: string): value is ChatSource {
  return (
    value === 'live-chat' || value === 'contact-support' || value === 'settings'
  );
}

export const Route = createFileRoute(CHAT_ROUTE_PATH)({
  validateSearch: (search: ChatSearchParams) => ({
    source: normalizeChatSource(search.source),
  }),
  component: ChatPage,
});

/**
 * Route-level wrapper for support chat scenarios.
 */
function ChatPage() {
  const search = Route.useSearch();
  const source = normalizeChatSource(search.source);
  const navigate = Route.useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const rawSource = new URLSearchParams(window.location.search).get('source');
    if (rawSource && !isKnownChatSource(rawSource)) {
      chatRouteLogger.log(
        'SOURCE_WARNING',
        {
          action: 'normalizeChatSource',
          route: CHAT_ROUTE_PATH,
          rawSource,
          normalizedSource: source,
        },
        'warn'
      );
      toast.warning({
        title: 'Unknown chat source',
        description: 'You were redirected to live chat support instead.',
      });
    }
  }, [source, toast]);

  useEffect(() => {
    chatRouteLogger.action(
      'openChatRoute',
      {
        route: CHAT_ROUTE_PATH,
        source,
      },
      'info'
    );
  }, [source]);

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Support'
        title='Chat with support'
        description='Start a conversation and we will help you resolve issues quickly.'
      />
      <SupportChatPanel
        source={source}
        onBack={() => {
          void navigate({ to: SUPPORT_ROUTE_PATH });
        }}
      />
    </main>
  );
}
