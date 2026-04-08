/**
 * Shared admin brand lockup for the sidebar.
 */
import { SharedAppBrand } from "@cories-firebase-startup-template-v3/common/client";
import { Link } from "@tanstack/react-router";
import { ADMIN_HOME_ROUTE_PATH } from "../lib/route-paths";

const brandMarkClass =
  "border border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[var(--admin-primary-ink)]";

/**
 * Renders the shared product brand for the admin shell.
 */
export function AdminAppBrand() {
  return (
    <SharedAppBrand
      markClassName={brandMarkClass}
      rootClassName="text-[var(--admin-ink)]"
      renderRoot={({ children, className }) => (
        <Link className={className} to={ADMIN_HOME_ROUTE_PATH}>
          {children}
        </Link>
      )}
    />
  );
}
