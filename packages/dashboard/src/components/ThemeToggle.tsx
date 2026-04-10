/**
 * Theme selector dropdown trigger for the dashboard shell.
 */
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '../lib/cn';
import {
  THEME_STORAGE_KEY,
  type ThemeMode,
  applyThemeMode,
  normalizeThemeMode,
  readThemeMode,
} from '../lib/theme';
import { useToast } from './toast/ToastProvider';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const themeOptions = [
  {
    mode: 'light',
    label: 'Light',
    Icon: Sun,
  },
  {
    mode: 'dark',
    label: 'Dark',
    Icon: Moon,
  },
  {
    mode: 'system',
    label: 'System',
    Icon: Monitor,
  },
] satisfies Array<{
  Icon: typeof Sun;
  label: string;
  mode: ThemeMode;
}>;

/**
 * Returns the icon that best represents the active theme preference.
 */
function getThemeIcon(mode: ThemeMode) {
  return (
    themeOptions.find(option => option.mode === mode)?.Icon ??
    themeOptions[0].Icon
  );
}

/**
 * Renders the dashboard theme picker as an icon-triggered dropdown menu.
 */
export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const { toast } = useToast();

  useIsomorphicLayoutEffect(() => {
    const syncFromDocument = () => {
      setMode(readThemeMode(document.documentElement));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        syncFromDocument();
      }
    };

    syncFromDocument();
    applyThemeMode(
      readThemeMode(document.documentElement),
      document.documentElement
    );

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

  const activeMode = mode ?? 'system';
  const ActiveIcon = getThemeIcon(activeMode);
  const activeLabel =
    themeOptions.find(option => option.mode === activeMode)?.label ?? 'Theme';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type='button'
          aria-label={`Theme preference: ${activeLabel}`}
          title={`Theme: ${activeLabel}`}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-[background-color,border-color,color] duration-150 hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--line-strong)] focus-visible:outline-none data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--surface-soft)]'
          )}
        >
          <ActiveIcon aria-hidden='true' className='h-4.5 w-4.5' />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          collisionPadding={16}
          sideOffset={10}
          className='z-[80] min-w-44 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
        >
          <DropdownMenu.Label className='px-3 pt-1.5 pb-1 text-[0.7rem] font-semibold tracking-[0.08em] text-[var(--ink-soft)] uppercase'>
            Theme
          </DropdownMenu.Label>

          <DropdownMenu.RadioGroup
            value={activeMode}
            onValueChange={value => {
              setThemeMode(normalizeThemeMode(value));
            }}
          >
            {themeOptions.map(({ mode: optionMode, label, Icon }) => (
              <DropdownMenu.RadioItem
                key={optionMode}
                value={optionMode}
                className='flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-[background-color,color] outline-none data-[highlighted]:bg-[var(--surface-soft)] data-[highlighted]:text-[var(--ink)]'
              >
                <Icon aria-hidden='true' className='h-4 w-4 shrink-0' />
                <span className='flex-1'>{label}</span>
                <DropdownMenu.ItemIndicator>
                  <Check
                    aria-hidden='true'
                    className='h-4 w-4 shrink-0 text-[var(--ink)]'
                  />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
