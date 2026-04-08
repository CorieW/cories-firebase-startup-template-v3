/**
 * Admin wrapper around the shared Better Auth route view.
 */
import { SharedBetterAuthView } from "@cories-firebase-startup-template-v3/common/client";
import { AdminAppBrand } from "./AdminAppBrand";
import { ADMIN_HOME_ROUTE_PATH } from "../lib/route-paths";
import { badgeClass, pageContainerClass } from "../lib/ui";

const adminAuthViewClassNames = {
  base: "w-full max-w-[560px] rounded-[24px] border border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink)]",
  content: "px-7 pb-7 sm:px-9 sm:pb-9",
  header: "space-y-3 px-7 pt-7 sm:px-9 sm:pt-9",
  title: "text-3xl font-semibold tracking-[-0.03em] text-[var(--admin-ink)]",
  description: "text-sm leading-7 text-[var(--admin-ink-soft)]",
  continueWith:
    "text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]",
  separator: "bg-[var(--admin-line)]",
  footer: "text-sm text-[var(--admin-ink-soft)]",
  footerLink:
    "font-semibold text-[var(--admin-ink)] underline decoration-[var(--admin-line-strong)] underline-offset-4 transition-colors hover:text-[var(--admin-primary)]",
  form: {
    label: "text-sm font-medium text-[var(--admin-ink)]",
    input:
      "h-12 rounded-[16px] border-[var(--admin-line)] bg-[var(--admin-surface-muted)] px-4 text-sm text-[var(--admin-ink)] shadow-none transition-[border-color,background-color,color] placeholder:text-[var(--admin-ink-soft)] focus-visible:border-[var(--admin-line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-line-strong)]",
    error:
      "rounded-[16px] border border-[var(--admin-danger)] bg-[var(--admin-danger-surface)] px-4 py-3 text-sm text-[var(--admin-danger)]",
    forgotPasswordLink:
      "text-sm font-medium text-[var(--admin-ink-soft)] transition-colors hover:text-[var(--admin-primary)]",
    primaryButton:
      "h-12 rounded-[16px] border border-transparent bg-[var(--admin-primary)] text-[var(--admin-primary-ink)] shadow-none transition hover:bg-[var(--admin-primary-strong)]",
    secondaryButton:
      "h-12 rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink)] shadow-none transition hover:border-[var(--admin-line-strong)] hover:bg-[var(--admin-surface-muted)]",
    outlineButton:
      "h-12 rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink)] shadow-none transition hover:border-[var(--admin-line-strong)] hover:bg-[var(--admin-surface-muted)]",
    providerButton:
      "h-12 rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] text-[var(--admin-ink)] shadow-none transition hover:border-[var(--admin-line-strong)] hover:bg-[var(--admin-surface-strong)]",
    checkbox:
      "border-[var(--admin-line)] bg-[var(--admin-surface-muted)] text-[var(--admin-primary)] data-[state=checked]:border-[var(--admin-primary)] data-[state=checked]:bg-[var(--admin-primary)]",
    icon: "text-[var(--admin-ink-soft)]",
    otpInput:
      "h-12 rounded-[16px] border-[var(--admin-line)] bg-[var(--admin-surface-muted)] text-[var(--admin-ink)] shadow-none focus-visible:border-[var(--admin-line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-line-strong)]",
  },
};

interface AdminAuthViewProps {
  splat?: string;
}

/**
 * Renders the admin auth route view for the current sign-in sub-route.
 */
export function AdminAuthView({ splat }: AdminAuthViewProps) {
  return (
    <>
      <div className="fixed left-4 top-4 z-40">
        <AdminAppBrand />
      </div>
      <SharedBetterAuthView
        authViewClassNames={adminAuthViewClassNames}
        cardHeader={<span className={badgeClass}>Admin Auth</span>}
        containerClassName={`${pageContainerClass} grid min-h-screen place-items-center py-10`}
        mode="sign-in"
        redirectTo={ADMIN_HOME_ROUTE_PATH}
        splat={splat}
      />
    </>
  );
}
