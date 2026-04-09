/**
 * Shared Better Auth route view wrapper for frontend auth entry pages.
 */
import {
  AuthView,
  type AuthViewProps,
  type AuthViewPaths,
} from '@daveyplate/better-auth-ui';

export type SharedBetterAuthMode = 'sign-in' | 'sign-up';
export type SharedBetterAuthPath = keyof AuthViewPaths;
export type SharedBetterAuthViewMap = Partial<
  Record<string, SharedBetterAuthPath>
>;

const defaultSignInViewMap = {
  callback: 'CALLBACK',
  'email-verification': 'EMAIL_VERIFICATION',
  'forgot-password': 'FORGOT_PASSWORD',
  'recover-account': 'RECOVER_ACCOUNT',
  'reset-password': 'RESET_PASSWORD',
  'sign-out': 'SIGN_OUT',
  'two-factor': 'TWO_FACTOR',
} satisfies SharedBetterAuthViewMap;

const defaultContainerClassName =
  'grid min-h-screen place-items-center px-4 py-10 sm:px-6';

function normalizeSplat(splat: string | undefined): string {
  if (!splat) {
    return '';
  }

  return splat.replace(/^\/+|\/+$/g, '');
}

/**
 * Resolves the Better Auth view key for the current auth route splat.
 */
export function resolveSharedBetterAuthView({
  mode,
  signInViewMap = defaultSignInViewMap,
  splat,
}: {
  mode: SharedBetterAuthMode;
  signInViewMap?: SharedBetterAuthViewMap;
  splat?: string;
}): SharedBetterAuthPath {
  const normalizedSplat = normalizeSplat(splat);

  if (mode === 'sign-up') {
    return normalizedSplat === 'callback' ? 'CALLBACK' : 'SIGN_UP';
  }

  return signInViewMap[normalizedSplat] ?? 'SIGN_IN';
}

export interface SharedBetterAuthViewProps {
  authViewClassName?: AuthViewProps['className'];
  authViewClassNames?: AuthViewProps['classNames'];
  callbackURL?: AuthViewProps['callbackURL'];
  cardFooter?: AuthViewProps['cardFooter'];
  cardHeader?: AuthViewProps['cardHeader'];
  containerClassName?: string;
  localization?: AuthViewProps['localization'];
  mode: SharedBetterAuthMode;
  otpSeparators?: AuthViewProps['otpSeparators'];
  path?: AuthViewProps['path'];
  pathname?: AuthViewProps['pathname'];
  redirectTo?: AuthViewProps['redirectTo'];
  signInViewMap?: SharedBetterAuthViewMap;
  socialLayout?: AuthViewProps['socialLayout'];
  splat?: string;
}

/**
 * Renders a shared Better Auth route view with app-level styling overrides.
 */
export function SharedBetterAuthView({
  authViewClassName,
  authViewClassNames,
  callbackURL,
  cardFooter,
  cardHeader,
  containerClassName = defaultContainerClassName,
  localization,
  mode,
  otpSeparators,
  path,
  pathname,
  redirectTo = '/',
  signInViewMap,
  socialLayout = 'vertical',
  splat,
}: SharedBetterAuthViewProps) {
  return (
    <main className={containerClassName}>
      <AuthView
        callbackURL={callbackURL}
        cardFooter={cardFooter}
        cardHeader={cardHeader}
        className={authViewClassName}
        classNames={authViewClassNames}
        localization={localization}
        otpSeparators={otpSeparators}
        path={path}
        pathname={pathname}
        redirectTo={redirectTo}
        socialLayout={socialLayout}
        view={resolveSharedBetterAuthView({
          mode,
          signInViewMap,
          splat,
        })}
      />
    </main>
  );
}
