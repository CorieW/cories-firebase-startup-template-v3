/**
 * Shared authenticated shell for the admin console.
 */
import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AdminAppBrand } from './AdminAppBrand';
import {
  ADMIN_AUDIT_ROUTE_PATH,
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_ORGANIZATIONS_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PATH,
  ADMIN_USERS_ROUTE_PATH,
  getAdminAuthRouteParams,
  getAdminAuthRouteSearch,
} from '../lib/route-paths';
import { formatAdminText } from '../lib/formatting';
import {
  cardClass,
  pageContainerClass,
  secondaryButtonClass,
  widePageContainerClass,
} from '../lib/ui';
import type { AdminExternalToolLinks } from '../lib/server/env';
import type { AdminSessionState } from '../lib/server/admin-directory';

interface AdminShellProps {
  adminSession: AdminSessionState;
  children: ReactNode;
  externalToolLinks: AdminExternalToolLinks;
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
    label: 'Audit',
    to: ADMIN_AUDIT_ROUTE_PATH,
  },
];

const sidebarNavButtonClass =
  'block rounded-[18px] px-4 py-3 text-sm font-semibold bg-[var(--admin-surface)] text-[var(--admin-ink)] transition hover:bg-[var(--admin-surface-strong)]';

/**
 * Renders navigation and context around protected admin routes.
 */
export function AdminShell({
  adminSession,
  children,
  externalToolLinks,
}: AdminShellProps) {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const containerClass =
    pathname === ADMIN_HOME_ROUTE_PATH
      ? widePageContainerClass
      : pageContainerClass;

  return (
    <div className='min-h-screen'>
      <div
        className={`${containerClass} grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]`}
      >
        <aside className='lg:sticky lg:top-5 lg:self-start'>
          <div className={`${cardClass} flex flex-col gap-6 p-5`}>
            <AdminAppBrand />

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
                            ? 'border border-[var(--admin-line-strong)] bg-[var(--admin-surface-muted)] text-[var(--admin-ink)]'
                            : sidebarNavButtonClass
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

            {externalToolLinks.length > 0 ? (
              <div className='space-y-3'>
                <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  External Tools
                </p>
                <div className='space-y-3'>
                  {externalToolLinks.map(link => (
                    <a
                      key={`${link.label}-${link.href}`}
                      className={sidebarNavButtonClass}
                      href={link.href}
                      rel='noreferrer'
                      target='_blank'
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className='mt-auto space-y-4 border-t border-[var(--admin-line)] pt-4 text-sm'>
              <div>
                <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  Signed in as
                </p>
                <p className='mt-2 mb-0 break-words font-medium'>
                  {formatAdminText(adminSession.email ?? adminSession.name)}
                </p>
              </div>

              <Link
                className={`${secondaryButtonClass} w-full`}
                params={getAdminAuthRouteParams('sign-out')}
                search={getAdminAuthRouteSearch()}
                to={ADMIN_SIGN_IN_ROUTE_PATH}
              >
                Sign out
              </Link>
            </div>
          </div>
        </aside>

        <main className='min-w-0 pb-10'>{children}</main>
      </div>
    </div>
  );
}
