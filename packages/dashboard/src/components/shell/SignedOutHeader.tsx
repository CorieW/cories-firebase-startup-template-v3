/**
 * Signed-out header variant.
 */
import { Link } from '@tanstack/react-router';
import { pageContainerClass } from '../../lib/ui';
import AppBrand from '../AppBrand';
import ThemeToggle from '../ThemeToggle';

const actionButtonBaseClass =
  'inline-flex items-center justify-center rounded-[9999px] border px-4 py-[0.58rem] text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-150';

interface SignedOutHeaderProps {
  isAuthRoute: boolean;
}

/**
 * Header content shown only when users are signed out.
 */
export default function SignedOutHeader({ isAuthRoute }: SignedOutHeaderProps) {
  if (isAuthRoute) {
    return (
      <>
        <div className='fixed left-4 top-4 z-40'>
          <AppBrand />
        </div>
        <div className='fixed right-4 top-4 z-40'>
          <ThemeToggle fullWidth={false} />
        </div>
      </>
    );
  }

  return (
    <header
      className={`${pageContainerClass} flex items-center justify-between py-4`}
    >
      <AppBrand />
      <div className='flex items-center gap-2'>
        <ThemeToggle fullWidth={false} />
        <Link
          to='/sign-in/$'
          params={{ _splat: '' }}
          className={`${actionButtonBaseClass} border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] text-[var(--ink)] no-underline hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--line-strong))] hover:bg-[color-mix(in_srgb,var(--primary)_5%,var(--surface-soft))]`}
        >
          Sign in
        </Link>
        <Link
          to='/sign-up/$'
          params={{ _splat: '' }}
          className={`${actionButtonBaseClass} border-transparent bg-[var(--primary)] text-[var(--primary-ink)] no-underline hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)]`}
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
