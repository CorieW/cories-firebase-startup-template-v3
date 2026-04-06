/**
 * Shared brand mark and text component.
 */
import { Link } from '@tanstack/react-router';

const brandRootClass =
  'flex items-center gap-[0.7rem] rounded-xl p-[0.6rem] text-[var(--ink)] no-underline';

const brandMarkClass =
  'inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--primary)_82%,white_18%),color-mix(in_srgb,var(--primary)_36%,var(--accent)_64%))] text-[1.02rem] font-extrabold text-[var(--primary-ink)] shadow-[0_10px_22px_rgba(17,12,6,0.08)]';

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
  const resolvedClassName = className
    ? `${brandRootClass} ${className}`
    : brandRootClass;

  return (
    <Link to={to} className={resolvedClassName} onClick={onClick}>
      <span className={brandMarkClass}>C</span>
      <span>
        <strong className='block text-sm font-extrabold'>
          Firebase Starter
        </strong>
        <span className='block text-xs text-[var(--ink-soft)]'>
          Better Auth + Autumn
        </span>
      </span>
    </Link>
  );
}
