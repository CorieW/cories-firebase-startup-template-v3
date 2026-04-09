/**
 * Shared browser theme helpers for frontend packages.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export const THEME_STORAGE_KEY = 'theme';
export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const FIXED_DARK_THEME_MODE: ResolvedThemeMode = 'dark';
export const FIXED_DARK_THEME_CLASS_NAME = FIXED_DARK_THEME_MODE;
export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;var parse=function(value){return value==='light'||value==='dark'||value==='system'?value:null;};var fromPreference=parse(root.getAttribute('data-theme-preference'));var fromResolved=(root.getAttribute('data-theme')==='light'||root.getAttribute('data-theme')==='dark')?root.getAttribute('data-theme'):null;var fromClass=root.classList.contains('light')?'light':(root.classList.contains('dark')?'dark':null);var fromStorage=null;try{fromStorage=parse(window.localStorage.getItem('theme'));}catch(e){fromStorage=null;}var pref=fromPreference||fromResolved||fromClass||fromStorage||'system';var systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var mode=pref==='system'?(systemDark?'dark':'light'):pref;root.classList.remove('light','dark');root.classList.add(mode);root.setAttribute('data-theme',mode);root.setAttribute('data-theme-preference',pref);root.style.colorScheme=mode;})();`;

/**
 * Returns a supported theme mode when one is available.
 */
export function parseThemeMode(
  mode: string | null | undefined
): ThemeMode | null {
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    return mode;
  }

  return null;
}

/**
 * Guards unknown inputs and always returns a supported theme mode.
 */
export function normalizeThemeMode(
  mode: string | null | undefined,
  fallback: ThemeMode = DEFAULT_THEME_MODE
): ThemeMode {
  return parseThemeMode(mode) ?? fallback;
}

/**
 * Resolves the final mode used to style the page.
 */
export function resolveThemeMode(
  mode: ThemeMode,
  systemPrefersDark: boolean
): 'light' | 'dark' {
  if (mode === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }

  return mode;
}

function getSystemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function readStoredThemeMode(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return parseThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Reads the current theme preference from the document when it is available.
 */
export function readThemeMode(
  root: HTMLElement,
  fallback: ThemeMode = DEFAULT_THEME_MODE
): ThemeMode {
  const fromPreference = parseThemeMode(
    root.getAttribute('data-theme-preference')
  );
  const fromStorage = readStoredThemeMode();
  const fromResolvedTheme = parseThemeMode(root.getAttribute('data-theme'));

  return fromPreference ?? fromStorage ?? fromResolvedTheme ?? fallback;
}

/**
 * Applies the theme mode to the document root.
 */
export function applyThemeMode(
  mode: ThemeMode,
  root: HTMLElement,
  systemPrefersDark = getSystemPrefersDark()
): void {
  const resolvedMode = resolveThemeMode(mode, systemPrefersDark);

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedMode);
  root.setAttribute('data-theme', resolvedMode);
  root.setAttribute('data-theme-preference', mode);
  root.style.colorScheme = resolvedMode;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: {
          preference: mode,
          resolved: resolvedMode,
        },
      })
    );
  }
}

/**
 * Synchronizes the document root from the current stored or inline theme state.
 */
export function syncThemeMode(
  root: HTMLElement,
  fallback: ThemeMode = DEFAULT_THEME_MODE
): ThemeMode {
  const mode = readThemeMode(root, fallback);

  applyThemeMode(mode, root);

  return mode;
}
