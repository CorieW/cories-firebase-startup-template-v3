/**
 * Support route module.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import SupportArticlesCard from '../components/support/SupportArticlesCard';
import SupportContactCard from '../components/support/SupportContactCard';
import SupportOptionsGrid from '../components/support/SupportOptionsGrid';
import SupportSearchCard from '../components/support/SupportSearchCard';
import { useToast } from '../components/toast/ToastProvider';
import { SUPPORT_ROUTE_PATH } from '../lib/route-paths';
import { CHAT_ROUTE_PATH } from './chat';
import { contentWrapClass, pageContainerClass } from '../lib/ui';

const supportLogger = createScopedLogger('SUPPORT_UI');

export const Route = createFileRoute(SUPPORT_ROUTE_PATH)({
  component: SupportPage,
});

/**
 * Displays the main support channels for signed-in users.
 */
function SupportPage() {
  const navigate = Route.useNavigate();
  const { toast } = useToast();

  function openSupportChat(source: 'live-chat' | 'contact-support') {
    supportLogger.action(
      'openSupportChat',
      {
        route: SUPPORT_ROUTE_PATH,
        source,
      },
      'info'
    );
    toast.info({
      title: 'Opening support chat',
      description: 'Connecting you to the right support channel.',
    });

    void navigate({
      to: CHAT_ROUTE_PATH,
      search: { source },
    })
      .then(() => {
        supportLogger.log(
          'CHAT_NAVIGATION',
          {
            action: 'openSupportChat',
            status: 'success',
            route: SUPPORT_ROUTE_PATH,
            source,
          },
          'info'
        );
      })
      .catch(error => {
        supportLogger.log(
          'CHAT_NAVIGATION',
          {
            action: 'openSupportChat',
            status: 'error',
            route: SUPPORT_ROUTE_PATH,
            source,
            error: serializeErrorForLogging(error),
          },
          'error'
        );
        toast.error({
          title: 'Could not open support chat',
          description: 'Please try again in a few seconds.',
        });
      });
  }

  const handleLiveChatClick = () => {
    openSupportChat('live-chat');
  };

  const handleContactSupportClick = () => {
    openSupportChat('contact-support');
  };

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Support'
        title='Get help from the team'
        description='Pick the channel that best matches your issue, and we will get you unblocked quickly.'
      />
      <div className='grid gap-3'>
        <SupportSearchCard />
        <SupportOptionsGrid onLiveChatClick={handleLiveChatClick} />
        <SupportArticlesCard />
        <SupportContactCard onContactSupportClick={handleContactSupportClick} />
      </div>
    </main>
  );
}
