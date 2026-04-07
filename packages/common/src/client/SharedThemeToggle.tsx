/**
 * Shared theme toggle used by the dashboard and marketing apps.
 */
import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  THEME_STORAGE_KEY,
  applyThemeMode,
  readThemeMode,
  type ThemeMode,
} from './theme.js';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
type ThemeIcon = ComponentType<SVGProps<SVGSVGElement>>;

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function getCurrentMode(): ThemeMode {
  return readThemeMode(document.documentElement);
}

interface SharedThemeToggleProps {
  buttonClassName?: string;
  fullWidth?: boolean;
  icons: {
    dark: ThemeIcon;
    light: ThemeIcon;
    system: ThemeIcon;
  };
  onModeChange?: (mode: ThemeMode) => void;
}

/**
 * Lets frontend apps share the same theme preference control while keeping
 * app-specific side effects local to wrapper components.
 */
export function SharedThemeToggle({
  buttonClassName,
  fullWidth = true,
  icons,
  onModeChange,
}: SharedThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode | null>(null);

  useIsomorphicLayoutEffect(() => {
    const syncFromDocument = () => {
      setMode(getCurrentMode());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        syncFromDocument();
      }
    };

    syncFromDocument();
    applyThemeMode(getCurrentMode(), document.documentElement);

    window.addEventListener('themechange', syncFromDocument as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(
        'themechange',
        syncFromDocument as EventListener
      );
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function setThemeMode(nextMode: ThemeMode) {
    if (mode === nextMode) {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyThemeMode(nextMode, document.documentElement);
    setMode(nextMode);
    onModeChange?.(nextMode);
  }

  const options: Array<{
    Icon: ThemeIcon;
    label: string;
    mode: ThemeMode;
  }> = [
    { mode: 'light', label: 'Light mode', Icon: icons.light },
    { mode: 'dark', label: 'Dark mode', Icon: icons.dark },
    { mode: 'system', label: 'System mode', Icon: icons.system },
  ];

  const rootClass = fullWidth
    ? 'grid w-full grid-cols-3 gap-[0.2rem] rounded-[999px] border border-[var(--line)] bg-[var(--surface-soft)] p-[0.2rem]'
    : 'inline-flex items-center gap-[0.2rem] rounded-[999px] border border-[var(--line)] bg-[var(--surface-soft)] p-[0.2rem]';

  return (
    <div className={rootClass} role='group' aria-label='Theme preference'>
      {options.map(({ mode: optionMode, label, Icon }) => (
        <button
          key={optionMode}
          type='button'
          onClick={() => setThemeMode(optionMode)}
          aria-label={label}
          title={label}
          aria-pressed={mode === optionMode}
          className={joinClassNames(
            'inline-flex items-center justify-center gap-1.5 rounded-[999px] border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-150 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)] [&_svg]:h-[0.95rem] [&_svg]:w-[0.95rem]',
            buttonClassName,
            fullWidth ? 'w-full' : undefined,
            mode === optionMode
              ? 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)]'
              : 'border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
          )}
        >
          <Icon aria-hidden='true' />
          <span>{label.replace(' mode', '')}</span>
        </button>
      ))}
    </div>
  );
}
