/**
 * Shared social link renderer.
 */
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';

interface SocialLinkProps {
  href: string;
  label: string;
  icon?: string;
}

/**
 * Footer social link that shows icon-only on small screens
 * and icon + text on larger screens.
 */
export default function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      aria-label={label}
      title={label}
      className='inline-flex items-center gap-[0.35rem] rounded-[999px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_64%,var(--surface)_36%)] px-[0.6rem] py-[0.35rem] text-[0.8rem] font-bold text-[var(--ink-soft)] no-underline transition-[background-color,border-color,color] hover:border-[color-mix(in_srgb,var(--primary)_20%,var(--line-strong))] hover:bg-[color-mix(in_srgb,var(--primary)_5%,var(--surface-soft))] hover:text-[var(--ink)]'
    >
      <span
        className='inline-flex h-[0.95rem] w-[0.95rem] items-center justify-center [&_svg]:h-full [&_svg]:w-full'
        aria-hidden='true'
      >
        <SocialIcon icon={icon} />
      </span>
      <span className='hidden sm:inline'>{label}</span>
    </a>
  );
}

function SocialIcon({ icon }: { icon?: string }) {
  const normalized = icon?.toLowerCase();

  if (normalized === 'github') return <Github />;
  if (normalized === 'linkedin') return <Linkedin />;
  if (normalized === 'youtube') return <Youtube />;
  if (normalized === 'instagram') return <Instagram />;
  if (normalized === 'facebook') return <Facebook />;
  if (normalized === 'x' || normalized === 'twitter') {
    return (
      <svg viewBox='0 0 16 16' fill='currentColor'>
        <path d='M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z' />
      </svg>
    );
  }

  return <Globe />;
}
