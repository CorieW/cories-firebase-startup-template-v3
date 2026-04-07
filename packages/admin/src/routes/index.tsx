/**
 * Admin home route with overview metrics and recent audit activity.
 */
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadOverviewDataServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminNumber } from '../lib/formatting';
import {
  ADMIN_AUDIT_ROUTE_PATH,
  ADMIN_BILLING_ROUTE_PATH,
  ADMIN_ORGANIZATIONS_ROUTE_PATH,
  ADMIN_USERS_ROUTE_PATH,
} from '../lib/route-paths';
import { badgeClass, subtleCardClass } from '../lib/ui';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async () => loadOverviewDataServer(),
  component: AdminHomePage,
});

/**
 * Renders the first real admin overview page.
 */
function AdminHomePage() {
  const overview = Route.useLoaderData();
  const quickLinks = [
    {
      description: 'Search auth users and inspect their memberships.',
      title: 'Users',
      to: ADMIN_USERS_ROUTE_PATH,
    },
    {
      description: 'Review organizations, ownership, and member roles.',
      title: 'Organizations',
      to: ADMIN_ORGANIZATIONS_ROUTE_PATH,
    },
    {
      description: 'Inspect Autumn customer data and recent admin actions.',
      title: 'Billing & Audit',
      to: ADMIN_BILLING_ROUTE_PATH,
    },
  ];

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Monitor the shape of your app, verify admin access, and jump into the read-only tools that are already wired to Firestore and billing.'
        title='Operations overview'
      />

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <article className={`${subtleCardClass} p-5`}>
          <span className={badgeClass}>Users</span>
          <p className='mt-4 mb-1 text-3xl font-semibold tracking-[-0.03em]'>
            {formatAdminNumber(overview.stats.users)}
          </p>
          <p className='m-0 text-sm text-[var(--admin-ink-soft)]'>
            Better Auth user records
          </p>
        </article>
        <article className={`${subtleCardClass} p-5`}>
          <span className={badgeClass}>Organizations</span>
          <p className='mt-4 mb-1 text-3xl font-semibold tracking-[-0.03em]'>
            {formatAdminNumber(overview.stats.organizations)}
          </p>
          <p className='m-0 text-sm text-[var(--admin-ink-soft)]'>
            Organization records
          </p>
        </article>
        <article className={`${subtleCardClass} p-5`}>
          <span className={badgeClass}>Active Admins</span>
          <p className='mt-4 mb-1 text-3xl font-semibold tracking-[-0.03em]'>
            {formatAdminNumber(overview.stats.activeAdmins)}
          </p>
          <p className='m-0 text-sm text-[var(--admin-ink-soft)]'>
            Allowlisted admins with active access
          </p>
        </article>
        <article className={`${subtleCardClass} p-5`}>
          <span className={badgeClass}>Billing</span>
          <p
            className={`mt-4 mb-1 text-2xl font-semibold tracking-[-0.03em] ${
              overview.billingConfigured ? '' : 'text-[var(--admin-danger)]'
            }`}
          >
            {overview.billingConfigured ? 'Configured' : 'Unavailable'}
          </p>
          <p
            className={`m-0 text-sm ${
              overview.billingConfigured
                ? 'text-[var(--admin-ink-soft)]'
                : 'text-[color-mix(in_srgb,var(--admin-danger)_82%,black_18%)]'
            }`}
          >
            Autumn secret detected: {overview.billingConfigured ? 'yes' : 'no'}
          </p>
        </article>
      </section>

      <section className='grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'>
        <AdminPanel
          description='Use these routes to inspect customers, organizations, and account state without changing production data.'
          title='Quick actions'
        >
          <div className='grid gap-4 md:grid-cols-3'>
            {quickLinks.map(link => (
              <Link
                key={link.to}
                className={`${subtleCardClass} block p-5 no-underline transition hover:border-[var(--admin-line-strong)] hover:bg-[var(--admin-surface-strong)]`}
                to={link.to}
              >
                <h2 className='m-0 text-lg font-semibold tracking-[-0.02em]'>
                  {link.title}
                </h2>
                <p className='mt-2 mb-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel
          description='Current allowlist health from Firestore.'
          title='Admin access'
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className={`${subtleCardClass} p-4`}>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Active
              </p>
              <p className='mt-3 mb-0 text-3xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(overview.stats.activeAdmins)}
              </p>
            </div>
            <div className={`${subtleCardClass} p-4`}>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Disabled
              </p>
              <p className='mt-3 mb-0 text-3xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(overview.stats.disabledAdmins)}
              </p>
            </div>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        description='The latest recorded admin reads and access denials.'
        title='Recent audit activity'
      >
        {overview.recentAuditLogs.length === 0 ? (
          <AdminEmptyState
            actionHref={ADMIN_AUDIT_ROUTE_PATH}
            actionLabel='Open audit view'
            description='No admin audit entries have been recorded yet. Once admin routes are used, activity will show up here.'
            title='No audit activity yet'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    When
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Action
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Actor
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Resource
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {overview.recentAuditLogs.map(entry => (
                  <tr key={entry.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(entry.occurredAt)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-medium'>
                      {entry.action}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {entry.actorUid}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {entry.resourceType}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                      {entry.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
