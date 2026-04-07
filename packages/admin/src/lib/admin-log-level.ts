/**
 * Admin log-level helpers shared between routes and server modules.
 */
import {
  parseLogSeverity,
  type LogSeverity,
} from '@cories-firebase-startup-template-v3/common';
import { createServerFn } from '@tanstack/react-start';

/**
 * Reads the configured admin log level from the environment.
 */
export function getAdminLogLevel(): LogSeverity {
  return parseLogSeverity(
    process.env.ADMIN_LOG_LEVEL,
    process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  );
}

/**
 * Returns the current admin log level from the server runtime.
 */
export const getAdminLogLevelServer = createServerFn({
  method: 'GET',
}).handler(async () => getAdminLogLevel());
