/**
 * Common package logging entrypoint with CJS-friendly default export support.
 */
import {
  configureLogger,
  createScopedLogger,
  logAction,
  logScoped,
  parseLogSeverity,
  sanitizeForLogging,
  serializeErrorForLogging,
} from './utils/logging.js';

export type { LogSeverity, ScopedLogLevel } from './utils/logging.js';
export {
  configureLogger,
  createScopedLogger,
  logAction,
  logScoped,
  parseLogSeverity,
  sanitizeForLogging,
  serializeErrorForLogging,
} from './utils/logging.js';

const logging = {
  configureLogger,
  createScopedLogger,
  logAction,
  logScoped,
  parseLogSeverity,
  sanitizeForLogging,
  serializeErrorForLogging,
};

export default logging;
