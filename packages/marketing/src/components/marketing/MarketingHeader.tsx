/**
 * Top navigation for the marketing page.
 */
import { ArrowRight } from 'lucide-react';
import { getDashboardAuthUrl } from '../../lib/dashboard-links';
import { logMarketingEvent } from '../../lib/marketing-logging';
import AppBrand from '../AppBrand';
import { Button } from '../ui/button';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#story', label: 'Story' },
  { href: '#pricing', label: 'Pricing' },
];

/**
 * Renders the sticky marketing header and primary navigation.
 */
export default function MarketingHeader() {
  const signInUrl = getDashboardAuthUrl('signIn');
  const signUpUrl = getDashboardAuthUrl('signUp');

  return (
    <header className='sticky top-0 z-30 pt-3 sm:pt-4'>
      <div className='marketing-container'>
        <div className='flex items-center justify-between gap-3 rounded-[26px] border border-[color-mix(in_srgb,var(--line)_64%,transparent)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-xl sm:px-4 sm:py-2.5 lg:px-5'>
          <AppBrand size='compact' />
          <nav className='hidden items-center gap-5 lg:flex'>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className='text-sm font-semibold text-[var(--ink-soft)] no-underline transition hover:text-[var(--ink)]'
                onClick={() =>
                  logMarketingEvent('navClick', {
                    destination: link.href,
                  })
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className='flex items-center gap-1.5 sm:gap-2'>
            <Button
              asChild
              size='sm'
              variant='secondary'
              className='h-8 px-3 text-[0.72rem] sm:h-9 sm:px-3.5 sm:text-xs'
            >
              <a
                href={signInUrl}
                onClick={() =>
                  logMarketingEvent('ctaClick', {
                    placement: 'header-sign-in',
                    destination: signInUrl,
                  })
                }
              >
                Log in
              </a>
            </Button>
            <Button
              asChild
              size='sm'
              className='h-8 px-3 text-[0.72rem] sm:h-9 sm:px-3.5 sm:text-xs'
            >
              <a
                href={signUpUrl}
                onClick={() =>
                  logMarketingEvent('ctaClick', {
                    placement: 'header-sign-up',
                    destination: signUpUrl,
                  })
                }
              >
                Sign up
                <ArrowRight
                  className='h-3.5 w-3.5 sm:h-4 sm:w-4'
                  aria-hidden='true'
                />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
