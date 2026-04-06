/**
 * User profile route module.
 */
import { AccountView } from '@daveyplate/better-auth-ui';
import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import {
  accountViewClassNames,
  contentWrapClass,
  pageContainerClass,
  settingsViewPanelClass,
} from '../lib/ui';

export const Route = createFileRoute('/user-profile/$')({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { _splat } = Route.useParams();

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow='User Profile'
        title='Manage your profile and account'
      />
      <section className={settingsViewPanelClass}>
        <AccountView
          classNames={accountViewClassNames}
          pathname={`/user-profile/${_splat || 'settings'}`}
        />
      </section>
    </main>
  );
}
