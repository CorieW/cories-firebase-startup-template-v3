/**
 * Applies the shared frontend theme state before the marketing app mounts.
 */
import { syncThemeMode } from '@cories-firebase-startup-template-v3/common/client';

syncThemeMode(document.documentElement);
