/**
 * Signed-in sidebar nav definitions and shared class constants.
 */
import {
  Home,
  Layers,
  LifeBuoy,
  MessageSquare,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import {
  type BillingSection,
  APP_CHAT_ROUTE_PATH,
  getBillingRoutePath,
  HOME_ROUTE_PATH,
  SUPPORT_ROUTE_PATH,
} from '../../lib/route-paths';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

interface BillingNavItemDefinition {
  icon: LucideIcon;
  label: string;
  section: BillingSection;
}

export const primaryNavItems: readonly NavItem[] = [
  { icon: Home, label: 'Home', to: HOME_ROUTE_PATH },
  { icon: MessageSquare, label: 'Chat', to: APP_CHAT_ROUTE_PATH },
  { icon: LifeBuoy, label: 'Support', to: SUPPORT_ROUTE_PATH },
] as const;

const billingNavItemDefinitions: readonly BillingNavItemDefinition[] = [
  {
    icon: Layers,
    label: 'Subscriptions',
    section: 'subscriptions',
  },
  {
    icon: WalletCards,
    label: 'Wallet',
    section: 'wallet',
  },
] as const;

export const billingNavItems = billingNavItemDefinitions.map(
  ({ section, ...item }) => ({
    ...item,
    to: getBillingRoutePath(section),
  })
) satisfies readonly NavItem[];

export const sidebarDropdownSurfaceClass =
  'z-[80] min-w-64 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_66%,transparent)] bg-[color-mix(in_srgb,var(--surface)_97%,white_3%)] p-1.5 shadow-[0_18px_40px_rgba(17,12,6,0.16)] backdrop-blur-[12px]';

export const sidebarDropdownMenuItemClass =
  'flex w-full items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-sm font-semibold text-[var(--ink-soft)] outline-none transition-[background-color,color] data-[highlighted]:bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface-soft)_90%)] data-[highlighted]:text-[var(--ink)] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0';

export const sidebarDropdownSeparatorClass = 'my-1 bg-[var(--line)]';

export const sidebarDropdownEntityViewClassNames = {
  base: 'sidebar-account-dropdown__entity min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-[color-mix(in_srgb,var(--surface-soft)_78%,var(--surface)_22%)] px-3 py-2.5',
  content: 'min-w-0 flex-1',
  subtitle: 'truncate text-xs text-[var(--ink-soft)] opacity-100',
  title: 'truncate text-sm font-semibold text-[var(--ink)]',
};

export const sidebarDropdownClassNames = {
  content: {
    base: `${sidebarDropdownSurfaceClass} sidebar-account-dropdown`,
    menuItem: sidebarDropdownMenuItemClass,
    organization: sidebarDropdownEntityViewClassNames,
    separator: sidebarDropdownSeparatorClass,
    user: sidebarDropdownEntityViewClassNames,
  },
};

export const sidebarNavItemBaseClass =
  'flex flex-row items-center gap-2.5 rounded-[12px] border px-3 text-sm font-semibold no-underline transition-[background-color,border-color,color,box-shadow]';

export const sidebarNavItemActiveClass =
  'border-[color-mix(in_srgb,var(--primary)_30%,var(--line-strong))] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface)_90%)] text-[var(--ink)] shadow-[0_1px_0_rgba(255,255,255,0.5),0_10px_22px_rgba(17,12,6,0.05)]';

export const sidebarNavItemInactiveClass =
  'border-transparent text-[var(--ink-soft)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--line))] hover:bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface-soft)_90%)] hover:text-[var(--ink)] hover:shadow-[0_8px_18px_rgba(17,12,6,0.06)]';

export const sidebarNestedNavItemBaseClass =
  'flex h-9 items-center gap-2 rounded-[10px] border px-3 text-sm font-medium no-underline transition-[background-color,border-color,color]';

export const sidebarNestedNavItemActiveClass =
  'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)]';

export const sidebarNestedNavItemInactiveClass =
  'border-transparent text-[var(--ink-soft)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--line))] hover:bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface-soft)_90%)] hover:text-[var(--ink)] hover:shadow-[0_8px_18px_rgba(17,12,6,0.06)]';
