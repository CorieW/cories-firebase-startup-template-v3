/**
 * Admin wrapper around the shared Better Auth route view.
 */
import {
  SharedBetterAuthView,
  type SharedBetterAuthViewMap,
} from '../../../common/src/client/SharedBetterAuthView';
import { AdminAppBrand } from './AdminAppBrand';
import { pageContainerClass } from '../lib/ui';

const adminSignInViewMap = {
  'email-verification': 'EMAIL_VERIFICATION',
} satisfies SharedBetterAuthViewMap;

const adminAuthViewClassNames = {
  base: 'w-full max-w-[560px] rounded-[24px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]',
  content: 'px-7 pb-7 sm:px-9 sm:pb-9',
  header: 'space-y-3 px-7 pt-7 sm:px-9 sm:pt-9',
  title: 'text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]',
  description: 'text-sm leading-7 text-[var(--ink-soft)]',
  continueWith:
    'text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]',
  separator: 'bg-[var(--line)]',
  footer: 'text-sm text-[var(--ink-soft)]',
  footerLink:
    'font-semibold text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--primary)]',
  form: {
    label: 'text-sm font-medium text-[var(--ink)]',
    input:
      'h-12 rounded-[16px] border-[var(--line)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--ink)] shadow-none transition-[border-color,background-color,color] placeholder:text-[var(--ink-soft)] focus-visible:border-[var(--line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]',
    error:
      'rounded-[16px] border border-[var(--danger)] bg-[var(--danger-surface)] px-4 py-3 text-sm text-[var(--danger)]',
    forgotPasswordLink:
      'text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--primary)]',
    primaryButton:
      'h-12 rounded-[16px] border border-transparent bg-[var(--primary)] text-[var(--primary-ink)] shadow-none transition hover:bg-[var(--primary-strong)]',
    secondaryButton:
      'h-12 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-none transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
    outlineButton:
      'h-12 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-none transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
    providerButton:
      'h-12 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] shadow-none transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-emphasis)]',
    checkbox:
      'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]',
    icon: 'text-[var(--ink-soft)]',
    otpInput:
      'h-12 rounded-[16px] border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] shadow-none focus-visible:border-[var(--line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]',
  },
};

interface AdminAuthViewProps {
  redirectTo?: string;
  splat?: string;
}

/**
 * Renders the admin auth route view for the current sign-in sub-route.
 */
export function AdminAuthView({ redirectTo, splat }: AdminAuthViewProps) {
  return (
    <>
      <div className='fixed top-4 left-4 z-40'>
        <AdminAppBrand />
      </div>
      <SharedBetterAuthView
        authViewClassNames={adminAuthViewClassNames}
        containerClassName={`${pageContainerClass} grid min-h-screen place-items-center py-10`}
        mode='sign-in'
        redirectTo={redirectTo}
        signInViewMap={adminSignInViewMap}
        splat={splat}
      />
    </>
  );
}
