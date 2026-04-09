/**
 * Shared brand mark and text component.
 */
import { SharedAppBrand } from '@cories-firebase-startup-template-v3/common/client';
import { Link } from '@tanstack/react-router';

const brandMarkClass =
  'border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]';

interface AppBrandProps {
  /**
   * The route path to navigate to.
   * If not provided, no navigation will be performed.
   */
  to?: string | null;
}

/**
 * Shared brand link used in navigation surfaces.
 */
export default function AppBrand({ to }: AppBrandProps) {
  return (
    <SharedAppBrand
      markClassName={brandMarkClass}
      renderRoot={({ children, className, style }) => (
        <Link className={className} style={style} to={to ?? ''}>
          {children}
        </Link>
      )}
    />
  );
}
