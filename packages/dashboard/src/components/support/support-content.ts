/**
 * Shared support page content data.
 */
export interface SupportOption {
  id: 'documentation' | 'live-chat' | 'email-support' | 'faq';
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

export const SUPPORT_OPTIONS: SupportOption[] = [
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Review setup guides and implementation walkthroughs.',
    href: 'https://docs.yourcompany.com',
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
    href: 'mailto:support@yourcompany.com',
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

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    title: 'Getting started',
    description: 'Set up your workspace and complete first-run steps.',
    href: 'https://docs.yourcompany.com/getting-started',
  },
  {
    title: 'Account management',
    description: 'Update profile details, security settings, and sessions.',
    href: 'https://docs.yourcompany.com/account-management',
  },
  {
    title: 'Troubleshooting',
    description: 'Resolve common setup and runtime issues quickly.',
    href: 'https://docs.yourcompany.com/troubleshooting',
  },
  {
    title: 'API documentation',
    description: 'Find endpoint references, auth requirements, and examples.',
    href: 'https://docs.yourcompany.com/api',
  },
];
