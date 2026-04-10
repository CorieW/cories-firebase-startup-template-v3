/**
 * Shared admin layout class names.
 */
export const pageContainerClass =
  "mx-auto [width:min(1120px,calc(100%-2.5rem))] py-5 max-[979px]:[width:min(1120px,calc(100%-1.4rem))]";

export const widePageContainerClass =
  "mx-auto [width:min(1320px,calc(100%-2.5rem))] py-5 max-[979px]:[width:min(1320px,calc(100%-1.4rem))]";

export const cardClass =
  "rounded-[24px] border border-[var(--line)] bg-[var(--surface)]";

export const subtleCardClass =
  "rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)]";

export const dangerCardClass =
  "rounded-[20px] border border-[var(--danger)] bg-[var(--danger-surface)]";

export const dangerTextClass = "text-[var(--danger)]";

export const dangerMutedTextClass = "text-[var(--danger)] opacity-80";

export const textInputClass =
  "w-full rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-[border-color,background-color,color] placeholder:text-[var(--ink-soft)] focus:border-[var(--line-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)]";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-[16px] border border-transparent bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-ink)] transition-[background-color,border-color,color] hover:bg-[var(--primary-strong)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)]";

export const secondaryButtonClass =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[16px] border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-[var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-60";

export const badgeClass =
  "inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]";
