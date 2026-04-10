/**
 * Site footer shell component.
 */
import { SharedSiteFooter } from '@cories-firebase-startup-template-v3/common/client';
import type { SocialLinkConfig } from '../lib/social-links';
import { pageContainerClass } from '../lib/ui';

interface FooterProps {
  socialLinks: SocialLinkConfig[];
}

/**
 * Renders the shared site footer within the dashboard page container.
 */
export default function Footer({ socialLinks }: FooterProps) {
  return (
    <SharedSiteFooter
      containerClassName={pageContainerClass}
      socialLinks={socialLinks}
    />
  );
}
