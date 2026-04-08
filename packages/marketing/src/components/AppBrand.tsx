/**
 * Brand mark and text lockup for the marketing site.
 */
import { SharedAppBrand } from "@cories-firebase-startup-template-v3/common/client";

interface AppBrandProps {
  className?: string;
  size?: "compact" | "default";
}

/**
 * Renders the starter brand used in the header and footer.
 */
export default function AppBrand({
  className,
  size = "default",
}: AppBrandProps) {
  return (
    <SharedAppBrand
      className={className}
      markClassName="border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[var(--primary)] text-[var(--primary-ink)]"
      renderRoot={({ children, className: resolvedClassName }) => (
        <a href="#top" className={resolvedClassName}>
          {children}
        </a>
      )}
      rootClassName="text-[var(--ink)]"
      size={size === "compact" ? "compact" : "prominent"}
    />
  );
}
