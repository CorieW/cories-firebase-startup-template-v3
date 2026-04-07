/**
 * App-wide toast provider and helpers.
 */
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastPayload {
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastEntry extends ToastPayload {
  id: string;
  variant: ToastVariant;
  isVisible: boolean;
}

interface ToastApi {
  show: (variant: ToastVariant, payload: ToastPayload) => string;
  success: (payload: ToastPayload) => string;
  error: (payload: ToastPayload) => string;
  warning: (payload: ToastPayload) => string;
  info: (payload: ToastPayload) => string;
  dismiss: (id: string) => void;
}

const DEFAULT_TOAST_DURATION_MS: Record<ToastVariant, number> = {
  success: 2800,
  error: 5200,
  warning: 4200,
  info: 3200,
};

const MAX_VISIBLE_TOASTS = 4;
const TOAST_EXIT_DURATION_MS = 200;

const noopToastApi: ToastApi = {
  show: () => '',
  success: () => '',
  error: () => '',
  warning: () => '',
  info: () => '',
  dismiss: () => {
    return;
  },
};

const ToastContext = createContext<ToastApi>(noopToastApi);

const TOAST_VARIANT_META = {
  success: {
    Icon: CheckCircle2,
    label: 'Success',
    toneClass:
      'border-[var(--success)] bg-[var(--success-surface)] text-[var(--ink)]',
    iconClass: 'text-[var(--success)]',
  },
  error: {
    Icon: XCircle,
    label: 'Error',
    toneClass:
      'border-[var(--danger)] bg-[var(--danger-surface)] text-[var(--ink)]',
    iconClass: 'text-[var(--danger)]',
  },
  warning: {
    Icon: AlertTriangle,
    label: 'Warning',
    toneClass:
      'border-[var(--warning)] bg-[var(--warning-surface)] text-[var(--ink)]',
    iconClass: 'text-[var(--warning)]',
  },
  info: {
    Icon: Info,
    label: 'Info',
    toneClass:
      'border-[var(--info)] bg-[var(--info-surface)] text-[var(--ink)]',
    iconClass: 'text-[var(--info)]',
  },
} as const;

function createToastId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeToastText(value?: string): string | undefined {
  if (!value) {
    return value;
  }

  return value.replace(
    /^([\s"'([{]*)([a-z])(?=[a-z]|\b)/,
    (_, prefix: string, character: string) =>
      `${prefix}${character.toUpperCase()}`
  );
}

function normalizeToastPayload(payload: ToastPayload): ToastPayload {
  return {
    ...payload,
    title: normalizeToastText(payload.title) ?? payload.title,
    description: normalizeToastText(payload.description),
  };
}

/**
 * Toast provider that centralizes short-lived user feedback messages.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const autoDismissTimersRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const enterTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clearAutoDismissTimer = useCallback((id: string) => {
    const timer = autoDismissTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      autoDismissTimersRef.current.delete(id);
    }
  }, []);

  const clearExitTimer = useCallback((id: string) => {
    const timer = exitTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      exitTimersRef.current.delete(id);
    }
  }, []);

  const clearEnterTimer = useCallback((id: string) => {
    const timer = enterTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      enterTimersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearAutoDismissTimer(id);
      setToasts(previous => {
        let hasMatchingToast = false;
        const nextToasts = previous.map(currentToast => {
          if (currentToast.id !== id) {
            return currentToast;
          }

          hasMatchingToast = true;
          if (!currentToast.isVisible) {
            return currentToast;
          }

          return { ...currentToast, isVisible: false };
        });

        if (hasMatchingToast && !exitTimersRef.current.has(id)) {
          const exitTimer = setTimeout(() => {
            setToasts(current =>
              current.filter(currentToast => currentToast.id !== id)
            );
            clearExitTimer(id);
            clearEnterTimer(id);
          }, TOAST_EXIT_DURATION_MS);

          exitTimersRef.current.set(id, exitTimer);
        }

        return nextToasts;
      });
    },
    [clearAutoDismissTimer, clearEnterTimer, clearExitTimer]
  );

  const show = useCallback(
    (variant: ToastVariant, payload: ToastPayload) => {
      const id = createToastId();
      const normalizedPayload = normalizeToastPayload(payload);
      const durationMs =
        normalizedPayload.durationMs ?? DEFAULT_TOAST_DURATION_MS[variant];

      setToasts(previous => {
        if (previous.length < MAX_VISIBLE_TOASTS) {
          return [
            ...previous,
            {
              ...normalizedPayload,
              durationMs,
              id,
              variant,
              isVisible: false,
            },
          ];
        }

        const [oldestToast, ...rest] = previous;
        clearAutoDismissTimer(oldestToast.id);
        clearExitTimer(oldestToast.id);
        clearEnterTimer(oldestToast.id);
        return [
          ...rest,
          {
            ...normalizedPayload,
            durationMs,
            id,
            variant,
            isVisible: false,
          },
        ];
      });

      if (typeof window !== 'undefined') {
        const enterTimer = setTimeout(() => {
          setToasts(current =>
            current.map(currentToast =>
              currentToast.id === id
                ? { ...currentToast, isVisible: true }
                : currentToast
            )
          );
          clearEnterTimer(id);
        }, 12);
        enterTimersRef.current.set(id, enterTimer);

        const timerId = setTimeout(() => {
          dismiss(id);
        }, durationMs);

        autoDismissTimersRef.current.set(id, timerId);
      }

      return id;
    },
    [clearAutoDismissTimer, clearEnterTimer, clearExitTimer, dismiss]
  );

  useEffect(() => {
    return () => {
      autoDismissTimersRef.current.forEach(timerId => {
        clearTimeout(timerId);
      });
      autoDismissTimersRef.current.clear();
      exitTimersRef.current.forEach(timerId => {
        clearTimeout(timerId);
      });
      exitTimersRef.current.clear();
      enterTimersRef.current.forEach(timerId => {
        clearTimeout(timerId);
      });
      enterTimersRef.current.clear();
    };
  }, []);

  const toastApi = useMemo<ToastApi>(
    () => ({
      show,
      success: payload => show('success', payload),
      error: payload => show('error', payload),
      warning: payload => show('warning', payload),
      info: payload => show('info', payload),
      dismiss,
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div
        aria-live='polite'
        aria-atomic='false'
        className='pointer-events-none fixed right-4 top-4 z-[220] grid w-[min(25rem,calc(100vw-2rem))] gap-2 min-[980px]:top-20'
      >
        {toasts.map(toast => {
          const variantMeta = TOAST_VARIANT_META[toast.variant];
          const role = toast.variant === 'error' ? 'alert' : 'status';

          return (
            <article
              key={toast.id}
              role={role}
              className={`pointer-events-auto rounded-[14px] border p-3 transition-all duration-200 ease-out ${toast.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'} ${variantMeta.toneClass}`}
            >
              <div className='flex gap-2.5'>
                <variantMeta.Icon
                  aria-hidden='true'
                  className={`mt-[0.1rem] h-[1rem] w-[1rem] shrink-0 ${variantMeta.iconClass}`}
                />
                <div className='min-w-0 flex-1'>
                  <p className='m-0 text-sm font-semibold'>{toast.title}</p>
                  {toast.description ? (
                    <p className='mb-0 mt-1 text-xs leading-5 text-[var(--ink-soft)]'>
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type='button'
                  onClick={() => {
                    dismiss(toast.id);
                  }}
                  aria-label={`Dismiss ${variantMeta.label} notification`}
                  className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-transparent text-[var(--ink-soft)] transition-[background-color,border-color,color] hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
                >
                  <X aria-hidden='true' className='h-4 w-4' />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook that exposes the shared toast API.
 */
export function useToast(): { toast: ToastApi } {
  const toast = useContext(ToastContext);
  return { toast };
}
