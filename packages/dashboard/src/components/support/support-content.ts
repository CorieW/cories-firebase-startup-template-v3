/**
 * Shared support page content data.
 */
import {
  TEMPLATE_SUPPORT,
  TEMPLATE_SUPPORT_EMAIL_HREF,
} from '@cories-firebase-startup-template-v3/common';

export type SupportOptionId =
  | 'documentation'
  | 'live-chat'
  | 'email-support'
  | 'faq';

export interface SupportOption {
  id: SupportOptionId;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface SupportArticle {
  title: string;
  description: string;
  href: string;
}

export const SUPPORT_EMAIL_ADDRESS = TEMPLATE_SUPPORT.emailAddress;
export const SUPPORT_EMAIL_HREF = TEMPLATE_SUPPORT_EMAIL_HREF;
export const SUPPORT_DOCS_HREF = TEMPLATE_SUPPORT.docsHref;

export const SUPPORT_CONTACT_OPTION_IDS = [
  'live-chat',
  'email-support',
] as const satisfies readonly SupportOptionId[];

export const SUPPORT_DOC_OPTION_IDS = [
  'documentation',
  'faq',
] as const satisfies readonly SupportOptionId[];

export const SUPPORT_OPTIONS: SupportOption[] = [
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Review setup guides and implementation walkthroughs.',
    href: SUPPORT_DOCS_HREF,
    cta: 'Open docs',
  },
  {
    id: 'live-chat',
    title: 'Live Chat',
    description: 'Start a real-time conversation with our support team.',
    href: '#',
    cta: 'Start live chat',
  },
  {
    id: 'email-support',
    title: 'Email Support',
    description: 'Send account, billing, or technical questions by email.',
    href: SUPPORT_EMAIL_HREF,
    cta: 'Email support',
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Browse quick answers for common questions and issues.',
    href: '#popular-articles',
    cta: 'View FAQ',
  },
];

/**
 * Filters support options for a subset of support pages.
 */
export function getSupportOptions(optionIds?: readonly SupportOptionId[]) {
  if (!optionIds) {
    return SUPPORT_OPTIONS;
  }

  const allowedOptionIds = new Set(optionIds);

  return SUPPORT_OPTIONS.filter(option => allowedOptionIds.has(option.id));
}

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    title: 'Getting started',
    description: 'Set up your workspace and complete first-run steps.',
    href: `${SUPPORT_DOCS_HREF}/getting-started`,
  },
  {
    title: 'Account management',
    description: 'Update profile details, security settings, and sessions.',
    href: `${SUPPORT_DOCS_HREF}/account-management`,
  },
  {
    title: 'Troubleshooting',
    description: 'Resolve common setup and runtime issues quickly.',
    href: `${SUPPORT_DOCS_HREF}/troubleshooting`,
  },
  {
    title: 'API documentation',
    description: 'Find endpoint references, auth requirements, and examples.',
    href: `${SUPPORT_DOCS_HREF}/api`,
  },
];
