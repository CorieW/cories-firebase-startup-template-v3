/**
 * Tests logging utilities.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createScopedLogger,
  logAction,
  logScoped,
  sanitizeForLogging,
} from '../src/utils/logging';
import logger from '../src/utils/logger';

vi.mock('../src/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

type MockLogger = {
  debug: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

describe('logging utils', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = logger as unknown as MockLogger;
    mockLogger.debug.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  it('logs scoped payloads with default info level', () => {
    logScoped('AUTH', 'REQUEST', { uid: 'user_1' });
    expect(mockLogger.info).toHaveBeenCalledWith('[AUTH][REQUEST]', {
      scope: 'AUTH',
      channel: 'REQUEST',
      uid: 'user_1',
    });
  });

  it('uses selected log level for scoped logs', () => {
    logScoped('AUTH', 'REQUEST', { uid: 'user_1' }, 'debug');
    logScoped('AUTH', 'REQUEST', { uid: 'user_1' }, 'warn');
    logScoped('AUTH', 'REQUEST', { uid: 'user_1' }, 'error');

    expect(mockLogger.debug).toHaveBeenCalledWith('[AUTH][REQUEST]', {
      scope: 'AUTH',
      channel: 'REQUEST',
      uid: 'user_1',
    });
    expect(mockLogger.warn).toHaveBeenCalledWith('[AUTH][REQUEST]', {
      scope: 'AUTH',
      channel: 'REQUEST',
      uid: 'user_1',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('[AUTH][REQUEST]', {
      scope: 'AUTH',
      channel: 'REQUEST',
      uid: 'user_1',
    });
  });

  it('logs actions with merged details payload', () => {
    logAction('THEME', 'changeRequested', { nextTheme: 'dark' });

    expect(mockLogger.info).toHaveBeenCalledWith('[THEME][ACTION]', {
      scope: 'THEME',
      channel: 'ACTION',
      action: 'changeRequested',
      nextTheme: 'dark',
    });
  });

  it('creates scoped loggers that preserve scope tags', () => {
    const scopedLogger = createScopedLogger('BILLING');
    scopedLogger.log('REQUEST', { method: 'POST' }, 'warn');
    scopedLogger.action('submitCheckout', { amount: 1999 }, 'error');

    expect(mockLogger.warn).toHaveBeenCalledWith('[BILLING][REQUEST]', {
      scope: 'BILLING',
      channel: 'REQUEST',
      method: 'POST',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('[BILLING][ACTION]', {
      scope: 'BILLING',
      channel: 'ACTION',
      action: 'submitCheckout',
      amount: 1999,
    });
  });

  it('redacts sensitive fields and message bodies', () => {
    expect(
      sanitizeForLogging({
        apiKey: 'secret',
        privateKey: 'private-value',
        message: 'hello world',
        nested: {
          password: 'abc123',
          text: 'chat body',
        },
      })
    ).toEqual({
      apiKey: '[REDACTED]',
      privateKey: '[REDACTED]',
      message: '[REDACTED]',
      nested: {
        password: '[REDACTED]',
        text: '[REDACTED]',
      },
    });
  });
});
