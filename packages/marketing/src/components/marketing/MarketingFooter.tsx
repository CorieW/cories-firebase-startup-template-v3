/**
 * Footer for the marketing page.
 */
import { TEMPLATE_SOCIAL_LINKS } from '@cories-firebase-startup-template-v3/common';
import { SharedSiteFooter } from '@cories-firebase-startup-template-v3/common/client';

/**
 * Renders the shared site footer with marketing page spacing and social links.
 */
export default function MarketingFooter() {
  return (
    <SharedSiteFooter
      className='pb-10 sm:pb-12'
      containerClassName='marketing-container'
      socialLinks={TEMPLATE_SOCIAL_LINKS.map((link, index) => ({
        id: `social-${index}-${link.label.toLowerCase().replace(/\s+/g, '-')}`,
        ...link,
      }))}
    />
  );
}
