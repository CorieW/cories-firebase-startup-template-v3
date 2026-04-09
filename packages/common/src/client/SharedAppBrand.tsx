/**
 * Shared app brand lockup used by frontend app wrappers.
 */
import type { CSSProperties, ReactNode } from 'react';
import {
  TEMPLATE_BRAND_MARK,
  TEMPLATE_BRAND_NAME,
  TEMPLATE_BRAND_SUBTITLE,
} from '../global.js';

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

const sharedAppBrandSizeClassNames = {
  compact: {
    mark: 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-base font-extrabold',
    root: 'inline-flex items-center gap-2.5 rounded-[16px] p-1.5 no-underline',
    subtitle:
      'block text-[0.7rem] leading-4 text-[var(--ink-soft)] sm:text-[0.72rem]',
    title: 'block text-[0.95rem] leading-5 font-extrabold tracking-[-0.03em]',
  },
  prominent: {
    mark: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] text-lg font-extrabold',
    root: 'inline-flex items-center gap-3 rounded-[18px] p-2 no-underline',
    subtitle: 'block text-xs text-[var(--ink-soft)]',
    title: 'block text-sm font-extrabold tracking-[-0.03em]',
  },
  standard: {
    mark: 'inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[1.02rem] font-extrabold',
    root: 'flex items-center gap-[0.7rem] rounded-xl p-[0.6rem] no-underline',
    subtitle: 'block text-xs text-[var(--ink-soft)]',
    title: 'block text-sm font-extrabold',
  },
} as const;

const sharedAppBrandSizeStyles = {
  compact: {
    content: {
      minWidth: 0,
    },
    mark: {
      borderRadius: '14px',
      flexShrink: 0,
      fontWeight: 800,
      height: '2.25rem',
      justifyContent: 'center',
      width: '2.25rem',
    },
    root: {
      alignItems: 'center',
      borderRadius: '16px',
      display: 'inline-flex',
      gap: '0.625rem',
      padding: '0.375rem',
      textDecoration: 'none',
    },
    subtitle: {
      display: 'block',
    },
    title: {
      display: 'block',
    },
  },
  prominent: {
    content: {
      minWidth: 0,
    },
    mark: {
      borderRadius: '16px',
      flexShrink: 0,
      fontWeight: 800,
      height: '2.75rem',
      justifyContent: 'center',
      width: '2.75rem',
    },
    root: {
      alignItems: 'center',
      borderRadius: '18px',
      display: 'inline-flex',
      gap: '0.75rem',
      padding: '0.5rem',
      textDecoration: 'none',
    },
    subtitle: {
      display: 'block',
    },
    title: {
      display: 'block',
    },
  },
  standard: {
    content: {
      minWidth: 0,
    },
    mark: {
      borderRadius: '11px',
      flexShrink: 0,
      fontWeight: 800,
      height: '34px',
      justifyContent: 'center',
      width: '34px',
    },
    root: {
      alignItems: 'center',
      borderRadius: '0.75rem',
      display: 'inline-flex',
      gap: '0.7rem',
      padding: '0.6rem',
      textDecoration: 'none',
    },
    subtitle: {
      display: 'block',
    },
    title: {
      display: 'block',
    },
  },
} satisfies Record<
  SharedAppBrandSize,
  {
    content: CSSProperties;
    mark: CSSProperties;
    root: CSSProperties;
    subtitle: CSSProperties;
    title: CSSProperties;
  }
>;

export type SharedAppBrandSize = keyof typeof sharedAppBrandSizeClassNames;

interface SharedAppBrandProps {
  className?: string;
  contentClassName?: string;
  mark?: ReactNode;
  markClassName?: string;
  rootClassName?: string;
  size?: SharedAppBrandSize;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
  renderRoot: (props: {
    children: ReactNode;
    className: string;
    style: CSSProperties;
  }) => ReactNode;
}

/**
 * Renders the shared template brand markup inside an app-provided link.
 */
export function SharedAppBrand({
  className,
  contentClassName,
  mark = TEMPLATE_BRAND_MARK,
  markClassName,
  renderRoot,
  rootClassName,
  size = 'standard',
  subtitle = TEMPLATE_BRAND_SUBTITLE,
  subtitleClassName,
  title = TEMPLATE_BRAND_NAME,
  titleClassName,
}: SharedAppBrandProps) {
  const sizeClassNames = sharedAppBrandSizeClassNames[size];
  const sizeStyles = sharedAppBrandSizeStyles[size];

  return renderRoot({
    className: joinClassNames(sizeClassNames.root, rootClassName, className),
    style: sizeStyles.root,
    children: (
      <>
        <span
          className={joinClassNames(sizeClassNames.mark, markClassName)}
          style={sizeStyles.mark}
        >
          {mark}
        </span>
        <span
          className={joinClassNames('min-w-0', contentClassName)}
          style={sizeStyles.content}
        >
          <strong
            className={joinClassNames(sizeClassNames.title, titleClassName)}
            style={sizeStyles.title}
          >
            {title}
          </strong>
          <span
            className={joinClassNames(
              sizeClassNames.subtitle,
              subtitleClassName
            )}
            style={sizeStyles.subtitle}
          >
            {subtitle}
          </span>
        </span>
      </>
    ),
  });
}
