/**
 * Shared Better Auth UI route wrapper for sign-in, sign-up, and related auth views.
 */
import { AuthView, type AuthViewPaths } from '@daveyplate/better-auth-ui';

type AuthMode = 'sign-in' | 'sign-up';

const signInRouteViewMap: Record<string, keyof AuthViewPaths> = {
  callback: 'CALLBACK',
  'email-verification': 'EMAIL_VERIFICATION',
  'forgot-password': 'FORGOT_PASSWORD',
  'recover-account': 'RECOVER_ACCOUNT',
  'reset-password': 'RESET_PASSWORD',
  'sign-out': 'SIGN_OUT',
  'two-factor': 'TWO_FACTOR',
};

function normalizeSplat(splat: string | undefined): string {
  if (!splat) {
    return '';
  }

  return splat.replace(/^\/+|\/+$/g, '');
}

function resolveAuthView(
  mode: AuthMode,
  splat: string | undefined
): keyof AuthViewPaths {
  const normalized = normalizeSplat(splat);

  if (mode === 'sign-up') {
    return normalized === 'callback' ? 'CALLBACK' : 'SIGN_UP';
  }

  return signInRouteViewMap[normalized] ?? 'SIGN_IN';
}

const authViewClassNames = {
  base: 'w-full max-w-[500px] rounded-[26px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]',
  content: 'px-6 pb-6 sm:px-7 sm:pb-7',
  header: 'px-6 pt-6 sm:px-7',
  title: 'text-[1.85rem] font-semibold tracking-[-0.035em] text-[var(--ink)]',
  description: 'text-[0.96rem] leading-6 text-[var(--ink-soft)]',
  continueWith:
    'text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]',
  separator: 'bg-[var(--line)]',
  footer: 'text-[0.95rem] text-[var(--ink-soft)]',
  footerLink:
    'font-semibold text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--primary)]',
  form: {
    label: 'text-[0.95rem] font-medium text-[var(--ink)]',
    input:
      'h-12 rounded-[14px] border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[var(--ink)] shadow-none transition-[border-color,background-color,color] placeholder:text-[var(--ink-soft)] focus-visible:border-[var(--line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]',
    error:
      'rounded-[10px] border border-[var(--danger)] bg-[var(--danger-surface)] px-3 py-2 text-sm text-[var(--danger)]',
    forgotPasswordLink:
      'text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--primary)]',
    primaryButton:
      'h-12 rounded-[12px] border border-transparent bg-[var(--primary)] text-[var(--primary-ink)] shadow-none transition hover:bg-[var(--primary-strong)]',
    secondaryButton:
      'h-12 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-none transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
    outlineButton:
      'h-12 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-none transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]',
    providerButton:
      'h-12 rounded-[12px] border border-[var(--auth-provider-line)] bg-[var(--auth-provider-surface)] text-[var(--auth-provider-ink)] shadow-none transition hover:border-[var(--auth-provider-line-strong)] hover:bg-[var(--auth-provider-surface-hover)]',
    checkbox:
      'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]',
    icon: 'text-[var(--ink-soft)]',
    otpInput:
      'h-12 rounded-[14px] border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] shadow-none focus-visible:border-[var(--line-strong)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)]',
  },
};

export default function BetterAuthForms({
  mode,
  splat,
}: {
  mode: AuthMode;
  splat?: string;
}) {
  return (
    <main className='grid min-h-screen place-items-center px-4 py-10 sm:px-6'>
      <AuthView
        classNames={authViewClassNames}
        redirectTo='/'
        view={resolveAuthView(mode, splat)}
        socialLayout='vertical'
      />
    </main>
  );
}
