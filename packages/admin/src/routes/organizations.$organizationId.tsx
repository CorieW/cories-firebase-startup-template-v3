/**
 * Organization detail route for read-only admin inspection.
 */
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminJsonPreview,
  AdminKeyValueList,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadOrganizationDetailServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import {
  formatAdminBalanceAmount,
  formatAdminDateTime,
  formatAdminText,
} from '../lib/formatting';
import type {
  AdminOrganizationBillingSummary,
  AdminOrganizationDetail,
} from '../lib/server/organization-data';

const DATA_UNAVAILABLE_DESCRIPTION =
  'This data is unavailable right now. Check the admin billing configuration and customer state, then try again.';

export const Route = createFileRoute('/organizations/$organizationId')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async ({ params }) =>
    loadOrganizationDetailServer({
      data: {
        organizationId: params.organizationId,
      },
    }),
  component: OrganizationDetailPage,
});

/**
 * Renders the raw organization record and current member list.
 */
function OrganizationDetailPage() {
  const detail = Route.useLoaderData() as AdminOrganizationDetail | null;
  const { organizationId } = Route.useParams();

  if (!detail) {
    return (
      <div className='space-y-6 py-5'>
        <AdminPageHeader
          description='That organization id does not exist in the auth collection.'
          title='Organization not found'
        />
        <AdminEmptyState
          description='Check the organization id and try the directory search again.'
          title='No organization record was found'
          tone='danger'
        />
      </div>
    );
  }

  const organizationRecord =
    detail.organization && typeof detail.organization === 'object'
      ? detail.organization
      : {};
  const walletBalance = detail.billing.walletBalance;
  const shouldRedactBilling =
    detail.billing.status === 'error' ||
    detail.billing.status === 'not-configured' ||
    detail.billing.status === 'rate-limited';
  const shouldRedactAutumnSubscriptions =
    detail.billing.status === 'error' ||
    detail.billing.status === 'missing-customer' ||
    detail.billing.status === 'not-configured' ||
    detail.billing.status === 'rate-limited';

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review organization metadata, role distribution, member details, and Autumn billing state for a single tenant.'
        title={formatAdminText(
          typeof organizationRecord.name === 'string'
            ? organizationRecord.name
            : organizationId
        )}
      />

      <AdminPanel
        description='Core identifiers and top-level organization metadata.'
        title='Organization summary'
      >
        <AdminKeyValueList
          items={[
            {
              label: 'Organization ID',
              value: detail.id,
            },
            {
              label: 'Slug',
              value:
                typeof organizationRecord.slug === 'string'
                  ? organizationRecord.slug
                  : 'Unavailable',
            },
            {
              label: 'Created',
              value: formatAdminDateTime(
                typeof organizationRecord.createdAt === 'string'
                  ? organizationRecord.createdAt
                  : null
              ),
            },
          ]}
        />
      </AdminPanel>

      <AdminPanel
        description='Current members ordered by most recent membership creation.'
        title={`Members (${detail.members.length})`}
      >
        {detail.members.length === 0 ? (
          <AdminEmptyState
            description='No organization members were found for this record.'
            title='No members found'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Member
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    User ID
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Role
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
                {detail.members.map(member => (
                  <tr key={member.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div className='font-medium'>
                        {formatAdminText(member.name)}
                      </div>
                      <div className='mt-1 text-[var(--admin-ink-soft)]'>
                        {formatAdminText(member.email)}
                      </div>
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-mono text-xs'>
                      {formatAdminText(member.userId)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                      {formatAdminText(member.role)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(member.createdAt)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {member.userId ? (
                        <Link
                          className='font-semibold text-[var(--admin-primary)]'
                          params={{ userId: member.userId }}
                          to='/users/$userId'
                        >
                          Open profile
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
        description='Autumn wallet state for this organization. This remains read-only and only loads when billing credentials are configured.'
        title='Wallet balance'
      >
        {shouldRedactBilling ? (
          <AdminEmptyState
            description={getWalletUnavailableDescription(detail.billing)}
            title={getWalletUnavailableTitle(detail.billing)}
            tone='danger'
          />
        ) : (
          <div className='space-y-4'>
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
            {detail.billing.status !== 'ready' ? (
              <AdminEmptyState
                description={getWalletUnavailableDescription(detail.billing)}
                title={getWalletUnavailableTitle(detail.billing)}
                tone='danger'
              />
            ) : null}
          </div>
        )}
      </AdminPanel>

      <AdminPanel
        description='Recurring Autumn plans currently attached to this organization.'
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
            description='This organization does not currently have any Autumn subscriptions.'
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
        description='Serialized Better Auth organization document.'
        title='Organization record'
        value={detail.organization}
      />
    </div>
  );
}

function getAutumnSubscriptionsUnavailableTitle(
  billing: AdminOrganizationBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return 'Autumn customer not found';
    case 'not-configured':
      return 'Billing integration unavailable';
    case 'rate-limited':
      return 'Autumn rate limit reached';
    case 'error':
      return 'Autumn lookup failed';
    default:
      return 'Data unavailable';
  }
}

function getAutumnSubscriptionsUnavailableDescription(
  billing: AdminOrganizationBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return `No Autumn customer matched ${billing.customerId}, so there are no subscriptions to show for this organization.`;
    case 'not-configured':
      return 'Set AUTUMN_SECRET_KEY in packages/admin/.env to load Autumn subscriptions in the admin app.';
    case 'rate-limited':
      return 'The admin app reached Autumn request limits while loading subscriptions for this organization. Wait a moment, then try again.';
    case 'error':
      return 'The admin app hit an error while loading Autumn subscriptions. Check the billing credentials and server logs, then try again.';
    default:
      return DATA_UNAVAILABLE_DESCRIPTION;
  }
}

function getWalletUnavailableTitle(
  billing: AdminOrganizationBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return 'Autumn customer not found';
    case 'missing-wallet':
      return 'Wallet balance missing';
    case 'not-configured':
      return 'Billing integration unavailable';
    case 'rate-limited':
      return 'Autumn rate limit reached';
    case 'error':
      return 'Wallet lookup failed';
    default:
      return 'Data unavailable';
  }
}

function getWalletUnavailableDescription(
  billing: AdminOrganizationBillingSummary
): string {
  switch (billing.status) {
    case 'missing-customer':
      return `No Autumn customer matched ${billing.customerId}, so this organization does not currently have a wallet to display.`;
    case 'missing-wallet':
      return `Autumn found ${billing.customerId}, but there is no usd_credits wallet balance attached to this organization right now.`;
    case 'not-configured':
      return 'Set AUTUMN_SECRET_KEY in packages/admin/.env to load Autumn wallet data in the admin app.';
    case 'rate-limited':
      return 'The admin app reached Autumn request limits while loading this wallet. Wait a moment, then try again.';
    case 'error':
      return 'The admin app hit an error while loading this wallet. Check the billing credentials and server logs, then try again.';
    default:
      return DATA_UNAVAILABLE_DESCRIPTION;
  }
}

function getBillingStatusLabel(
  billing: AdminOrganizationBillingSummary
): string {
  switch (billing.status) {
    case 'ready':
      return 'Wallet found';
    case 'missing-wallet':
      return 'Customer has no wallet balance';
    case 'missing-customer':
      return 'No Autumn customer found';
    case 'not-configured':
      return 'Billing integration unavailable';
    case 'rate-limited':
      return 'Autumn rate limit reached';
    case 'error':
      return 'Wallet lookup failed';
    default:
      return 'Unavailable';
  }
}
