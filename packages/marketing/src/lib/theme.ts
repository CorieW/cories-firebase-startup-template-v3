/**
 * Theme state and DOM helpers for the marketing site.
 */
export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/**
 * Validates a theme mode string and narrows it to a supported value.
 */
export function parseThemeMode(
  mode: string | null | undefined,
): ThemeMode | null {
  if (mode === "light" || mode === "dark" || mode === "system") {
    return mode;
  }

  return null;
}

/**
 * Resolves a preferred theme mode into the actual visual mode.
 */
export function resolveThemeMode(
  mode: ThemeMode,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (mode === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return mode;
}

function getSystemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function readStoredThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Reads the active theme preference from the document when available.
 */
export function readThemeMode(root: HTMLElement): ThemeMode {
  const fromPreference = parseThemeMode(
    root.getAttribute("data-theme-preference"),
  );
  const fromStorage = readStoredThemeMode();
  const fromResolved = parseThemeMode(root.getAttribute("data-theme"));

  return fromPreference ?? fromStorage ?? fromResolved ?? "system";
}

/**
 * Applies the selected theme mode and notifies the window for listeners.
 */
export function applyThemeMode(
  mode: ThemeMode,
  root: HTMLElement,
  systemPrefersDark = getSystemPrefersDark(),
): void {
  const resolvedMode = resolveThemeMode(mode, systemPrefersDark);

  root.classList.remove("light", "dark");
  root.classList.add(resolvedMode);
  root.setAttribute("data-theme", resolvedMode);
  root.setAttribute("data-theme-preference", mode);
  root.style.colorScheme = resolvedMode;

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: {
          preference: mode,
          resolved: resolvedMode,
        },
      }),
    );
  }
}
