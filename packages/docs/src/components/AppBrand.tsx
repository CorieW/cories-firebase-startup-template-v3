/**
 * Shared brand lockup used in the docs shell.
 */
import { SharedAppBrand } from '@cories-firebase-startup-template-v3/common/client';
import { Link } from '@tanstack/react-router';

const brandMarkClassName =
  'border border-[color-mix(in_srgb,var(--primary)_38%,var(--line))] bg-[var(--primary)] text-[var(--primary-ink)]';

/**
 * Renders the clickable docs brand link.
 */
export default function AppBrand() {
  return (
    <SharedAppBrand
      markClassName={brandMarkClassName}
      renderRoot={({ children, className, style }) => (
        <Link
          to='/'
          className={className}
          style={style}
          data-testid='docs-brand'
        >
          {children}
        </Link>
      )}
      rootClassName='text-[var(--ink)]'
      size='compact'
      subtitle='Documentation'
    />
  );
}
