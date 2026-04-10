/**
 * Shared site footer used across frontend app packages.
 */
import type { ReactNode } from 'react';
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { TEMPLATE_COPY } from '../global.js';

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function hasContent(value: ReactNode | undefined): boolean {
  return (
    value !== null && value !== undefined && value !== false && value !== ''
  );
}

export interface SharedSiteFooterSocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

interface SharedSiteFooterProps {
  className?: string;
  containerClassName?: string;
  legalSuffix?: ReactNode;
  ownerName?: ReactNode;
  socialLinks?: SharedSiteFooterSocialLink[];
}

/**
 * Renders the shared footer shell with optional social links.
 */
export function SharedSiteFooter({
  className,
  containerClassName,
  legalSuffix = TEMPLATE_COPY.legalSuffix,
  ownerName = TEMPLATE_COPY.dashboardFooterOwnerName,
  socialLinks = [],
}: SharedSiteFooterProps) {
  const year = new Date().getFullYear();
  const shouldRenderOwnerName = hasContent(ownerName);
  const shouldRenderLegalSuffix = hasContent(legalSuffix);

  return (
    <footer className={joinClassNames('mt-auto px-0 pb-6 pt-4', className)}>
      <div
        className={joinClassNames(containerClassName, 'flex justify-center')}
      >
        <div className='inline-flex w-fit max-w-full flex-wrap items-center justify-center gap-[0.8rem] rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 min-[501px]:rounded-[999px]'>
          {(shouldRenderOwnerName || shouldRenderLegalSuffix) && (
            <p className='m-0 text-center text-sm text-[var(--ink-soft)]'>
              &copy; {year}
              {shouldRenderOwnerName ? <> {ownerName}.</> : null}
              {shouldRenderLegalSuffix ? <> {legalSuffix}</> : null}
            </p>
          )}
          {socialLinks.length > 0 && (
            <div className='inline-flex items-center gap-[0.45rem]'>
              {socialLinks.map(social => (
                <SharedSiteFooterSocialLinkButton key={social.id} {...social} />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

/**
 * Renders an individual social link pill for the shared footer.
 */
export function SharedSiteFooterSocialLinkButton({
  icon,
  label,
  url,
}: SharedSiteFooterSocialLink) {
  return (
    <a
      href={url}
      target='_blank'
      rel='noreferrer'
      aria-label={label}
      title={label}
      className='inline-flex items-center gap-[0.35rem] rounded-[999px] border border-[var(--line)] bg-[var(--surface-soft)] px-[0.6rem] py-[0.35rem] text-[0.8rem] font-bold text-[var(--ink-soft)] no-underline transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
    >
      <span
        className='inline-flex h-[0.95rem] w-[0.95rem] items-center justify-center [&_svg]:h-full [&_svg]:w-full'
        aria-hidden='true'
      >
        <SharedSiteFooterSocialIcon icon={icon} />
      </span>
      <span className='hidden sm:inline'>{label}</span>
    </a>
  );
}

/**
 * Resolves the correct icon for a footer social link.
 */
function SharedSiteFooterSocialIcon({ icon }: { icon?: string }) {
  const normalized = icon?.toLowerCase();

  if (normalized === 'github') return <Github />;
  if (normalized === 'linkedin') return <Linkedin />;
  if (normalized === 'youtube') return <Youtube />;
  if (normalized === 'instagram') return <Instagram />;
  if (normalized === 'facebook') return <Facebook />;
  if (normalized === 'x' || normalized === 'twitter') {
    return (
      <svg viewBox='0 0 16 16' fill='currentColor'>
        <path d='M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z' />
      </svg>
    );
  }

  return <Globe />;
}
