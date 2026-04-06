/**
 * Organization creation route.
 */
import { createFileRoute } from '@tanstack/react-router';
import { OrganizationsCard } from '@daveyplate/better-auth-ui';
import PageHeader from '../components/PageHeader';
import {
  betterAuthSettingsCardClassNames,
  contentWrapClass,
  pageContainerClass,
  settingsViewPanelClass,
} from '../lib/ui';

export const Route = createFileRoute('/create-organization')({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Create Organization'
        title='Set up a new organization workspace'
      />
      <section className={`${settingsViewPanelClass} max-w-5xl`}>
        <OrganizationsCard classNames={betterAuthSettingsCardClassNames} />
      </section>
    </main>
  );
}
