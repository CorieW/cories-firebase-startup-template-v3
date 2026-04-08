/**
 * Shared app brand lockup used by frontend app wrappers.
 */
import type { ReactNode } from "react";

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const sharedAppBrandSizeClassNames = {
  compact: {
    mark: "inline-flex h-9 w-9 items-center justify-center rounded-[14px] text-base font-extrabold",
    root: "inline-flex items-center gap-2.5 rounded-[16px] p-1.5 no-underline",
    subtitle:
      "block text-[0.7rem] leading-4 text-[var(--ink-soft)] sm:text-[0.72rem]",
    title: "block text-[0.95rem] leading-5 font-extrabold tracking-[-0.03em]",
  },
  prominent: {
    mark: "inline-flex h-11 w-11 items-center justify-center rounded-[16px] text-lg font-extrabold",
    root: "inline-flex items-center gap-3 rounded-[18px] p-2 no-underline",
    subtitle: "block text-xs text-[var(--ink-soft)]",
    title: "block text-sm font-extrabold tracking-[-0.03em]",
  },
  standard: {
    mark: "inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-[1.02rem] font-extrabold",
    root: "flex items-center gap-[0.7rem] rounded-xl p-[0.6rem] no-underline",
    subtitle: "block text-xs text-[var(--ink-soft)]",
    title: "block text-sm font-extrabold",
  },
} as const;

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
  renderRoot: (props: { children: ReactNode; className: string }) => ReactNode;
}

/**
 * Renders the shared Firebase Starter brand markup inside an app-provided link.
 */
export function SharedAppBrand({
  className,
  contentClassName,
  mark = "C",
  markClassName,
  renderRoot,
  rootClassName,
  size = "standard",
  subtitle = "Better Auth + Autumn",
  subtitleClassName,
  title = "Firebase Starter",
  titleClassName,
}: SharedAppBrandProps) {
  const sizeClassNames = sharedAppBrandSizeClassNames[size];

  return renderRoot({
    className: joinClassNames(sizeClassNames.root, rootClassName, className),
    children: (
      <>
        <span className={joinClassNames(sizeClassNames.mark, markClassName)}>
          {mark}
        </span>
        <span className={contentClassName}>
          <strong
            className={joinClassNames(sizeClassNames.title, titleClassName)}
          >
            {title}
          </strong>
          <span
            className={joinClassNames(
              sizeClassNames.subtitle,
              subtitleClassName,
            )}
          >
            {subtitle}
          </span>
        </span>
      </>
    ),
  });
}
