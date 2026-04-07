/**
 * Shared app brand lockup used by frontend app wrappers.
 */
import type { ReactNode } from 'react';

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

interface SharedAppBrandProps {
  className?: string;
  mark?: ReactNode;
  markClassName: string;
  rootClassName: string;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
  renderRoot: (props: { children: ReactNode; className: string }) => ReactNode;
}

/**
 * Renders the shared Firebase Starter brand markup inside an app-provided link.
 */
export function SharedAppBrand({
  className,
  mark = 'C',
  markClassName,
  renderRoot,
  rootClassName,
  subtitle = 'Better Auth + Autumn',
  subtitleClassName = 'block text-xs text-[var(--ink-soft)]',
  title = 'Firebase Starter',
  titleClassName = 'block text-sm font-extrabold',
}: SharedAppBrandProps) {
  return renderRoot({
    className: joinClassNames(rootClassName, className),
    children: (
      <>
        <span className={markClassName}>{mark}</span>
        <span>
          <strong className={titleClassName}>{title}</strong>
          <span className={subtitleClassName}>{subtitle}</span>
        </span>
      </>
    ),
  });
}
