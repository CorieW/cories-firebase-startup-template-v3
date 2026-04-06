/**
 * Organization invitation acceptance route module.
 */
import { AcceptInvitationCard } from '@daveyplate/better-auth-ui';
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import {
  betterAuthSettingsCardClassNames,
  contentWrapClass,
  pageContainerClass,
  settingsViewPanelClass,
} from '../lib/ui';

export const Route = createFileRoute('/organization-profile/accept-invitation')(
  {
    component: AcceptInvitationPage,
  }
);

function AcceptInvitationPage() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Invitation'
        title='Join your organization'
        description='Accept the invitation to continue into the shared workspace.'
      />
      <section className={`${settingsViewPanelClass} max-w-4xl`}>
        <AcceptInvitationCard classNames={betterAuthSettingsCardClassNames} />
      </section>
    </main>
  );
}
