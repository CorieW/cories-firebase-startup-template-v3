/**
 * Small editorial banner shown at the top of the docs sidebar.
 */
/**
 * Gives the docs sidebar a branded introduction instead of a generic heading.
 */
export default function DocsSidebarBanner() {
  return (
    <div
      className='rounded-[20px] border border-[var(--line)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,transparent),color-mix(in_srgb,var(--surface-soft)_94%,transparent))] p-4 shadow-[0_18px_48px_rgba(91,72,39,0.08)]'
      data-testid='docs-sidebar-banner'
    >
      <p className='text-[0.68rem] font-bold tracking-[0.16em] text-[var(--primary)] uppercase'>
        Starter Docs
      </p>
      <p className='mt-2 text-sm font-semibold text-[var(--ink)]'>
        Ship setup guides, reference pages, and rich examples from one content
        tree.
      </p>
      <p className='mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
        The docs app uses MDX, shared theme tokens, and a reusable component
        registry for code, media, and embeds.
      </p>
    </div>
  );
}
