/**
 * Extracted signed-in sidebar account and organization switcher section.
 */
import { OrganizationSwitcher, UserButton } from '@daveyplate/better-auth-ui';
import { panelMutedClass } from '../../lib/ui';
import ThemeToggle from '../ThemeToggle';
import { Skeleton } from '../ui/skeleton';
import { sidebarDropdownClassNames } from './signed-in-sidebar.constants';

export default function SidebarAccountPanel({
  accountBadge,
  isSessionPending,
  userEmail,
}: {
  accountBadge: string;
  isSessionPending: boolean;
  userEmail: string;
}) {
  return (
    <div className='mt-auto grid gap-3'>
      <div className='min-[980px]:hidden'>
        <ThemeToggle />
      </div>

      {isSessionPending ? (
        <>
          <div className={`${panelMutedClass} p-2`} aria-hidden='true'>
            <Skeleton className='h-10 w-full rounded-[14px]' />
          </div>
          <div className={`${panelMutedClass} p-2`} aria-hidden='true'>
            <div className='flex items-center gap-2'>
              <div className='min-w-0 flex-[1_1_0%]'>
                <Skeleton className='mb-2 h-3 w-14 rounded-full' />
                <Skeleton className='h-3 w-28 rounded-full' />
              </div>
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`${panelMutedClass} p-2`}>
            <OrganizationSwitcher
              align='end'
              className='w-full justify-between overflow-hidden text-left transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface)]'
              side='right'
              sideOffset={10}
              classNames={sidebarDropdownClassNames}
            />
          </div>
          <UserButton
            align='end'
            side='right'
            sideOffset={10}
            classNames={sidebarDropdownClassNames}
            trigger={
              <button
                type='button'
                className={`${panelMutedClass} flex w-full items-center gap-2 overflow-hidden p-2 text-left transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface)]`}
              >
                <div className='min-w-0 flex-[1_1_0%] overflow-hidden'>
                  <p className='m-0 text-xs font-semibold text-[var(--ink-soft)]'>
                    Account
                  </p>
                  <p className='m-0 max-w-full truncate text-xs text-[var(--ink)]'>
                    {userEmail}
                  </p>
                </div>
                <div className='ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)]'>
                  {accountBadge}
                </div>
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
