/**
 * Theme switcher component.
 */
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { applyThemeMode, readThemeMode, THEME_STORAGE_KEY } from '../lib/theme';
import type { ThemeMode } from '../lib/theme';
import { useToast } from './toast/ToastProvider';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function getCurrentMode(): ThemeMode {
  return readThemeMode(document.documentElement);
}

interface ThemeToggleProps {
  fullWidth?: boolean;
}

export default function ThemeToggle({ fullWidth = true }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const { toast } = useToast();

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
    toast.info({
      title: 'Theme updated',
      description: `Switched to ${nextMode} mode.`,
    });
  }

  const options: Array<{
    mode: ThemeMode;
    label: string;
    Icon: typeof Sun;
  }> = [
    { mode: 'light', label: 'Light mode', Icon: Sun },
    { mode: 'dark', label: 'Dark mode', Icon: Moon },
    { mode: 'system', label: 'System mode', Icon: Monitor },
  ];

  const rootClass = fullWidth
    ? 'grid w-full grid-cols-3 gap-[0.2rem] rounded-[999px] border border-[color-mix(in_srgb,var(--line)_66%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_82%,var(--surface)_18%)] p-[0.2rem]'
    : 'inline-flex items-center gap-[0.2rem] rounded-[999px] border border-[color-mix(in_srgb,var(--line)_66%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_82%,var(--surface)_18%)] p-[0.2rem]';

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
          className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-[999px] border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] [&_svg]:h-[0.95rem] [&_svg]:w-[0.95rem] ${
            fullWidth ? 'w-full' : ''
          } ${
            mode === optionMode
              ? 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_0_rgba(255,255,255,0.56),0_8px_20px_rgba(17,12,6,0.08)]'
              : 'border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
          }`}
        >
          <Icon aria-hidden='true' />
          <span>{label.replace(' mode', '')}</span>
        </button>
      ))}
    </div>
  );
}
