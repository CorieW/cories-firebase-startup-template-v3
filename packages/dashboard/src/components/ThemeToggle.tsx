/**
 * Theme switcher component.
 */
import { SharedThemeToggle } from '../../../common/src/client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useToast } from './toast/ToastProvider';

interface ThemeToggleProps {
  fullWidth?: boolean;
}

export default function ThemeToggle({ fullWidth = true }: ThemeToggleProps) {
  const { toast } = useToast();

  return (
    <SharedThemeToggle
      buttonClassName='min-h-8'
      fullWidth={fullWidth}
      icons={{
        light: Sun,
        dark: Moon,
        system: Monitor,
      }}
      onModeChange={nextMode => {
        toast.info({
          title: 'Theme updated',
          description: `Switched to ${nextMode} mode.`,
        });
      }}
    />
  );
}
