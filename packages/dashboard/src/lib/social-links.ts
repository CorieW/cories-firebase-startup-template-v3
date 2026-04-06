/**
 * Social link data and helper functions.
 */
import { createServerFn } from '@tanstack/react-start';

export interface SocialLinkConfig {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

/**
 * Returns footer social links from SOCIAL_LINKS environment JSON.
 * Invalid or missing values are treated as no configured social links.
 */
export function getFooterSocialLinks(): SocialLinkConfig[] {
  return getSocialLinksFromJson();
}

/**
 * Reads footer social links on the server so route loaders can safely
 * serialize them into client-visible data.
 */
export const getFooterSocialLinksServer = createServerFn({
  method: 'GET',
}).handler(async () => getFooterSocialLinks());

function getSocialLinksFromJson(): SocialLinkConfig[] {
  const rawValue = readEnvValue('SOCIAL_LINKS');
  if (!rawValue || rawValue.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => normalizeSocialLinkItem(item, index))
      .filter((item): item is SocialLinkConfig => item !== null);
  } catch {
    return [];
  }
}

function normalizeSocialLinkItem(
  value: unknown,
  index: number
): SocialLinkConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const label = asTrimmedString(record.label);
  const url = asTrimmedString(record.url);
  const icon = asTrimmedString(record.icon)?.toLowerCase();

  if (!label || !url) {
    return null;
  }

  return {
    id: `social-${index}-${label.toLowerCase().replace(/\s+/g, '-')}`,
    label,
    url,
    ...(icon ? { icon } : {}),
  };
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readEnvValue(name: string): string | undefined {
  if (typeof process === 'undefined') {
    return undefined;
  }

  return process.env?.[name];
}
