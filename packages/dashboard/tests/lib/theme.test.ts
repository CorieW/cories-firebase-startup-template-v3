// @vitest-environment jsdom

/**
 * Tests theme helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyThemeMode,
  normalizeThemeMode,
  parseThemeMode,
  readThemeMode,
  resolveThemeMode,
} from '@/lib/theme'

beforeEach(() => {
  window.localStorage.clear()
})

describe('parseThemeMode', () => {
  it('returns null for unsupported values', () => {
    expect(parseThemeMode(undefined)).toBeNull()
    expect(parseThemeMode('auto')).toBeNull()
    expect(parseThemeMode('dark')).toBe('dark')
  })
})

describe('normalizeThemeMode', () => {
  it('defaults invalid values to dark mode', () => {
    expect(normalizeThemeMode(undefined)).toBe('dark')
    expect(normalizeThemeMode('auto')).toBe('dark')
    expect(normalizeThemeMode('light')).toBe('light')
    expect(normalizeThemeMode('system')).toBe('system')
  })
})

describe('resolveThemeMode', () => {
  it('maps system mode from the OS preference', () => {
    expect(resolveThemeMode('system', true)).toBe('dark')
    expect(resolveThemeMode('system', false)).toBe('light')
    expect(resolveThemeMode('light', true)).toBe('light')
    expect(resolveThemeMode('dark', false)).toBe('dark')
  })
})

describe('applyThemeMode', () => {
  it('writes classes, attributes, and color scheme', () => {
    const root = document.createElement('html')
    root.classList.add('light')

    applyThemeMode('system', root, true)

    expect(root.classList.contains('dark')).toBe(true)
    expect(root.classList.contains('light')).toBe(false)
    expect(root.getAttribute('data-theme')).toBe('dark')
    expect(root.getAttribute('data-theme-preference')).toBe('system')
    expect(root.style.colorScheme).toBe('dark')
  })

  it('dispatches a themechange event with preference and resolved mode', () => {
    const root = document.createElement('html')
    const listener = vi.fn()

    window.addEventListener('themechange', listener as EventListener)
    applyThemeMode('light', root, true)
    window.removeEventListener('themechange', listener as EventListener)

    expect(listener).toHaveBeenCalledTimes(1)
    const event = listener.mock.calls[0]?.[0] as CustomEvent
    expect(event.detail).toEqual({
      preference: 'light',
      resolved: 'light',
    })
  })
})

describe('readThemeMode', () => {
  it('falls back to the applied root theme when preference is missing', () => {
    const root = document.createElement('html')
    root.setAttribute('data-theme', 'light')

    expect(readThemeMode(root)).toBe('light')
  })

  it('prefers explicit document theme preference over storage and resolved theme', () => {
    const root = document.createElement('html')
    root.setAttribute('data-theme-preference', 'system')
    root.setAttribute('data-theme', 'light')
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    expect(readThemeMode(root)).toBe('system')
  })

  it('falls back to localStorage value when preference is missing', () => {
    const root = document.createElement('html')
    root.setAttribute('data-theme', 'light')
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    expect(readThemeMode(root)).toBe('dark')
  })

  it('ignores unsupported values and defaults to dark', () => {
    const root = document.createElement('html')
    root.setAttribute('data-theme', 'unsupported')
    window.localStorage.setItem(THEME_STORAGE_KEY, 'auto')

    expect(readThemeMode(root)).toBe('dark')
  })
})
