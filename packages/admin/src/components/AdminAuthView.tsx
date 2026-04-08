/**
 * Native admin auth UI for sign-in, password reset, and sign-out flows.
 */
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  ADMIN_HOME_ROUTE_PATH,
  ADMIN_RESET_PASSWORD_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PATH,
  ADMIN_SIGN_IN_ROUTE_PREFIX,
  getAdminAuthRouteParams,
  getAdminAuthRouteSearch,
} from '../lib/route-paths';
import {
  badgeClass,
  cardClass,
  dangerCardClass,
  pageContainerClass,
  primaryButtonClass,
  secondaryButtonClass,
  textInputClass,
} from '../lib/ui';
import { authClient } from '../lib/admin-auth-client';

type AdminAuthMode =
  | 'callback'
  | 'email-verification'
  | 'forgot-password'
  | 'reset-password'
  | 'sign-in'
  | 'sign-out';

interface AdminAuthViewProps {
  error: string;
  mode: AdminAuthMode;
  token: string;
}

interface AdminAuthErrorShape {
  message?: string;
}

interface AdminAuthResponseShape {
  error?: AdminAuthErrorShape | null;
}

interface AdminAuthClientShape {
  forgetPassword: (input: {
    email: string;
    redirectTo: string;
  }) => Promise<AdminAuthResponseShape>;
  resetPassword: (input: {
    newPassword: string;
    token: string;
  }) => Promise<AdminAuthResponseShape>;
  signIn: {
    email: (input: {
      callbackURL: string;
      email: string;
      password: string;
    }) => Promise<AdminAuthResponseShape>;
  };
  signOut: () => Promise<AdminAuthResponseShape>;
}

const adminAuthClient = authClient as unknown as AdminAuthClientShape;

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function getResponseErrorMessage(
  response: AdminAuthResponseShape
): string | null {
  return response.error?.message ?? null;
}

/**
 * Renders the admin auth view that matches the current sign-in sub-route.
 */
export function AdminAuthView({ error, mode, token }: AdminAuthViewProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const routeErrorMessage =
    mode === 'sign-in' && error === 'invalid-credentials'
      ? 'Invalid email or password.'
      : null;

  useEffect(() => {
    if (mode !== 'sign-out') {
      return;
    }

    let isCancelled = false;

    async function signOutAdmin() {
      setIsPending(true);
      setErrorMessage(null);
      setMessage('Signing you out…');

      try {
        const response = await adminAuthClient.signOut();
        const responseError = getResponseErrorMessage(response);

        if (responseError) {
          throw new Error(responseError);
        }

        if (!isCancelled) {
          window.location.assign(ADMIN_SIGN_IN_ROUTE_PREFIX);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error));
          setMessage(null);
          setIsPending(false);
        }
      }
    }

    void signOutAdmin();

    return () => {
      isCancelled = true;
    };
  }, [mode]);

  async function handleSignIn(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setIsPending(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await adminAuthClient.signIn.email({
        email,
        password,
        callbackURL: ADMIN_HOME_ROUTE_PATH,
      });
      const responseError = getResponseErrorMessage(response);

      if (responseError) {
        throw new Error(responseError);
      }

      window.location.assign(ADMIN_HOME_ROUTE_PATH);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsPending(false);
    }
  }

  async function handleForgotPassword(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim();

    setIsPending(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await adminAuthClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}${ADMIN_RESET_PASSWORD_ROUTE_PATH}`,
      });
      const responseError = getResponseErrorMessage(response);

      if (responseError) {
        throw new Error(responseError);
      }

      setMessage(
        'If that email belongs to an admin account, a reset link is on the way.'
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  async function handleResetPassword(formData: FormData) {
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!token) {
      setErrorMessage('Reset token is missing from this link.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await adminAuthClient.resetPassword({
        token,
        newPassword: password,
      });
      const responseError = getResponseErrorMessage(response);

      if (responseError) {
        throw new Error(responseError);
      }

      setMessage(
        'Password updated. You can now sign in with your new password.'
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  function renderBody() {
    if (mode === 'forgot-password') {
      return (
        <>
          <AuthCopy
            title='Reset admin password'
            description='Request a password-reset link for an allowlisted admin account.'
          />
          <AdminAuthForm
            isPending={isPending}
            submitLabel='Send reset link'
            onSubmit={handleForgotPassword}
          >
            <label className='grid gap-2 text-sm font-medium'>
              <span>Email</span>
              <input
                autoComplete='email'
                className={textInputClass}
                name='email'
                placeholder='admin@example.com'
                required
                type='email'
              />
            </label>
          </AdminAuthForm>
          <FooterLinks
            links={[
              {
                label: 'Back to sign in',
                params: getAdminAuthRouteParams(),
                search: getAdminAuthRouteSearch(),
                to: ADMIN_SIGN_IN_ROUTE_PATH,
              },
            ]}
          />
        </>
      );
    }

    if (mode === 'reset-password') {
      return (
        <>
          <AuthCopy
            title='Choose a new password'
            description='Finish the password reset flow for your admin account.'
          />
          <AdminAuthForm
            isPending={isPending}
            submitLabel='Update password'
            onSubmit={handleResetPassword}
          >
            <label className='grid gap-2 text-sm font-medium'>
              <span>New password</span>
              <input
                autoComplete='new-password'
                className={textInputClass}
                minLength={8}
                name='password'
                required
                type='password'
              />
            </label>
            <label className='grid gap-2 text-sm font-medium'>
              <span>Confirm password</span>
              <input
                autoComplete='new-password'
                className={textInputClass}
                minLength={8}
                name='passwordConfirm'
                required
                type='password'
              />
            </label>
          </AdminAuthForm>
          <FooterLinks
            links={[
              {
                label: 'Back to sign in',
                params: getAdminAuthRouteParams(),
                search: getAdminAuthRouteSearch(),
                to: ADMIN_SIGN_IN_ROUTE_PATH,
              },
            ]}
          />
        </>
      );
    }

    if (mode === 'sign-out') {
      return (
        <>
          <AuthCopy
            title='Signing out'
            description='Your admin session is being cleared now.'
          />
          <div className='flex flex-wrap gap-3'>
            <Link className={secondaryButtonClass} to={ADMIN_HOME_ROUTE_PATH}>
              Return home
            </Link>
          </div>
        </>
      );
    }

    if (mode === 'callback' || mode === 'email-verification') {
      return (
        <>
          <AuthCopy
            title='Check your authentication flow'
            description='Complete the redirect or email verification step, then return to the admin console.'
          />
          <div className='flex flex-wrap gap-3'>
            <Link
              className={primaryButtonClass}
              params={getAdminAuthRouteParams()}
              search={getAdminAuthRouteSearch()}
              to={ADMIN_SIGN_IN_ROUTE_PATH}
            >
              Back to sign in
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        <AuthCopy
          title='Admin sign in'
          description=''
        />
        <AdminAuthForm
          isPending={isPending}
          submitLabel='Sign in'
          onSubmit={handleSignIn}
        >
          <label className='grid gap-2 text-sm font-medium'>
            <span>Email</span>
            <input
              autoComplete='email'
              className={textInputClass}
              name='email'
              placeholder='admin@example.com'
              required
              type='email'
            />
          </label>
          <label className='grid gap-2 text-sm font-medium'>
            <span>Password</span>
            <input
              autoComplete='current-password'
              className={textInputClass}
              name='password'
              required
              type='password'
            />
          </label>
        </AdminAuthForm>
        <FooterLinks
          links={[
            {
              label: 'Forgot password',
              params: getAdminAuthRouteParams('forgot-password'),
              search: getAdminAuthRouteSearch(),
              to: ADMIN_SIGN_IN_ROUTE_PATH,
            },
          ]}
        />
      </>
    );
  }

  return (
    <main
      className={`${pageContainerClass} grid min-h-screen place-items-center py-10`}
    >
      <section
        className={`${cardClass} w-full max-w-[560px] space-y-6 p-7 sm:p-9`}
      >
        <div className='space-y-3'>
          <span className={badgeClass}>Admin Auth</span>
          {renderBody()}
        </div>

        {message ? (
          <p className='m-0 rounded-[18px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-[var(--admin-ink)]'>
            {message}
          </p>
        ) : null}
        {(errorMessage ?? routeErrorMessage) ? (
          <p className={`${dangerCardClass} m-0 px-4 py-3 text-sm`}>
            {errorMessage ?? routeErrorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function AuthCopy({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className='space-y-2'>
      <h1 className='m-0 text-3xl font-semibold tracking-[-0.03em]'>{title}</h1>
      <p className='m-0 text-sm leading-7 text-[var(--admin-ink-soft)]'>
        {description}
      </p>
    </div>
  );
}

function AdminAuthForm({
  children,
  isPending,
  onSubmit,
  submitLabel,
}: {
  children: React.ReactNode;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form
      className='grid gap-4'
      onSubmit={event => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      {children}
      <button className={primaryButtonClass} disabled={isPending} type='submit'>
        {isPending ? 'Working…' : submitLabel}
      </button>
    </form>
  );
}

function FooterLinks({
  links,
}: {
  links: Array<{
    label: string;
    params: ReturnType<typeof getAdminAuthRouteParams>;
    search: ReturnType<typeof getAdminAuthRouteSearch>;
    to: typeof ADMIN_SIGN_IN_ROUTE_PATH;
  }>;
}) {
  return (
    <div className='flex flex-wrap gap-3'>
      {links.map(link => (
        <Link
          key={`${link.to}-${link.params._splat}`}
          className={secondaryButtonClass}
          params={link.params}
          search={link.search}
          to={link.to}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
