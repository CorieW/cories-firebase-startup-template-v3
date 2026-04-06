/**
 * Shared logging utilities.
 */
import logger, { LogLevel } from './logger.js';

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type ScopedLogLevel = Exclude<LogSeverity, 'silent'>;

type ScopedLogPayload = Record<string, unknown>;

const MAX_LOG_DEPTH = 4;
const MAX_LOG_ARRAY_ITEMS = 20;
const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_LOG_FIELD_PATTERNS = [
  /pass(word)?/i,
  /secret/i,
  /token/i,
  /credential/i,
  /authorization/i,
  /api[-_]?key/i,
  /private[-_]?key/i,
  /client[-_]?secret/i,
  /refresh[-_]?token/i,
  /id[-_]?token/i,
  /card/i,
  /payment/i,
  /cvv/i,
  /iban/i,
  /account[-_]?number/i,
];
const USER_TEXT_FIELD_PATTERNS = [
  /^message$/i,
  /^text$/i,
  /^html$/i,
  /^prompt$/i,
  /^draft(message)?$/i,
  /^content$/i,
];

function getLoggerMethod(level: LogSeverity): (...args: unknown[]) => void {
  switch (level) {
    case 'debug':
      return logger.debug.bind(logger);
    case 'warn':
      return logger.warn.bind(logger);
    case 'error':
      return logger.error.bind(logger);
    case 'silent':
      return () => undefined;
    case 'info':
    default:
      return logger.info.bind(logger);
  }
}

function getLogLevelForSeverity(level: LogSeverity): LogLevel {
  switch (level) {
    case 'debug':
      return LogLevel.DEBUG;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    case 'silent':
      return LogLevel.SILENT;
    case 'info':
    default:
      return LogLevel.INFO;
  }
}

function isSensitiveLogField(fieldName: string): boolean {
  return SENSITIVE_LOG_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
}

function isUserTextField(fieldName: string): boolean {
  return USER_TEXT_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
}

function buildScopeTag(scope: string, channel?: string): string {
  const normalizedScope = scope.trim();
  const normalizedChannel = channel?.trim();
  return normalizedChannel
    ? `[${normalizedScope}][${normalizedChannel}]`
    : `[${normalizedScope}]`;
}

function buildStructuredPayload(
  scope: string,
  channel: string,
  payload: ScopedLogPayload
) {
  const sanitizedPayload = sanitizeForLogging(payload);

  return {
    scope: scope.trim(),
    channel: channel.trim(),
    ...(typeof sanitizedPayload === 'object' && sanitizedPayload !== null
      ? sanitizedPayload
      : {
          payload: sanitizedPayload,
        }),
  };
}

export function parseLogSeverity(
  value: string | null | undefined,
  fallback: LogSeverity = 'info'
): LogSeverity {
  const normalizedValue = value?.trim().toLowerCase();

  switch (normalizedValue) {
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
    case 'silent':
      return normalizedValue;
    default:
      return fallback;
  }
}

export function configureLogger(
  levelOrSeverity: LogSeverity | LogLevel
): LogLevel {
  const nextLevel =
    typeof levelOrSeverity === 'string'
      ? getLogLevelForSeverity(levelOrSeverity)
      : levelOrSeverity;

  logger.setLevel(nextLevel);
  return nextLevel;
}

export function sanitizeForLogging(
  value: unknown,
  depth = 0,
  fieldName = ''
): unknown {
  if (isSensitiveLogField(fieldName) || isUserTextField(fieldName)) {
    return REDACTED_VALUE;
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return serializeErrorForLogging(value);
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  if (depth >= MAX_LOG_DEPTH) {
    return '[TRUNCATED_DEPTH]';
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_LOG_ARRAY_ITEMS)
      .map(item => sanitizeForLogging(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    sanitized[key] = sanitizeForLogging(entry, depth + 1, key);
  });
  return sanitized;
}

export function serializeErrorForLogging(
  error: unknown
): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { value: sanitizeForLogging(error) };
  }

  const serializedError: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  const errorWithCode = error as Error & {
    code?: unknown;
    customData?: unknown;
    cause?: unknown;
  };

  if (errorWithCode.code !== undefined) {
    serializedError.code = errorWithCode.code;
  }
  if (errorWithCode.customData !== undefined) {
    serializedError.customData = sanitizeForLogging(errorWithCode.customData);
  }
  if (errorWithCode.cause !== undefined) {
    serializedError.cause = sanitizeForLogging(errorWithCode.cause);
  }

  return serializedError;
}

export function logScoped(
  scope: string,
  channel: string,
  payload: ScopedLogPayload,
  level: ScopedLogLevel = 'info'
): void {
  getLoggerMethod(level)(
    buildScopeTag(scope, channel),
    buildStructuredPayload(scope, channel, payload)
  );
}

export function logAction(
  scope: string,
  action: string,
  details: ScopedLogPayload = {},
  level: ScopedLogLevel = 'info'
): void {
  logScoped(
    scope,
    'ACTION',
    {
      action,
      ...details,
    },
    level
  );
}

export function createScopedLogger(scope: string) {
  return {
    log: (
      channel: string,
      payload: ScopedLogPayload,
      level: ScopedLogLevel = 'info'
    ): void => {
      logScoped(scope, channel, payload, level);
    },
    action: (
      action: string,
      details: ScopedLogPayload = {},
      level: ScopedLogLevel = 'info'
    ): void => {
      logAction(scope, action, details, level);
    },
  };
}
