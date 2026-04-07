/**
 * Signed-out header variant.
 */
import { Link } from '@tanstack/react-router';
import { pageContainerClass } from '../../lib/ui';
import AppBrand from '../AppBrand';
import ThemeToggle from '../ThemeToggle';

const actionButtonBaseClass =
  'inline-flex items-center justify-center rounded-[9999px] border px-4 py-[0.58rem] text-sm font-semibold transition-[background-color,border-color,color] duration-150';

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
          <ThemeToggle />
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
        <ThemeToggle />
        <Link
          to='/sign-in/$'
          params={{ _splat: '' }}
          className={`${actionButtonBaseClass} border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] no-underline hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]`}
        >
          Sign in
        </Link>
        <Link
          to='/sign-up/$'
          params={{ _splat: '' }}
          className={`${actionButtonBaseClass} border-transparent bg-[var(--primary)] text-[var(--primary-ink)] no-underline hover:bg-[var(--primary-strong)]`}
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
