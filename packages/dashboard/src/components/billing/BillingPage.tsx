/**
 * Page-level billing layout and orchestration component.
 */
import { getBillingScope } from '../../lib/billing-api';
import { useActiveOrganization, useAuthSession } from '../../lib/auth-client';
import type { BillingSection } from '../../lib/route-paths';
import { contentWrapClass, pageContainerClass } from '../../lib/ui';
import PageHeader from '../PageHeader';
import BillingDashboard from './BillingDashboard';

const headerCopy: Record<
  ReturnType<typeof getBillingScope>,
  Record<
    BillingSection,
    {
      eyebrow: string;
      title: string;
      description: string;
    }
  >
> = {
  user: {
    subscriptions: {
      eyebrow: 'User Billing',
      title: 'Manage personal billing',
      description:
        'Review your current plan, checkout flows, transactions, and billing portal access.',
    },
    wallet: {
      eyebrow: 'User Billing',
      title: 'Review personal wallet activity',
      description:
        'Check your wallet balance, recent balance activity, and linked billing actions.',
    },
  },
  organization: {
    subscriptions: {
      eyebrow: 'Organization Billing',
      title: 'Manage organization billing',
      description:
        'View your organization subscription status and manage billing plans.',
    },
    wallet: {
      eyebrow: 'Organization Billing',
      title: 'Review organization wallet activity',
      description:
        'Inspect your organization wallet balance, recent balance transactions, and billing activity.',
    },
  },
};

/**
 * Shared scope-aware billing page shell used by scoped billing routes.
 */
export default function BillingPage({ section }: { section: BillingSection }) {
  const { session } = useAuthSession();
  const { data: activeOrganization } = useActiveOrganization();
  const activeOrganizationId =
    typeof activeOrganization === 'undefined'
      ? undefined
      : (activeOrganization?.id ?? null);
  const scope = getBillingScope({
    activeOrganizationId,
    sessionActiveOrganizationId: session?.activeOrganizationId,
  });
  const copy = headerCopy[scope][section];

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <BillingDashboard
        key={`${scope}:${section}`}
        scope={scope}
        view={section}
      />
    </main>
  );
}
