/**
 * Tests shared social link helpers.
 */
import { TEMPLATE_SOCIAL_LINKS } from '@cories-firebase-startup-template-v3/common';
import { describe, expect, it } from 'vitest';
import { getFooterSocialLinks } from '@/lib/social-links';

describe('getFooterSocialLinks', () => {
  it('maps the shared template social links into dashboard footer links', () => {
    expect(getFooterSocialLinks()).toEqual(
      TEMPLATE_SOCIAL_LINKS.map((link, index) => ({
        id: `social-${index}-${link.label.toLowerCase().replace(/\s+/g, '-')}`,
        ...link,
      }))
    );
  });
});
