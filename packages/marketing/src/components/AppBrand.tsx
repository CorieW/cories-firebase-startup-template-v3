/**
 * Brand mark and text lockup for the marketing site.
 */
import { SharedAppBrand } from "../../../common/src/client";

const brandRootClass =
  "inline-flex items-center gap-3 rounded-[18px] p-2 text-[var(--ink)] no-underline";

const brandMarkClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[var(--primary)] text-lg font-extrabold text-[var(--primary-ink)]";

interface AppBrandProps {
  className?: string;
}

/**
 * Renders the starter brand used in the header and footer.
 */
export default function AppBrand({ className }: AppBrandProps) {
  return (
    <SharedAppBrand
      className={className}
      markClassName={brandMarkClass}
      renderRoot={({ children, className: resolvedClassName }) => (
        <a href="#top" className={resolvedClassName}>
          {children}
        </a>
      )}
      rootClassName={brandRootClass}
      subtitle="Marketing + Dashboard"
      titleClassName="block text-sm font-extrabold tracking-[-0.03em]"
    />
  );
}
