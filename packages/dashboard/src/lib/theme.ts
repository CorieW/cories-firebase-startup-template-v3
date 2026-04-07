/**
 * Theme state and DOM helpers.
 */
import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyThemeMode,
  normalizeThemeMode as normalizeSharedThemeMode,
  readThemeMode as readSharedThemeMode,
  type ThemeMode,
} from "@cories-firebase-startup-template-v3/common/client";

export {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyThemeMode,
  type ThemeMode,
  parseThemeMode,
  resolveThemeMode,
} from "@cories-firebase-startup-template-v3/common/client";

/**
 * Keeps the dashboard fallback aligned with its existing tests and UX.
 */
export function normalizeThemeMode(mode: string | null | undefined): ThemeMode {
  return normalizeSharedThemeMode(mode, "dark");
}

/**
 * Keeps the dashboard fallback aligned with its existing tests and UX.
 */
export function readThemeMode(root: HTMLElement): ThemeMode {
  return readSharedThemeMode(root, "dark");
}
