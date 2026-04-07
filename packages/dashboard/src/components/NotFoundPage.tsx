/**
 * Root 404 component.
 */
import { useMemo } from 'react';
import { SUPPORT_ROUTE_PATH } from '../lib/route-paths';
import {
  contentWrapClass,
  pageContainerClass,
  panelClass,
  subtleActionClass,
} from '../lib/ui';
import { useToast } from './toast/ToastProvider';

const HOME_ROUTE_PATH = '/';
const FALLBACK_PATH_LABEL = 'this page';

/**
 * Renders the global 404 state for unknown URLs.
 */
export default function NotFoundPage() {
  const { toast } = useToast();
  const requestedPath = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.pathname;
  }, []);

  const handleGoBack = () => {
    if (typeof window === 'undefined') {
      return;
    }

    toast.info({
      title: 'Going back',
      description: 'Returning you to the previous page.',
    });
    window.history.back();
  };

  const pathLabel = requestedPath || FALLBACK_PATH_LABEL;

  return (
    <main className={`${pageContainerClass} ${contentWrapClass}`}>
      <section className={`${panelClass} grid gap-6 p-6 sm:p-8`}>
        <div className='grid gap-3'>
          <p className='m-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
            Error 404
          </p>
          <h1 className='m-0 text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.04] font-extrabold tracking-[-0.03em]'>
            We could not find {pathLabel}
          </h1>
          <p className='m-0 max-w-[64ch] text-[var(--ink-soft)] leading-[1.65]'>
            The link may be outdated, or the page may have moved. Use one of the
            options below to keep going.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <a href={HOME_ROUTE_PATH} className={subtleActionClass}>
            Go to home
          </a>
          <a href={SUPPORT_ROUTE_PATH} className={subtleActionClass}>
            Visit support
          </a>
          <button
            type='button'
            onClick={handleGoBack}
            className={`${subtleActionClass} cursor-pointer bg-[var(--surface)]`}
          >
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
