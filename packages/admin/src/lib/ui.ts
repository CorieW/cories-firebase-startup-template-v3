/**
 * Shared admin layout class names.
 */
export const shellFrameClass =
  "min-h-screen bg-[var(--admin-bg)] text-[var(--admin-ink)]";

export const pageContainerClass =
  "mx-auto [width:min(1120px,calc(100%-2.5rem))] py-5 max-[979px]:[width:min(1120px,calc(100%-1.4rem))]";

export const widePageContainerClass =
  "mx-auto [width:min(1320px,calc(100%-2.5rem))] py-5 max-[979px]:[width:min(1320px,calc(100%-1.4rem))]";

export const cardClass =
  "rounded-[24px] border border-[var(--admin-line)] bg-[var(--admin-surface)]";

export const subtleCardClass =
  "rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)]";

export const dangerCardClass =
  "rounded-[20px] border border-[var(--admin-danger)] bg-[var(--admin-danger-surface)]";

export const dangerTextClass = "text-[var(--admin-danger)]";

export const dangerMutedTextClass = "text-[var(--admin-danger)] opacity-80";

export const textInputClass =
  "w-full rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-[var(--admin-ink)] outline-none transition-[border-color,background-color,color] placeholder:text-[var(--admin-ink-soft)] focus:border-[var(--admin-line-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--admin-line-strong)]";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-[16px] border border-transparent bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-primary-ink)] transition-[background-color,border-color,color] hover:bg-[var(--admin-primary-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--admin-line-strong)]";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-ink)] transition-[background-color,border-color,color] hover:border-[var(--admin-line-strong)] hover:bg-[var(--admin-surface-muted)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--admin-line-strong)] disabled:cursor-not-allowed disabled:opacity-60";

export const badgeClass =
  "inline-flex items-center rounded-full border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]";
