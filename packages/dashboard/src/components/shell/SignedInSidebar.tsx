/**
 * Authenticated navigation and sidebar shell.
 */
import { useRouterState } from '@tanstack/react-router';
import { ChevronDown, LifeBuoy, WalletCards, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthSession } from '../../lib/auth-client';
import { isBillingRoutePath, isSupportRoutePath } from '../../lib/route-paths';
import { normalizePathname } from '../../lib/route-guards';
import AppBrand from '../AppBrand';
import ThemeToggle from '../ThemeToggle';
import { Skeleton } from '../ui/skeleton';
import SidebarAccountPanel from './SidebarAccountPanel';
import SidebarNavLink from './SidebarNavLink';
import {
  billingNavItems,
  primaryNavItems,
  supportNavItems,
  supportParentNavItem,
  sidebarNavItemActiveClass,
  sidebarNavItemBaseClass,
  sidebarNavItemInactiveClass,
} from './signed-in-sidebar.constants';

/**
 * Signed-in navigation sidebar with grouped billing links and mobile drawer controls.
 */
export default function SignedInSidebar({
  isSessionPending = false,
}: {
  isSessionPending?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const { user } = useAuthSession();
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const normalizedPathname = normalizePathname(pathname);
  const onBillingPath = isBillingRoutePath(normalizedPathname);
  const onSupportPath = isSupportRoutePath(normalizedPathname);
  const SupportIcon = LifeBuoy;
  const BillingIcon = WalletCards;
  const userEmail = user?.email ?? 'No email available';
  const accountBadge = (
    user?.name?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    'A'
  ).toUpperCase();

  useEffect(() => {
    if (onBillingPath) {
      setIsBillingOpen(true);
    }
  }, [onBillingPath]);

  useEffect(() => {
    if (onSupportPath) {
      setIsSupportOpen(true);
    }
  }, [onSupportPath]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      {!isMenuOpen ? (
        <button
          type='button'
          className='fixed top-3 left-3 z-[70] inline-flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] min-[980px]:hidden'
          onClick={() => setIsMenuOpen(true)}
          aria-label='Open navigation menu'
        >
          <span aria-hidden='true'>☰</span>
        </button>
      ) : null}

      <div className='fixed top-4 right-4 z-40 hidden min-[980px]:block'>
        <ThemeToggle />
      </div>

      {isMenuOpen ? (
        <button
          type='button'
          className='fixed inset-0 z-50 bg-[var(--surface-soft)] min-[980px]:hidden'
          aria-label='Close navigation menu'
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[min(270px,88vw)] border-r border-[var(--sidebar-line)] bg-[var(--sidebar)] transition-transform duration-200 ease-out max-[500px]:w-screen max-[500px]:max-w-screen min-[980px]:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col p-4'>
          <div className='flex items-start justify-between'>
            <AppBrand to='/' />
            <div className='mt-2 flex items-center gap-2 min-[980px]:hidden'>
              <ThemeToggle />
              <button
                type='button'
                onClick={closeMenu}
                aria-label='Close navigation menu'
                className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--line)] text-[var(--ink-soft)] transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
              >
                <X aria-hidden='true' className='h-4 w-4' />
              </button>
            </div>
          </div>

          <nav className='mt-[1.15rem] flex flex-col gap-[0.3rem]'>
            {primaryNavItems.map(item => (
              <SidebarNavLink
                key={item.to}
                isActive={normalizedPathname === normalizePathname(item.to)}
                item={item}
                onClick={closeMenu}
              />
            ))}

            <div className='rounded-[12px] border border-transparent'>
              <button
                type='button'
                className={`${sidebarNavItemBaseClass} h-10 w-full text-left ${
                  onSupportPath
                    ? sidebarNavItemActiveClass
                    : sidebarNavItemInactiveClass
                }`}
                onClick={() => setIsSupportOpen(current => !current)}
                aria-expanded={isSupportOpen}
                aria-controls='support-sidebar-links'
                disabled={isSessionPending}
              >
                <SupportIcon aria-hidden='true' className='h-4 w-4 shrink-0' />
                <span className='flex-1 truncate whitespace-nowrap'>
                  {supportParentNavItem.label}
                </span>
                <ChevronDown
                  aria-hidden='true'
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isSupportOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSupportOpen ? (
                <div
                  id='support-sidebar-links'
                  className='mt-1 grid gap-1 pl-3'
                >
                  {isSessionPending
                    ? Array.from({ length: supportNavItems.length }).map(
                        (_, index) => (
                          <Skeleton
                            key={index}
                            className='h-9 rounded-[10px]'
                          />
                        )
                      )
                    : supportNavItems.map(item => (
                        <SidebarNavLink
                          key={item.to}
                          isActive={
                            normalizedPathname === normalizePathname(item.to)
                          }
                          item={item}
                          nested
                          onClick={closeMenu}
                        />
                      ))}
                </div>
              ) : null}
            </div>

            <div className='rounded-[12px] border border-transparent'>
              <button
                type='button'
                className={`${sidebarNavItemBaseClass} h-10 w-full text-left ${
                  onBillingPath
                    ? sidebarNavItemActiveClass
                    : sidebarNavItemInactiveClass
                }`}
                onClick={() => setIsBillingOpen(current => !current)}
                aria-expanded={isBillingOpen}
                aria-controls='billing-sidebar-links'
                disabled={isSessionPending}
              >
                <BillingIcon aria-hidden='true' className='h-4 w-4 shrink-0' />
                <span className='flex-1 truncate whitespace-nowrap'>
                  Billing
                </span>
                <ChevronDown
                  aria-hidden='true'
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isBillingOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isBillingOpen ? (
                <div
                  id='billing-sidebar-links'
                  className='mt-1 grid gap-1 pl-3'
                >
                  {isSessionPending
                    ? Array.from({ length: billingNavItems.length }).map(
                        (_, index) => (
                          <Skeleton
                            key={index}
                            className='h-9 rounded-[10px]'
                          />
                        )
                      )
                    : billingNavItems.map(item => (
                        <SidebarNavLink
                          key={item.to}
                          isActive={
                            normalizedPathname === normalizePathname(item.to)
                          }
                          item={item}
                          nested
                          onClick={closeMenu}
                        />
                      ))}
                </div>
              ) : null}
            </div>
          </nav>

          <SidebarAccountPanel
            accountBadge={accountBadge}
            isSessionPending={isSessionPending}
            userEmail={userEmail}
          />
        </div>
      </aside>
    </>
  );
}
