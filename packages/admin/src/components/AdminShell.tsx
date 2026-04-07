/**
 * Shared authenticated shell for the admin console.
 */
import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  ADMIN_AUDIT_ROUTE_PATH,
  ADMIN_BILLING_ROUTE_PATH,
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_ORGANIZATIONS_ROUTE_PATH,
  ADMIN_SIGN_OUT_ROUTE_PATH,
  ADMIN_USERS_ROUTE_PATH,
} from '../lib/route-paths';
import { formatAdminText } from '../lib/formatting';
import {
  badgeClass,
  cardClass,
  pageContainerClass,
  secondaryButtonClass,
} from '../lib/ui';
import type { AdminSessionState } from '../lib/server/admin-directory';

interface AdminShellProps {
  adminSession: AdminSessionState;
  children: ReactNode;
}

const navItems = [
  {
    label: 'Overview',
    to: ADMIN_HOME_ROUTE_PATH,
  },
  {
    label: 'Users',
    to: ADMIN_USERS_ROUTE_PATH,
  },
  {
    label: 'Organizations',
    to: ADMIN_ORGANIZATIONS_ROUTE_PATH,
  },
  {
    label: 'Billing',
    to: ADMIN_BILLING_ROUTE_PATH,
  },
  {
    label: 'Audit',
    to: ADMIN_AUDIT_ROUTE_PATH,
  },
];

/**
 * Renders navigation and context around protected admin routes.
 */
export function AdminShell({ adminSession, children }: AdminShellProps) {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });

  return (
    <div className='min-h-screen'>
      <div
        className={`${pageContainerClass} grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]`}
      >
        <aside className='lg:sticky lg:top-5 lg:self-start'>
          <div className={`${cardClass} space-y-6 p-5`}>
            <div className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <span className={badgeClass}>Admin Console</span>
                <Link
                  className={secondaryButtonClass}
                  to={ADMIN_SIGN_OUT_ROUTE_PATH}
                >
                  Sign out
                </Link>
              </div>
              <div className='space-y-1'>
                <h1 className='m-0 text-2xl font-semibold tracking-[-0.03em]'>
                  Admin
                </h1>
                <p className='m-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
                  Read-only operations, billing diagnostics, and audit
                  visibility.
                </p>
              </div>
            </div>

            <dl className='space-y-3 text-sm'>
              <div>
                <dt className='text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  Signed in as
                </dt>
                <dd className='m-0 break-words font-medium'>
                  {formatAdminText(adminSession.email ?? adminSession.name)}
                </dd>
              </div>
              <div>
                <dt className='text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  Status
                </dt>
                <dd className='m-0 capitalize'>
                  {formatAdminText(adminSession.status)}
                </dd>
              </div>
            </dl>

            <nav aria-label='Admin sections'>
              <ul className='m-0 grid list-none gap-2 p-0'>
                {navItems.map(item => {
                  const isActive =
                    pathname === item.to ||
                    (item.to !== ADMIN_HOME_ROUTE_PATH &&
                      pathname.startsWith(`${item.to}/`));

                  return (
                    <li key={item.to}>
                      <Link
                        className={`block rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-[var(--admin-primary)] text-white shadow-[0_12px_28px_rgba(17,100,102,0.18)]'
                            : 'bg-[var(--admin-surface)] text-[var(--admin-ink)] hover:bg-[var(--admin-surface-strong)]'
                        }`}
                        to={item.to}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        <main className='min-w-0 pb-10'>{children}</main>
      </div>
    </div>
  );
}
