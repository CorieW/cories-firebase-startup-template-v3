/**
 * Brand mark and text lockup for the marketing site.
 */
import { SharedAppBrand } from '../../../common/src/client';

const brandSizeClasses = {
  compact: {
    mark: 'inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[var(--primary)] text-base font-extrabold text-[var(--primary-ink)]',
    root: 'inline-flex items-center gap-2.5 rounded-[16px] p-1.5 text-[var(--ink)] no-underline',
    subtitle:
      'block text-[0.7rem] leading-4 text-[var(--ink-soft)] sm:text-[0.72rem]',
    title: 'block text-[0.95rem] leading-5 font-extrabold tracking-[-0.03em]',
  },
  default: {
    mark: 'inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[var(--primary)] text-lg font-extrabold text-[var(--primary-ink)]',
    root: 'inline-flex items-center gap-3 rounded-[18px] p-2 text-[var(--ink)] no-underline',
    subtitle: 'block text-xs text-[var(--ink-soft)]',
    title: 'block text-sm font-extrabold tracking-[-0.03em]',
  },
} as const;

interface AppBrandProps {
  className?: string;
  size?: keyof typeof brandSizeClasses;
}

/**
 * Renders the starter brand used in the header and footer.
 */
export default function AppBrand({
  className,
  size = 'default',
}: AppBrandProps) {
  const brandClasses = brandSizeClasses[size];

  return (
    <SharedAppBrand
      className={className}
      markClassName={brandClasses.mark}
      renderRoot={({ children, className: resolvedClassName }) => (
        <a href='#top' className={resolvedClassName}>
          {children}
        </a>
      )}
      rootClassName={brandClasses.root}
      subtitle='Marketing + Dashboard'
      subtitleClassName={brandClasses.subtitle}
      titleClassName={brandClasses.title}
    />
  );
}
