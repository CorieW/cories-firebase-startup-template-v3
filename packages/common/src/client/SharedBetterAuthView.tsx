/**
 * Shared Better Auth route view wrapper for frontend auth entry pages.
 */
import type { ComponentType, ReactNode } from 'react';

export type SharedBetterAuthMode = 'sign-in' | 'sign-up';
export type SharedBetterAuthPath =
  | 'ACCEPT_INVITATION'
  | 'CALLBACK'
  | 'EMAIL_OTP'
  | 'EMAIL_VERIFICATION'
  | 'FORGOT_PASSWORD'
  | 'MAGIC_LINK'
  | 'RECOVER_ACCOUNT'
  | 'RESET_PASSWORD'
  | 'SIGN_IN'
  | 'SIGN_OUT'
  | 'SIGN_UP'
  | 'TWO_FACTOR';
export type SharedBetterAuthViewMap = Partial<
  Record<string, SharedBetterAuthPath>
>;

interface SharedAuthViewComponentProps {
  callbackURL?: string;
  cardFooter?: ReactNode;
  cardHeader?: ReactNode;
  className?: string;
  classNames?: Record<string, unknown>;
  localization?: Record<string, unknown>;
  otpSeparators?: 0 | 1 | 2;
  path?: string;
  pathname?: string;
  redirectTo?: string;
  socialLayout?: 'auto' | 'grid' | 'horizontal' | 'vertical';
  view?: SharedBetterAuthPath;
}

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
  AuthViewComponent: ComponentType<SharedAuthViewComponentProps>;
  authViewClassName?: SharedAuthViewComponentProps['className'];
  authViewClassNames?: SharedAuthViewComponentProps['classNames'];
  callbackURL?: SharedAuthViewComponentProps['callbackURL'];
  cardFooter?: SharedAuthViewComponentProps['cardFooter'];
  cardHeader?: SharedAuthViewComponentProps['cardHeader'];
  containerClassName?: string;
  localization?: SharedAuthViewComponentProps['localization'];
  mode: SharedBetterAuthMode;
  otpSeparators?: SharedAuthViewComponentProps['otpSeparators'];
  path?: SharedAuthViewComponentProps['path'];
  pathname?: SharedAuthViewComponentProps['pathname'];
  redirectTo?: SharedAuthViewComponentProps['redirectTo'];
  signInViewMap?: SharedBetterAuthViewMap;
  socialLayout?: SharedAuthViewComponentProps['socialLayout'];
  splat?: string;
}

/**
 * Renders a shared Better Auth route view with app-level styling overrides.
 */
export function SharedBetterAuthView({
  AuthViewComponent,
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
      <AuthViewComponent
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
