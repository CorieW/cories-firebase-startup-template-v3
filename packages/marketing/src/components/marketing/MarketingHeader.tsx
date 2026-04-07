/**
 * Top navigation for the marketing page.
 */
import { ArrowRight } from 'lucide-react';
import { getDashboardAuthUrl } from '../../lib/dashboard-links';
import { logMarketingEvent } from '../../lib/marketing-logging';
import AppBrand from '../AppBrand';
import ThemeToggle from '../ThemeToggle';
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
    <header className='sticky top-0 z-30 pt-5 sm:pt-6'>
      <div className='flex items-center justify-between gap-4 rounded-[28px] border border-[color-mix(in_srgb,var(--line)_64%,transparent)] bg-[var(--surface)] px-4 py-3 sm:px-5'>
        <AppBrand />
        <nav className='hidden items-center gap-6 lg:flex'>
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
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <Button asChild size='sm' variant='secondary'>
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
          <Button asChild size='sm'>
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
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
