/**
 * User detail route for read-only admin inspection.
 */
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminJsonPreview,
  AdminKeyValueList,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadUserDetailServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import {
  formatAdminBalanceAmount,
  formatAdminDateTime,
  formatAdminText,
} from '../lib/formatting';
import type {
  AdminUserBillingSummary,
  AdminUserDetail,
  AdminUserMembership,
} from '../lib/server/user-data';

const DATA_UNAVAILABLE_DESCRIPTION =
  'This data is unavailable right now. Check the admin billing configuration and customer state, then try again.';

export const Route = createFileRoute('/users/$userId')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async ({ params }) =>
    loadUserDetailServer({
      data: {
        userId: params.userId,
      },
    }),
  component: UserDetailPage,
});

/**
 * Renders the auth and app profile data for a specific user.
 */
function UserDetailPage() {
  const detail = Route.useLoaderData() as AdminUserDetail | null;
  const { userId } = Route.useParams();

  if (!detail) {
    return (
      <div className='space-y-6 py-5'>
        <AdminPageHeader
          description='That user id does not exist in the auth collection.'
          title='User not found'
        />
        <AdminEmptyState
          description='Check the uid and try the directory search again.'
          title='No user record was found'
          tone='danger'
        />
      </div>
    );
  }

  const authUser =
    detail.authUser && typeof detail.authUser === 'object'
      ? detail.authUser
      : {};
  const organizations = getOrganizationsFromMemberships(detail.memberships);
  const walletBalance = detail.billing.walletBalance;
  const shouldRedactBilling = detail.billing.status !== 'ready';
  const shouldRedactAutumnSubscriptions =
    detail.billing.status === 'error' ||
    detail.billing.status === 'missing-customer' ||
    detail.billing.status === 'not-configured';

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review Better Auth profile data, app-owned profile data, organization memberships, and Autumn subscriptions for a single user.'
        title={formatAdminText(
          typeof authUser.name === 'string' ? authUser.name : userId
        )}
      />

      <AdminPanel
        description='Core identifiers and account timestamps.'
        title='User summary'
      >
        <AdminKeyValueList
          items={[
            {
              label: 'User ID',
              value: detail.id,
            },
            {
              label: 'Email',
              value:
                typeof authUser.email === 'string'
                  ? authUser.email
                  : 'Unavailable',
            },
            {
              label: 'Created',
              value: formatAdminDateTime(
                typeof authUser.createdAt === 'string'
                  ? authUser.createdAt
                  : null
              ),
            },
          ]}
        />
      </AdminPanel>

      <AdminPanel
        description='Organizations linked to this user through Better Auth membership records.'
        title={`Organizations (${organizations.length})`}
      >
        {organizations.length === 0 ? (
          <AdminEmptyState
            description='This user is not currently attached to any organizations.'
            title='No organizations found'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Organization
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Organization ID
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Joined
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(organization => (
                  <tr key={organization.key}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div className='font-medium'>
                        {formatAdminText(organization.organizationName)}
                      </div>
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-mono text-xs'>
                      {formatAdminText(organization.organizationId)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(organization.createdAt)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {organization.organizationId ? (
                        <Link
                          className='font-semibold text-[var(--admin-primary)]'
                          params={{
                            organizationId: organization.organizationId,
                          }}
                          search={{ page: 1, search: '' }}
                          to='/organizations/$organizationId'
                        >
                          Open organization
                        </Link>
                      ) : (
                        'Unavailable'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <AdminPanel
        description='Personal Autumn wallet state for this user. This remains read-only and only loads when billing credentials are configured.'
        title='Wallet balance'
      >
        {shouldRedactBilling ? (
          <AdminEmptyState
            description={DATA_UNAVAILABLE_DESCRIPTION}
            title='Data unavailable'
            tone='danger'
          />
        ) : (
          <AdminKeyValueList
            items={[
              {
                label: 'Autumn customer ID',
                value: detail.billing.customerId,
              },
              {
                label: 'Billing status',
                value: getBillingStatusLabel(detail.billing),
              },
              {
                label: 'Wallet balance',
                value: walletBalance
                  ? formatAdminBalanceAmount(
                      walletBalance.remaining,
                      walletBalance.featureId
                    )
                  : 'Unavailable',
              },
              {
                label: 'Granted',
                value: walletBalance
                  ? formatAdminBalanceAmount(
                      walletBalance.granted,
                      walletBalance.featureId
                    )
                  : 'Unavailable',
              },
              {
                label: 'Used',
                value: walletBalance
                  ? formatAdminBalanceAmount(
                      walletBalance.usage,
                      walletBalance.featureId
                    )
                  : 'Unavailable',
              },
              {
                label: 'Next reset',
                value: walletBalance
                  ? formatAdminDateTime(walletBalance.nextResetAt)
                  : 'Unavailable',
              },
            ]}
          />
        )}
      </AdminPanel>

      <AdminPanel
        description='Recurring Autumn plans currently attached to this user.'
        title={`Autumn subscriptions (${detail.autumnSubscriptions.length})`}
      >
        {shouldRedactAutumnSubscriptions ? (
          <AdminEmptyState
            description={getAutumnSubscriptionsUnavailableDescription(
              detail.billing
            )}
            title={getAutumnSubscriptionsUnavailableTitle(detail.billing)}
            tone='danger'
          />
        ) : detail.autumnSubscriptions.length === 0 ? (
          <AdminEmptyState
            description='This user does not currently have any Autumn subscriptions.'
            title='No Autumn subscriptions found'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Plan
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Status
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Quantity
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Started
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Current period end
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.autumnSubscriptions.map(subscription => (
                  <tr key={subscription.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div className='font-medium'>
                        {formatAdminText(
                          subscription.planName ?? subscription.planId
                        )}
                      </div>
                      <div className='mt-1 break-all font-mono text-xs text-[var(--admin-ink-soft)]'>
                        {subscription.planId}
                      </div>
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div className='capitalize'>
                        {formatAdminText(subscription.status)}
                      </div>
                      {subscription.addOn ? (
                        <div className='mt-1 text-xs text-[var(--admin-ink-soft)]'>
                          Add-on plan
                        </div>
                      ) : null}
                      {subscription.pastDue ? (
                        <div className='mt-1 text-xs text-[var(--admin-danger)]'>
                          Past due
                        </div>
                      ) : null}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {subscription.quantity}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(subscription.startedAt)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div>
                        {formatAdminDateTime(subscription.currentPeriodEnd)}
                      </div>
                      {subscription.trialEndsAt ? (
                        <div className='mt-1 text-xs text-[var(--admin-ink-soft)]'>
                          Trial ends{' '}
                          {formatAdminDateTime(subscription.trialEndsAt)}
                        </div>
                      ) : null}
                      {subscription.expiresAt ? (
                        <div className='mt-1 text-xs text-[var(--admin-ink-soft)]'>
                          Expires {formatAdminDateTime(subscription.expiresAt)}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <AdminJsonPreview
        description='Serialized Better Auth user document.'
        title='Auth user record'
        value={detail.authUser}
      />
    </div>
  );
}

interface AdminUserOrganizationSummary {
  createdAt: string | null;
  key: string;
  organizationId: string | null;
  organizationName: string | null;
}

/**
 * Derives a user-facing organization list from the membership snapshot.
 */
function getOrganizationsFromMemberships(
  memberships: AdminUserMembership[]
): AdminUserOrganizationSummary[] {
  const seenOrganizationIds = new Set<string>();
  const organizations: AdminUserOrganizationSummary[] = [];

  for (const membership of memberships) {
    if (membership.organizationId) {
      if (seenOrganizationIds.has(membership.organizationId)) {
        continue;
      }

      seenOrganizationIds.add(membership.organizationId);
    }

    organizations.push({
      key: membership.organizationId ?? membership.id,
      organizationId: membership.organizationId,
      organizationName: membership.organizationName,
      createdAt: membership.createdAt,
    });
  }

  return organizations;
}

function getAutumnSubscriptionsUnavailableTitle(
  billing: AdminUserBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return 'Autumn customer not found';
    case 'not-configured':
      return 'Billing integration unavailable';
    case 'error':
      return 'Autumn lookup failed';
    default:
      return 'Data unavailable';
  }
}

function getAutumnSubscriptionsUnavailableDescription(
  billing: AdminUserBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return `No Autumn customer matched ${billing.customerId}, so there are no subscriptions to show for this user.`;
    case 'not-configured':
      return 'Set AUTUMN_SECRET_KEY in packages/admin/.env to load Autumn subscriptions in the admin app.';
    case 'error':
      return 'The admin app hit an error while loading Autumn subscriptions. Check the billing credentials and server logs, then try again.';
    default:
      return DATA_UNAVAILABLE_DESCRIPTION;
  }
}

function getBillingStatusLabel(billing: AdminUserBillingSummary): string {
  switch (billing.status) {
    case 'ready':
      return 'Wallet found';
    case 'missing-wallet':
      return 'Customer has no wallet balance';
    case 'missing-customer':
      return 'No Autumn customer found';
    case 'not-configured':
      return 'Billing integration unavailable';
    case 'error':
      return 'Wallet lookup failed';
    default:
      return 'Unavailable';
  }
}
