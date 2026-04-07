/**
 * Admin home route with overview metrics.
 */
import { Link, createFileRoute } from '@tanstack/react-router';
import { AdminPageHeader } from '../components/AdminElements';
import { loadOverviewDataServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminNumber } from '../lib/formatting';
import {
  ADMIN_AUDIT_ROUTE_PATH,
  ADMIN_ORGANIZATIONS_ROUTE_PATH,
  ADMIN_USERS_ROUTE_PATH,
} from '../lib/route-paths';
import {
  badgeClass,
  dangerMutedTextClass,
  secondaryButtonClass,
  subtleCardClass,
} from '../lib/ui';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async () => loadOverviewDataServer(),
  component: AdminHomePage,
});

/**
 * Renders the admin overview as a spacious landing page for core admin tools.
 */
function AdminHomePage() {
  const overview = Route.useLoaderData();
  const primaryStats = [
    {
      description: 'Better Auth user records',
      label: 'Users',
      value: formatAdminNumber(overview.stats.users),
    },
    {
      description: 'Organization records',
      label: 'Orgs',
      value: formatAdminNumber(overview.stats.organizations),
    },
    {
      description: 'Active admins with console access',
      label: 'Admins',
      value: formatAdminNumber(overview.stats.activeAdmins),
    },
    {
      description: 'Stored admin audit entries',
      label: 'Audits',
      value: formatAdminNumber(overview.stats.audits),
    },
  ];
  const workspaceCards = [
    {
      description:
        'Search Better Auth profiles, membership history, and raw account data.',
      href: ADMIN_USERS_ROUTE_PATH,
      kicker: 'Directory',
      metric: `${formatAdminNumber(overview.stats.users)} users`,
      title: 'Open user directory',
    },
    {
      description:
        'Review organization records, tenant setup, and linked memberships.',
      href: ADMIN_ORGANIZATIONS_ROUTE_PATH,
      kicker: 'Tenants',
      metric: `${formatAdminNumber(overview.stats.organizations)} organizations`,
      title: 'Open organization directory',
    },
    {
      description:
        'Inspect stored admin actions and trace recent operational changes.',
      href: ADMIN_AUDIT_ROUTE_PATH,
      kicker: 'Traceability',
      metric: `${formatAdminNumber(overview.stats.audits)} audit entries`,
      title: 'Open audit timeline',
    },
  ];

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Quick stats for the main admin surfaces wired to auth, organizations, and audit logging.'
        title='Operations overview'
      />

      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]'>
        <article className={`${subtleCardClass} min-w-0 p-6 sm:p-7`}>
          <div className='space-y-6'>
            <div className='space-y-3'>
              <span className={badgeClass}>At a glance</span>
              <h2 className='m-0 max-w-4xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl'>
                The core admin signals stay visible, but the page no longer
                crams them into narrow cards.
              </h2>
              <p className='m-0 max-w-3xl text-sm leading-7 text-[var(--admin-ink-soft)] sm:text-base'>
                This overview uses larger panels and fewer columns so the main
                counts can breathe while still keeping the important tools close
                by.
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              {primaryStats.map(stat => (
                <div
                  key={stat.label}
                  className='min-w-0 rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-bg)]/35 p-4'
                >
                  <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                    {stat.label}
                  </p>
                  <p className='mt-3 mb-1 break-words text-4xl font-semibold tracking-[-0.04em]'>
                    {stat.value}
                  </p>
                  <p className='m-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className={`${subtleCardClass} min-w-0 p-6 sm:p-7`}>
          <div className='space-y-3'>
            <span className={badgeClass}>Readiness</span>
            <h2 className='m-0 text-2xl font-semibold tracking-[-0.03em]'>
              System state
            </h2>
            <p className='m-0 text-sm leading-7 text-[var(--admin-ink-soft)]'>
              Billing availability and audit visibility stay pinned here so
              operational checks are always one glance away.
            </p>
          </div>

          <div className='mt-5 grid gap-3'>
            <div className='min-w-0 rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-bg)]/35 p-4'>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Billing
              </p>
              <p
                className={`mt-3 mb-1 break-words text-2xl font-semibold tracking-[-0.03em] ${
                  overview.billingConfigured ? '' : 'text-[var(--admin-danger)]'
                }`}
              >
                {overview.billingConfigured ? 'Configured' : 'Unavailable'}
              </p>
              <p
                className={`m-0 text-sm leading-6 ${
                  overview.billingConfigured
                    ? 'text-[var(--admin-ink-soft)]'
                    : dangerMutedTextClass
                }`}
              >
                Autumn secret detected:{' '}
                {overview.billingConfigured ? 'yes' : 'no'}
              </p>
            </div>

            <div className='min-w-0 rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-bg)]/35 p-4'>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Access
              </p>
              <p className='mt-3 mb-1 break-words text-2xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(overview.stats.activeAdmins)} active
              </p>
              <p className='m-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
                {formatAdminNumber(overview.stats.disabledAdmins)} disabled
                admin accounts remain outside the active rotation.
              </p>
            </div>

            <div className='min-w-0 rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-bg)]/35 p-4'>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Audit log
              </p>
              <p className='mt-3 mb-1 break-words text-2xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(overview.stats.audits)}
              </p>
              <p className='m-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
                Stored admin audit entries ready for trace review.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className='grid gap-4 lg:grid-cols-2'>
        {workspaceCards.map(card => (
          <article key={card.href} className={`${subtleCardClass} min-w-0 p-6`}>
            <div className='space-y-3'>
              <span className={badgeClass}>{card.kicker}</span>
              <div className='space-y-2'>
                <h2 className='m-0 text-xl font-semibold tracking-[-0.02em]'>
                  {card.title}
                </h2>
                <p className='m-0 text-sm leading-7 text-[var(--admin-ink-soft)]'>
                  {card.description}
                </p>
              </div>
            </div>

            <div className='mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <p className='m-0 break-words text-lg font-semibold tracking-[-0.02em]'>
                {card.metric}
              </p>
              <Link className={secondaryButtonClass} to={card.href}>
                Open
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
