/**
 * Shared dashboard UI helper exports.
 */
import type {
  AccountViewProps,
  SettingsCardClassNames,
} from '@daveyplate/better-auth-ui';

/**
 * Shared Tailwind utility strings used across route layouts and cards.
 */
export const pageContainerClass =
  'mx-auto [width:min(1120px,calc(100%-2.5rem))] max-[979px]:pt-[2.6rem] max-[979px]:[width:min(1120px,calc(100%-1.4rem))] min-[980px]:[width:min(60vw,1120px)]';

export const contentWrapClass = 'py-9';

export const panelClass =
  'rounded-[18px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_98%,white_2%)_0%,var(--surface)_100%)] shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_28px_rgba(17,12,6,0.04)]';

export const panelMutedClass =
  'rounded-[16px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_74%,var(--surface)_26%)]';

export const subtleActionClass =
  'inline-flex items-center justify-center rounded-[12px] border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] no-underline transition-[background-color,border-color,color,box-shadow] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--line-strong))] hover:bg-[color-mix(in_srgb,var(--primary)_5%,var(--surface-soft))] hover:text-[var(--ink)]';

export const settingsViewPanelClass =
  'mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_98%,white_2%)_0%,color-mix(in_srgb,var(--surface)_96%,var(--primary)_4%)_100%)] p-4 shadow-[0_1px_0_rgba(255,255,255,0.52),0_16px_38px_rgba(17,12,6,0.06)] sm:p-6';

const settingsActionButtonClass =
  'h-10 rounded-[12px] border px-4 text-sm font-semibold shadow-none transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]';

export const betterAuthSettingsCardClassNames = {
  base: 'overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_98%,white_2%)_0%,color-mix(in_srgb,var(--surface)_96%,var(--primary)_4%)_100%)] shadow-[0_1px_0_rgba(255,255,255,0.6),0_14px_32px_rgba(17,12,6,0.05)]',
  cell: 'rounded-[16px] border border-[color-mix(in_srgb,var(--line)_52%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_82%,var(--primary)_4%)] p-4 shadow-none',
  content: 'grid gap-5 px-5 pb-5 sm:px-6',
  header:
    'px-5 pt-5 pb-2 sm:px-6',
  footer:
    'items-center gap-3 border-[color-mix(in_srgb,var(--line)_52%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_80%,var(--primary)_5%)] px-5 py-4 sm:px-6',
  title:
    'text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--ink)]',
  description: 'mt-2 max-w-[60ch] text-sm leading-6 text-[var(--ink-soft)]',
  instructions: 'max-w-[52ch] text-xs leading-6 text-[var(--ink-soft)] md:text-sm',
  label:
    'text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--primary)_64%,var(--ink-soft))]',
  input:
    'h-11 rounded-[14px] border-[color-mix(in_srgb,var(--line)_64%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_80%,var(--surface)_20%)] px-3.5 text-[var(--ink)] shadow-none transition-[border-color,background-color,box-shadow] placeholder:text-[var(--ink-soft)] focus-visible:border-[color-mix(in_srgb,var(--primary)_34%,var(--line-strong))] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]',
  checkbox:
    'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]',
  button: settingsActionButtonClass,
  primaryButton:
    'border border-transparent bg-[var(--primary)] text-[var(--primary-ink)] hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)]',
  secondaryButton:
    'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
  outlineButton:
    'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
  destructiveButton:
    'border border-[color-mix(in_srgb,#dc2626_26%,var(--line))] bg-[color-mix(in_srgb,#dc2626_8%,var(--surface))] text-[#b91c1c] hover:bg-[color-mix(in_srgb,#dc2626_14%,var(--surface))] dark:text-[#fca5a5]',
  error:
    'rounded-[12px] border border-[color-mix(in_srgb,#dc2626_22%,var(--line))] bg-[color-mix(in_srgb,#dc2626_10%,var(--surface-soft))] px-3 py-2 text-sm text-[#b91c1c] dark:text-[#fca5a5]',
  icon: 'text-[color-mix(in_srgb,var(--primary)_72%,var(--ink-soft))]',
  skeleton:
    'bg-[color-mix(in_srgb,var(--surface-soft)_86%,var(--surface)_14%)]',
  dialog: {
    content:
      'rounded-[20px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[color-mix(in_srgb,var(--surface)_97%,white_3%)] text-[var(--ink)] shadow-[0_22px_56px_rgba(17,12,6,0.16)] backdrop-blur-[14px]',
    header: 'px-6 pt-6',
    footer:
      'border-[color-mix(in_srgb,var(--line)_52%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_80%,var(--primary)_5%)] px-6 py-4',
  },
} satisfies SettingsCardClassNames;

export const accountViewClassNames = {
  base: 'items-start gap-5 md:gap-8',
  cards: 'gap-5',
  drawer: {
    menuItem:
      'rounded-[14px] border border-transparent px-4 py-3 text-sm font-semibold text-[var(--ink-soft)] transition-[background-color,border-color,color] hover:border-[color-mix(in_srgb,var(--primary)_26%,var(--line))] hover:bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface-soft))] hover:text-[var(--ink)]',
  },
  sidebar: {
    base: 'w-full rounded-[20px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_72%,var(--surface)_28%)] p-2 shadow-[0_1px_0_rgba(255,255,255,0.45),0_10px_24px_rgba(17,12,6,0.04)] md:w-56 lg:w-64',
    button:
      'h-auto items-center justify-between rounded-[14px] border border-transparent px-4 py-3 text-left text-sm font-semibold text-[var(--ink-soft)] transition-[background-color,border-color,color,box-shadow] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--line))] hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--surface))] hover:text-[var(--ink)]',
    buttonActive:
      'border-[color-mix(in_srgb,var(--primary)_32%,var(--line-strong))] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface)_90%)] text-[var(--ink)] shadow-[0_1px_0_rgba(255,255,255,0.56),0_12px_24px_rgba(17,12,6,0.06)]',
  },
  card: betterAuthSettingsCardClassNames,
} satisfies NonNullable<AccountViewProps['classNames']>;
