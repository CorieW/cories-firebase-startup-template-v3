/**
 * Shared brand mark and text component.
 */
import { SharedAppBrand } from '../../../common/src/client';
import { Link } from '@tanstack/react-router';

const brandRootClass =
  'flex items-center gap-[0.7rem] rounded-xl p-[0.6rem] text-[var(--ink)] no-underline';

const brandMarkClass =
  'inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-[var(--primary)] bg-[var(--primary)] text-[1.02rem] font-extrabold text-[var(--primary-ink)]';

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
  to = '/',
}: AppBrandProps) {
  return (
    <SharedAppBrand
      className={className}
      markClassName={brandMarkClass}
      renderRoot={({ children, className: resolvedClassName }) => (
        <Link to={to} className={resolvedClassName} onClick={onClick}>
          {children}
        </Link>
      )}
      rootClassName={brandRootClass}
      subtitle='Better Auth + Autumn'
    />
  );
}
