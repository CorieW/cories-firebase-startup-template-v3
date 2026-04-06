// @vitest-environment jsdom

/**
 * Tests theme toggle state and document updates.
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ThemeToggle from '@/components/ThemeToggle';
import { ToastProvider } from '@/components/toast/ToastProvider';

function resetThemeRoot() {
  const root = document.documentElement;
  root.className = '';
  root.removeAttribute('data-theme');
  root.removeAttribute('data-theme-preference');
  root.style.colorScheme = '';
  window.localStorage.clear();
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    resetThemeRoot();
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-theme-preference', 'dark');
  });

  afterEach(() => {
    cleanup();
    resetThemeRoot();
  });

  function renderThemeToggle() {
    render(
      <ToastProvider>
        <ThemeToggle fullWidth={false} />
      </ToastProvider>
    );
  }

  it('initializes pressed state from the document preference', () => {
    renderThemeToggle();

    expect(
      screen
        .getByRole('button', { name: 'Dark mode' })
        .getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen
        .getByRole('button', { name: 'Light mode' })
        .getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('writes localStorage and document theme attributes when selecting a mode', async () => {
    renderThemeToggle();

    fireEvent.click(screen.getByRole('button', { name: 'Light mode' }));

    await waitFor(() => {
      expect(window.localStorage.getItem('theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(
        document.documentElement.getAttribute('data-theme-preference')
      ).toBe('light');
      expect(
        screen
          .getByRole('button', { name: 'Light mode' })
          .getAttribute('aria-pressed')
      ).toBe('true');
    });

    expect(screen.getByText('Theme updated')).not.toBeNull();
    expect(screen.getByText('Switched to light mode.')).not.toBeNull();
  });

  it('syncs state when a theme storage event is fired', async () => {
    renderThemeToggle();

    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-preference', 'light');

    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));

    await waitFor(() => {
      expect(
        screen
          .getByRole('button', { name: 'Light mode' })
          .getAttribute('aria-pressed')
      ).toBe('true');
    });
  });
});
