/**
 * Shared brand mark and text component.
 */
import { SharedAppBrand } from "@cories-firebase-startup-template-v3/common/client";
import { Link } from "@tanstack/react-router";

const brandMarkClass =
  "border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]";

interface AppBrandProps {
  className?: string;
  onClick?: () => void;
  to?: string;
}

/**
 * Shared brand link used in navigation surfaces.
 */
export default function AppBrand({
  className,
  onClick,
  to = "/",
}: AppBrandProps) {
  return (
    <SharedAppBrand
      className={className}
      markClassName={brandMarkClass}
      rootClassName="text-[var(--ink)]"
      renderRoot={({ children, className: resolvedClassName }) => (
        <Link to={to} className={resolvedClassName} onClick={onClick}>
          {children}
        </Link>
      )}
    />
  );
}
