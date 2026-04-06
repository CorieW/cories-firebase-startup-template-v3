/**
 * Site footer shell component.
 */
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
        <div className='inline-flex w-fit max-w-full flex-wrap items-center justify-center gap-[0.8rem] rounded-2xl border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent_8%)] px-4 py-3 shadow-[0_10px_22px_rgba(17,12,6,0.06)] backdrop-blur-[10px] min-[501px]:rounded-[999px]'>
          <p className='m-0 text-center text-sm text-[var(--ink-soft)]'>
            &copy; {year} Your name here. All rights reserved.
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
