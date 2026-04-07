/**
 * Theme switcher component for the marketing site.
 */
import { SharedThemeToggle } from '../../../common/src/client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { logMarketingEvent } from '../lib/marketing-logging';

interface ThemeToggleProps {
  fullWidth?: boolean;
}

/**
 * Lets visitors switch between light, dark, and system modes.
 */
export default function ThemeToggle({ fullWidth = false }: ThemeToggleProps) {
  return (
    <SharedThemeToggle
      buttonClassName='min-h-9'
      fullWidth={fullWidth}
      icons={{
        light: Sun,
        dark: Moon,
        system: Monitor,
      }}
      onModeChange={nextMode => {
        logMarketingEvent('themeChange', {
          preference: nextMode,
        });
      }}
    />
  );
}
