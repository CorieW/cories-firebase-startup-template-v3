/**
 * Shared dashboard UI helper exports.
 */
import type {
  AccountViewProps,
  SettingsCardClassNames,
} from "@daveyplate/better-auth-ui";

/**
 * Shared Tailwind utility strings used across route layouts and cards.
 */
export const pageContainerClass =
  "mx-auto [width:min(1120px,calc(100%-2.5rem))] max-[979px]:pt-[2.6rem] max-[979px]:[width:min(1120px,calc(100%-1.4rem))] min-[980px]:[width:min(60vw,1120px)]";

export const contentWrapClass = "py-9";

export const panelClass =
  "rounded-[18px] border border-[var(--line)] bg-[var(--surface)]";

export const panelMutedClass =
  "rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]";

export const subtleActionClass =
  "inline-flex items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] no-underline transition-[background-color,border-color,color] hover:border-[var(--line-strong)] hover:bg-[var(--surface)] hover:text-[var(--ink)]";

export const settingsViewPanelClass =
  "mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6";

const settingsActionButtonClass =
  "h-10 rounded-[12px] border px-4 text-sm font-semibold shadow-none transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]";

export const betterAuthSettingsCardClassNames = {
  base: "overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface)]",
  cell: "rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] p-4 shadow-none",
  content: "grid gap-5 px-5 pb-5 sm:px-6",
  header: "px-5 pt-5 pb-2 sm:px-6",
  footer:
    "items-center gap-3 border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4 sm:px-6",
  title: "text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--ink)]",
  description: "mt-2 max-w-[60ch] text-sm leading-6 text-[var(--ink-soft)]",
  instructions:
    "max-w-[52ch] text-xs leading-6 text-[var(--ink-soft)] md:text-sm",
  label:
    "text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]",
  input:
    "h-11 rounded-[14px] border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[var(--ink)] shadow-none transition-[border-color,background-color,color] placeholder:text-[var(--ink-soft)] focus-visible:border-[var(--line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]",
  checkbox:
    "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]",
  button: settingsActionButtonClass,
  primaryButton:
    "border border-transparent bg-[var(--primary)] text-[var(--primary-ink)] hover:bg-[var(--primary-strong)]",
  secondaryButton:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
  outlineButton:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
  destructiveButton:
    "border border-[var(--danger)] bg-[var(--danger-surface)] text-[var(--danger)] hover:bg-[var(--danger-surface)]",
  error:
    "rounded-[12px] border border-[var(--danger)] bg-[var(--danger-surface)] px-3 py-2 text-sm text-[var(--danger)]",
  icon: "text-[var(--ink-soft)]",
  skeleton: "bg-[var(--surface-soft)]",
  dialog: {
    content:
      "rounded-[20px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]",
    header: "px-6 pt-6",
    footer: "border-[var(--line)] bg-[var(--surface-soft)] px-6 py-4",
  },
} satisfies SettingsCardClassNames;

export const accountViewClassNames = {
  base: "items-start gap-5 md:gap-8",
  cards: "gap-5",
  drawer: {
    menuItem:
      "rounded-[14px] border border-transparent px-4 py-3 text-sm font-semibold text-[var(--ink-soft)] transition-[background-color,border-color,color] hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
  },
  sidebar: {
    base: "w-full rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)] p-2 md:w-56 lg:w-64",
    button:
      "h-auto items-center justify-between rounded-[14px] border border-transparent px-4 py-3 text-left text-sm font-semibold text-[var(--ink-soft)] transition-[background-color,border-color,color] hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
    buttonActive:
      "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)]",
  },
  card: betterAuthSettingsCardClassNames,
} satisfies NonNullable<AccountViewProps["classNames"]>;
