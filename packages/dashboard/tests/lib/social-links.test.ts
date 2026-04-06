/**
 * Tests shared social link helpers.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { getFooterSocialLinks } from '@/lib/social-links';

const originalSocialLinksValue = process.env.SOCIAL_LINKS;

describe('getFooterSocialLinks', () => {
  afterEach(() => {
    if (originalSocialLinksValue === undefined) {
      delete process.env.SOCIAL_LINKS;
      return;
    }

    process.env.SOCIAL_LINKS = originalSocialLinksValue;
  });

  it('returns an empty list when SOCIAL_LINKS is missing', () => {
    delete process.env.SOCIAL_LINKS;

    expect(getFooterSocialLinks()).toEqual([]);
  });

  it('normalizes valid SOCIAL_LINKS entries', () => {
    process.env.SOCIAL_LINKS = JSON.stringify([
      {
        label: 'GitHub',
        url: 'https://github.com/your-org',
        icon: 'GITHUB',
      },
      {
        label: 'Docs',
        url: 'https://example.com/docs',
      },
    ]);

    expect(getFooterSocialLinks()).toEqual([
      {
        id: 'social-0-github',
        label: 'GitHub',
        url: 'https://github.com/your-org',
        icon: 'github',
      },
      {
        id: 'social-1-docs',
        label: 'Docs',
        url: 'https://example.com/docs',
      },
    ]);
  });

  it('skips invalid entries from SOCIAL_LINKS', () => {
    process.env.SOCIAL_LINKS = JSON.stringify([
      {
        label: '',
        url: 'https://example.com/empty-label',
      },
      {
        label: 'No URL',
        url: '',
      },
      {
        label: 'Valid',
        url: 'https://example.com',
      },
      null,
    ]);

    expect(getFooterSocialLinks()).toEqual([
      {
        id: 'social-2-valid',
        label: 'Valid',
        url: 'https://example.com',
      },
    ]);
  });

  it('returns an empty list for invalid JSON or wrong shape', () => {
    process.env.SOCIAL_LINKS = '{not-json';
    expect(getFooterSocialLinks()).toEqual([]);

    process.env.SOCIAL_LINKS = JSON.stringify({ label: 'X' });
    expect(getFooterSocialLinks()).toEqual([]);
  });
});
