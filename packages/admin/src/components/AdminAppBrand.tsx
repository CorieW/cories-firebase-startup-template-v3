/**
 * Shared admin brand lockup for the sidebar.
 */
import { SharedAppBrand } from '../../../common/src/client';
import { Link } from '@tanstack/react-router';
import { ADMIN_HOME_ROUTE_PATH } from '../lib/route-paths';

const brandRootClass =
  'flex items-center gap-[0.7rem] rounded-xl p-[0.6rem] text-[var(--admin-ink)] no-underline';

const brandMarkClass =
  'inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[1.02rem] font-extrabold text-[var(--admin-primary-ink)]';

/**
 * Renders the shared product brand for the admin shell.
 */
export function AdminAppBrand() {
  return (
    <SharedAppBrand
      markClassName={brandMarkClass}
      renderRoot={({ children, className }) => (
        <Link className={className} to={ADMIN_HOME_ROUTE_PATH}>
          {children}
        </Link>
      )}
      rootClassName={brandRootClass}
      subtitle='Better Auth + Autumn'
    />
  );
}
