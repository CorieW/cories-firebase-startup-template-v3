/**
 * Tests logger helpers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  Logger,
  LogLevel,
  configureLogger,
  logger,
  parseLogSeverity,
} from '../src/utils';

describe('LogLevel enum', () => {
  it('should have correct numeric values', () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.SILENT).toBe(4);
  });
});

describe('parseLogSeverity', () => {
  it('parses valid log levels', () => {
    expect(parseLogSeverity('debug')).toBe('debug');
    expect(parseLogSeverity(' info ')).toBe('info');
    expect(parseLogSeverity('WARN', 'debug')).toBe('warn');
    expect(parseLogSeverity('silent')).toBe('silent');
  });

  it('falls back for missing or invalid values', () => {
    expect(parseLogSeverity(undefined, 'debug')).toBe('debug');
    expect(parseLogSeverity('verbose', 'warn')).toBe('warn');
  });
});

describe('Logger class', () => {
  let testLogger: Logger;
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Create spies for console methods
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore all console methods
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should default to INFO level when no level is provided', () => {
      testLogger = new Logger();
      expect(testLogger.getLevel()).toBe(LogLevel.INFO);
    });

    it('should set the provided log level', () => {
      testLogger = new Logger(LogLevel.DEBUG);
      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('setLevel and getLevel', () => {
    beforeEach(() => {
      testLogger = new Logger();
    });

    it('should set and get log level correctly', () => {
      testLogger.setLevel(LogLevel.ERROR);
      expect(testLogger.getLevel()).toBe(LogLevel.ERROR);
    });

    it('should update log level multiple times', () => {
      testLogger.setLevel(LogLevel.DEBUG);
      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG);

      testLogger.setLevel(LogLevel.SILENT);
      expect(testLogger.getLevel()).toBe(LogLevel.SILENT);
    });
  });

  describe('debug method', () => {
    it('should log debug messages when level is DEBUG', () => {
      testLogger = new Logger(LogLevel.DEBUG);
      testLogger.debug('debug message', { data: 'test' });

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[DEBUG]',
        'debug message',
        { data: 'test' }
      );
    });

    it('should not log debug messages when level is INFO or higher', () => {
      testLogger = new Logger(LogLevel.INFO);
      testLogger.debug('debug message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages when level is SILENT', () => {
      testLogger = new Logger(LogLevel.SILENT);
      testLogger.debug('debug message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('info method', () => {
    it('should log info messages when level is DEBUG', () => {
      testLogger = new Logger(LogLevel.DEBUG);
      testLogger.info('info message', 123);

      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[INFO]',
        'info message',
        123
      );
    });

    it('should log info messages when level is INFO', () => {
      testLogger = new Logger(LogLevel.INFO);
      testLogger.info('info message');

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'info message');
    });

    it('should not log info messages when level is WARN or higher', () => {
      testLogger = new Logger(LogLevel.WARN);
      testLogger.info('info message');

      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('warn method', () => {
    it('should log warn messages when level is DEBUG, INFO, or WARN', () => {
      const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN];

      levels.forEach(level => {
        consoleSpy.warn.mockClear();
        testLogger = new Logger(level);
        testLogger.warn('warning message', { warning: true });

        expect(consoleSpy.warn).toHaveBeenCalledWith(
          '[WARN]',
          'warning message',
          { warning: true }
        );
      });
    });

    it('should not log warn messages when level is ERROR or SILENT', () => {
      const levels = [LogLevel.ERROR, LogLevel.SILENT];

      levels.forEach(level => {
        consoleSpy.warn.mockClear();
        testLogger = new Logger(level);
        testLogger.warn('warning message');

        expect(consoleSpy.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('error method', () => {
    it('should log error messages when level is DEBUG, INFO, WARN, or ERROR', () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
      ];

      levels.forEach(level => {
        consoleSpy.error.mockClear();
        testLogger = new Logger(level);
        const errorObj = new Error('test error');
        testLogger.error('error message', errorObj);

        expect(consoleSpy.error).toHaveBeenCalledWith(
          '[ERROR]',
          'error message',
          errorObj
        );
      });
    });

    it('should not log error messages when level is SILENT', () => {
      testLogger = new Logger(LogLevel.SILENT);
      testLogger.error('error message');

      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('log method (alias for info)', () => {
    it('should behave exactly like info method', () => {
      testLogger = new Logger(LogLevel.INFO);
      testLogger.log('log message', { data: 'test' });

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'log message', {
        data: 'test',
      });
    });

    it('should not log when level is WARN or higher', () => {
      testLogger = new Logger(LogLevel.WARN);
      testLogger.log('log message');

      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('multiple arguments handling', () => {
    beforeEach(() => {
      testLogger = new Logger(LogLevel.DEBUG);
    });

    it('should handle multiple arguments for debug', () => {
      testLogger.debug('message', 1, 2, 3, { obj: true }, [1, 2, 3]);
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[DEBUG]',
        'message',
        1,
        2,
        3,
        { obj: true },
        [1, 2, 3]
      );
    });

    it('should handle multiple arguments for info', () => {
      testLogger.info('message', 'arg1', 'arg2');
      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[INFO]',
        'message',
        'arg1',
        'arg2'
      );
    });

    it('should handle multiple arguments for warn', () => {
      testLogger.warn('message', { warning: true });
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', 'message', {
        warning: true,
      });
    });

    it('should handle multiple arguments for error', () => {
      const error = new Error('test');
      testLogger.error('message', error, 'context');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR]',
        'message',
        error,
        'context'
      );
    });
  });

  describe('log level transitions', () => {
    beforeEach(() => {
      testLogger = new Logger(LogLevel.DEBUG);
    });

    it('should respect level changes during runtime', () => {
      // Start with DEBUG level - should log everything
      testLogger.debug('debug1');
      testLogger.info('info1');
      testLogger.warn('warn1');
      testLogger.error('error1');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Change to WARN level - should only log warn and error
      testLogger.setLevel(LogLevel.WARN);
      testLogger.debug('debug2');
      testLogger.info('info2');
      testLogger.warn('warn2');
      testLogger.error('error2');

      // Counts should not increase for debug and info
      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      // Counts should increase for warn and error
      expect(consoleSpy.warn).toHaveBeenCalledTimes(2);
      expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    });
  });
});

describe('default logger instance', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Create spies for console methods
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore all console methods and reset logger to INFO level
    vi.restoreAllMocks();
    logger.setLevel(LogLevel.INFO);
  });

  it('should be an instance of Logger', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should default to INFO level', () => {
    expect(logger.getLevel()).toBe(LogLevel.INFO);
  });

  it('should work with all logging methods', () => {
    logger.setLevel(LogLevel.DEBUG);

    logger.debug('debug test');
    logger.info('info test');
    logger.warn('warn test');
    logger.error('error test');
    logger.log('log test');

    expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG]', 'debug test');
    expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'info test');
    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', 'warn test');
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'error test');
    expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'log test');
  });

  it('should maintain state between calls', () => {
    logger.setLevel(LogLevel.ERROR);

    logger.info('should not log');
    logger.error('should log');

    expect(consoleSpy.info).not.toHaveBeenCalled();
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'should log');
  });

  it('configureLogger accepts string severities', () => {
    configureLogger('debug');
    expect(logger.getLevel()).toBe(LogLevel.DEBUG);

    configureLogger('silent');
    expect(logger.getLevel()).toBe(LogLevel.SILENT);
  });
});

describe('edge cases', () => {
  let testLogger: Logger;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    testLogger = new Logger();
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle empty arguments', () => {
    testLogger.info();
    expect(consoleSpy).toHaveBeenCalledWith('[INFO]');
  });

  it('should handle null and undefined values', () => {
    testLogger.info('message', null, undefined);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[INFO]',
      'message',
      null,
      undefined
    );
  });

  it('should handle complex objects', () => {
    const complexObj = {
      nested: { deep: { value: 'test' } },
      array: [1, 2, { inner: true }],
      func: () => 'test',
      date: new Date('2023-01-01'),
    };

    testLogger.info('complex', complexObj);
    expect(consoleSpy).toHaveBeenCalledWith('[INFO]', 'complex', complexObj);
  });
});
