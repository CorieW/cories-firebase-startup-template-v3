/**
 * Social link data and helper functions.
 */
import {
  TEMPLATE_SOCIAL_LINKS,
  type TemplateSocialLinkConfig,
} from '@cories-firebase-startup-template-v3/common';

export interface SocialLinkConfig extends TemplateSocialLinkConfig {
  id: string;
}

/**
 * Returns the shared template footer social links with stable dashboard ids.
 */
export function getFooterSocialLinks(): SocialLinkConfig[] {
  return TEMPLATE_SOCIAL_LINKS.map((link, index) => ({
    id: `social-${index}-${link.label.toLowerCase().replace(/\s+/g, '-')}`,
    ...link,
  }));
}
