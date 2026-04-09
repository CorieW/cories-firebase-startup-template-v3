/**
 * Site footer shell component.
 */
import { TEMPLATE_COPY } from '@cories-firebase-startup-template-v3/common';
import type { SocialLinkConfig } from '../lib/social-links';
import { pageContainerClass } from '../lib/ui';
import SocialLink from './SocialLink';

interface FooterProps {
  socialLinks: SocialLinkConfig[];
}

export default function Footer({ socialLinks }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className='mt-auto px-0 pb-6 pt-4'>
      <div className={`${pageContainerClass} flex justify-center`}>
        <div className='inline-flex w-fit max-w-full flex-wrap items-center justify-center gap-[0.8rem] rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 min-[501px]:rounded-[999px]'>
          <p className='m-0 text-center text-sm text-[var(--ink-soft)]'>
            &copy; {year} {TEMPLATE_COPY.dashboardFooterOwnerName}.{' '}
            {TEMPLATE_COPY.legalSuffix}
          </p>
          <div className='inline-flex items-center gap-[0.45rem]'>
            {socialLinks.map(social => (
              <SocialLink
                key={social.id}
                href={social.url}
                label={social.label}
                icon={social.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
