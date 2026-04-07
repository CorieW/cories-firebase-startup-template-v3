/**
 * Footer for the marketing page.
 */
import AppBrand from '../AppBrand';

const footerLinks = [
  { href: '#features', label: 'Features' },
  { href: '#story', label: 'Story' },
  { href: '#pricing', label: 'Pricing' },
];

/**
 * Renders the marketing footer and section shortcuts.
 */
export default function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className='pb-10 pt-4 sm:pb-12'>
      <div className='marketing-container'>
        <div className='rounded-[32px] border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-6 py-8 shadow-[var(--shadow-card)] backdrop-blur-sm sm:px-8 sm:py-10'>
          <div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
            <div className='space-y-3'>
              <AppBrand className='p-0' />
              <p className='m-0 max-w-md text-sm leading-6 text-[var(--ink-soft)]'>
                A stylish static marketing package designed to feel like the
                public face of the same product family as the dashboard.
              </p>
            </div>
            <div className='flex flex-wrap gap-4 text-sm font-semibold text-[var(--ink-soft)]'>
              {footerLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className='no-underline transition hover:text-[var(--ink)]'
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <p className='mb-0 mt-8 text-xs uppercase tracking-[0.1em] text-[var(--ink-soft)]'>
            © {year} Firebase Starter. Public-facing polish for the template.
          </p>
        </div>
      </div>
    </footer>
  );
}
