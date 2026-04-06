/**
 * Application logging system with configurable log levels
 * This module provides a Logger class with multiple log levels and a default logger instance
 * for consistent logging across the entire application.
 */

/**
 * Enumeration of available log levels in order of severity
 * Lower numeric values represent more verbose logging
 * Higher numeric values represent less verbose logging
 */
export enum LogLevel {
  /** Most verbose - shows all debug, info, warn, and error messages */
  DEBUG = 0,
  /** Standard logging - shows info, warn, and error messages */
  INFO = 1,
  /** Warning level - shows warn and error messages only */
  WARN = 2,
  /** Error level - shows error messages only */
  ERROR = 3,
  /** Silent - no logging output */
  SILENT = 4,
}

/**
 * Logger class providing configurable logging functionality
 * Supports different log levels and provides methods for debug, info, warn, and error logging
 *
 * @example
 * ```typescript
 * // Create a logger with INFO level
 * const logger = new Logger(LogLevel.INFO);
 *
 * // These will be logged
 * logger.info("Application started");
 * logger.warn("This is a warning");
 * logger.error("An error occurred");
 *
 * // This will NOT be logged (below INFO level)
 * logger.debug("Debug information");
 * ```
 */
export class Logger {
  /** Current log level - messages below this level will not be output */
  private level: LogLevel;

  /**
   * Create a new Logger instance
   * @param level - Initial log level (defaults to INFO)
   */
  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  /**
   * Set the current log level
   * @param level - New log level to use
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   * @returns Current log level
   */
  public getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Log debug messages - only shown when log level is DEBUG
   * Use for detailed debugging information that is not needed in production
   * @param args - Arguments to log
   */
  public debug(...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Log informational messages - shown when log level is INFO or below
   * Use for general application flow information
   * @param args - Arguments to log
   */
  public info(...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Log warning messages - shown when log level is WARN or below
   * Use for potentially problematic situations that don't prevent operation
   * @param args - Arguments to log
   */
  public warn(...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log error messages - shown when log level is ERROR or below
   * Use for error conditions that may prevent normal operation
   * @param args - Arguments to log
   */
  public error(...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * Alias for info() method - logs at INFO level
   * Provided for compatibility with standard console.log usage
   * @param args - Arguments to log
   */
  public log(...args: unknown[]): void {
    this.info(...args);
  }
}

/**
 * Default logger instance configured with INFO level
 * This is the primary logger used throughout the application
 * Import and use this instance for consistent logging behavior
 *
 * @example
 * ```typescript
 * import logger from './logger';
 *
 * logger.info('User logged in');
 * logger.error('Failed to save data', error);
 * ```
 */
export const logger = new Logger();

/** Default export - the pre-configured logger instance */
export default logger;
