/**
 * Organization profile route module.
 */
import { OrganizationView } from '@daveyplate/better-auth-ui';
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import {
  accountViewClassNames,
  contentWrapClass,
  pageContainerClass,
  settingsViewPanelClass,
} from '../lib/ui';

export const Route = createFileRoute('/organization-profile/$')({
  component: OrganizationProfilePage,
});

function OrganizationProfilePage() {
  const { _splat } = Route.useParams();

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='Organization Profile'
        title='Manage organization settings and members'
      />
      <section className={settingsViewPanelClass}>
        <OrganizationView
          classNames={accountViewClassNames}
          pathname={`/organization-profile/${_splat || 'settings'}`}
        />
      </section>
    </main>
  );
}
