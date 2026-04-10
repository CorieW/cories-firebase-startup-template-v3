/**
 * Shared admin brand lockup for the sidebar.
 */
import { Link } from '@tanstack/react-router';
import { SharedAppBrand } from '../../../common/src/client/SharedAppBrand';
import { ADMIN_HOME_ROUTE_PATH } from '../lib/route-paths';

const brandMarkClass =
  'border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]';

/**
 * Renders the shared product brand for the admin shell.
 */
export function AdminAppBrand() {
  return (
    <SharedAppBrand
      markClassName={brandMarkClass}
      renderRoot={({ children, className, style }) => (
        <Link className={className} style={style} to={ADMIN_HOME_ROUTE_PATH}>
          {children}
        </Link>
      )}
      subtitle='Admin'
    />
  );
}
