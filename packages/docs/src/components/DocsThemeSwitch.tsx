/**
 * Shared-theme toggle used by the docs navigation shell.
 */
import { SharedThemeToggle } from '@cories-firebase-startup-template-v3/common/client';
import { Monitor, Moon, Sun } from 'lucide-react';

/**
 * Renders the docs theme control using the shared theme storage and DOM model.
 */
export default function DocsThemeSwitch() {
  return (
    <div data-testid='docs-theme-switch' className='min-w-[13rem]'>
      <SharedThemeToggle
        fullWidth={false}
        buttonClassName='px-2.5 py-1.5 text-[0.72rem]'
        icons={{
          dark: Moon,
          light: Sun,
          system: Monitor,
        }}
      />
    </div>
  );
}
