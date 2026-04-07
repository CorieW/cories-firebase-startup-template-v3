/**
 * User detail route for read-only admin inspection.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminJsonPreview,
  AdminKeyValueList,
  AdminPageHeader,
  AdminPanel,
  AdminRedactedBlock,
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
} from '../lib/server/user-data';

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
  const walletBalance = detail.billing.walletBalance;
  const shouldRedactSensitiveSections = detail.billing.status !== 'ready';
  const redactionTitle = getSensitiveRedactionTitle(detail.billing);
  const redactionDescription = getSensitiveRedactionDescription(detail.billing);

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review Better Auth profile data, app-owned profile data, and organization memberships for a single user.'
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
        description='Personal Autumn wallet state for this user. This remains read-only and only loads when billing credentials are configured.'
        title='Wallet balance'
      >
        {shouldRedactSensitiveSections ? (
          <AdminRedactedBlock
            description={redactionDescription}
            title={redactionTitle}
          >
            <div className='space-y-4'>
              <AdminKeyValueList
                items={[
                  {
                    label: 'Autumn customer ID',
                    value: detail.billing.customerId,
                  },
                  {
                    label: 'Billing status',
                    tone: 'danger',
                    value: getBillingStatusLabel(detail.billing),
                  },
                  {
                    label: 'Wallet balance',
                    tone: 'danger',
                    value: 'Unavailable',
                  },
                  {
                    label: 'Granted',
                    tone: 'danger',
                    value: 'Unavailable',
                  },
                  {
                    label: 'Used',
                    tone: 'danger',
                    value: 'Unavailable',
                  },
                  {
                    label: 'Next reset',
                    tone: 'danger',
                    value: 'Unavailable',
                  },
                ]}
              />
              <AdminEmptyState
                description={getBillingStatusDescription(detail.billing)}
                title={getBillingStatusTitle(detail.billing)}
                tone='danger'
              />
            </div>
          </AdminRedactedBlock>
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
        description='Memberships recorded by the Better Auth organization plugin.'
        title={`Memberships (${detail.memberships.length})`}
      >
        {shouldRedactSensitiveSections ? (
          <AdminRedactedBlock
            description={redactionDescription}
            title={redactionTitle}
          >
            {detail.memberships.length === 0 ? (
              <AdminEmptyState
                description='This user is not currently attached to any organization memberships.'
                title='No memberships found'
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
                        Role
                      </th>
                      <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.memberships.map(membership => (
                      <tr key={membership.id}>
                        <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                          {formatAdminText(membership.organizationName)}
                        </td>
                        <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                          {formatAdminText(membership.role)}
                        </td>
                        <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                          {formatAdminDateTime(membership.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminRedactedBlock>
        ) : detail.memberships.length === 0 ? (
          <AdminEmptyState
            description='This user is not currently attached to any organization memberships.'
            title='No memberships found'
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
                    Role
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.memberships.map(membership => (
                  <tr key={membership.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminText(membership.organizationName)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                      {formatAdminText(membership.role)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(membership.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className='grid gap-6 xl:grid-cols-2'>
        <AdminJsonPreview
          description='Serialized Better Auth user document.'
          title='Auth user record'
          value={detail.authUser}
        />
        <AdminJsonPreview
          description='Serialized app-owned profile document from users/{id}.'
          title='App user record'
          value={detail.appUser}
        />
      </div>
    </div>
  );
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

function getSensitiveRedactionTitle(billing: AdminUserBillingSummary): string {
  switch (billing.status) {
    case 'not-configured':
      return 'Data unavailable';
    case 'error':
      return 'Data unavailable';
    case 'missing-customer':
      return 'Data unavailable';
    case 'missing-wallet':
      return 'Data unavailable';
    default:
      return 'Data unavailable';
  }
}

function getSensitiveRedactionDescription(
  billing: AdminUserBillingSummary
): string {
  switch (billing.status) {
    case 'not-configured':
      return 'Set AUTUMN_SECRET_KEY in packages/admin/.env before showing wallet balance and membership details on this page.';
    case 'error':
      return 'The admin app hit an error while loading sensitive user details. Check the server logs and billing credentials, then refresh.';
    case 'missing-customer':
      return `No Autumn customer matched ${billing.customerId}, so sensitive sections stay redacted until billing state is verified.`;
    case 'missing-wallet':
      return `Autumn returned ${billing.customerId} without a usd_credits wallet balance, so sensitive sections stay redacted until billing state is verified.`;
    default:
      return 'Sensitive data is available.';
  }
}

function getBillingStatusTitle(billing: AdminUserBillingSummary): string {
  switch (billing.status) {
    case 'missing-wallet':
      return 'Wallet balance not found';
    case 'missing-customer':
      return 'Billing customer not found';
    case 'not-configured':
      return 'Billing integration is not configured';
    case 'error':
      return 'Wallet lookup failed';
    default:
      return 'Wallet balance found';
  }
}

function getBillingStatusDescription(billing: AdminUserBillingSummary): string {
  switch (billing.status) {
    case 'missing-wallet':
      return `Autumn returned the customer ${billing.customerId}, but it did not include a usd_credits wallet balance.`;
    case 'missing-customer':
      return `No Autumn customer matched ${billing.customerId}. The user may not have opened billing yet, or their customer id may differ from the template default.`;
    case 'not-configured':
      return 'Set AUTUMN_SECRET_KEY in packages/admin/.env to load wallet balances in the admin app.';
    case 'error':
      return `The admin app could not load Autumn data for ${billing.customerId}. Check billing credentials and server logs, then try again.`;
    default:
      return 'Wallet balance found.';
  }
}
