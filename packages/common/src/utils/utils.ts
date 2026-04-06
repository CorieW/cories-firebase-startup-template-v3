/**
 * General-purpose shared helpers.
 */
import { AuthError } from 'firebase/auth';
import { ZodType } from 'zod';

import {
  ARTIFICIAL_CALLABLE_DELAY,
  DISABLE_CLIENT_SIDE_VALIDATION,
  NETWORK_REQUEST_TIMEOUT_MS,
} from '../global.js';
import {
  getCommonMessages,
  translateCommonMessage,
} from '../messages/index.js';
import { CallableResponseWithData } from '../types/index.js';
import logger from './logger.js';
import {
  createScopedLogger,
  sanitizeForLogging,
  serializeErrorForLogging,
} from './logging.js';

const NETWORK_REQUEST_FAILED_CODE = 'network-request-failed';
const networkLogger = createScopedLogger('NETWORK');
const AUTH_MESSAGE_MARKER = '.auth.';
const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Network error. Please try again.';
const TIMEOUT_MESSAGE = 'Operation timed out.';
const INVALID_CALLABLE_DATA_MESSAGE = 'Invalid response data received';
const VALIDATION_FAILED_MESSAGE = 'Validation failed';

const authMessagesByCode: Record<string, string> = Object.entries(
  getCommonMessages()
).reduce<Record<string, string>>((accumulator, [messageKey, messageValue]) => {
  const markerIndex = messageKey.indexOf(AUTH_MESSAGE_MARKER);
  if (markerIndex < 0) {
    return accumulator;
  }

  const code = messageKey.slice(markerIndex + AUTH_MESSAGE_MARKER.length);
  if (code.length === 0) {
    return accumulator;
  }

  accumulator[code] = messageValue;
  return accumulator;
}, {});

interface CallableValidation {
  schema: ZodType<unknown>;
  data: unknown;
}

interface CallableRequestLoggingMeta {
  operationName?: string;
  requestPayload?: unknown;
  context?: Record<string, unknown>;
}

type CallableRequest =
  | Promise<{ data: unknown }>
  | (() => Promise<{ data: unknown }>);

let networkRequestSequence = 0;

function nextNetworkRequestId(operationName: string): string {
  networkRequestSequence += 1;
  return `${operationName}-${Date.now()}-${networkRequestSequence}`;
}

class CallableStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CallableStatusError';
  }
}

function detectEmbeddedAuthErrorCode(error: {
  customData?: { message?: string };
}): string | undefined {
  const rawMessage = error.customData?.message;
  if (!rawMessage) {
    return undefined;
  }

  return rawMessage.match(/auth\/([a-z-]+)/i)?.[1];
}

export function getFirebaseAuthErrorCode(error: unknown): string | undefined {
  if (isRequestTimeoutError(error)) {
    return 'timeout';
  }

  const authError = error as Partial<AuthError>;
  const rawCode =
    typeof authError.code === 'string' ? authError.code : undefined;
  if (!rawCode) {
    return undefined;
  }

  const code = rawCode.split('auth/')[1] ?? rawCode;
  if (code !== NETWORK_REQUEST_FAILED_CODE) {
    return code;
  }

  return (
    detectEmbeddedAuthErrorCode(
      error as { customData?: { message?: string } }
    ) ?? code
  );
}

/**
 * Converts Firebase Auth error codes to user-friendly localized error messages
 */
export function convertFirebaseAuthErrorToString(error: unknown): string {
  const code = getFirebaseAuthErrorCode(error);
  if (!code) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  if (code === NETWORK_REQUEST_FAILED_CODE) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (authMessagesByCode[code]) {
    return authMessagesByCode[code];
  }

  return UNKNOWN_ERROR_MESSAGE;
}

export class RequestTimeoutError extends Error {
  constructor() {
    super(TIMEOUT_MESSAGE);
    this.name = 'RequestTimeoutError';
  }
}

export function isRequestTimeoutError(
  error: unknown
): error is RequestTimeoutError {
  return error instanceof Error && error.name === 'RequestTimeoutError';
}

export async function withRequestTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = NETWORK_REQUEST_TIMEOUT_MS
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new RequestTimeoutError());
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
}

/**
 * Converts a title string to a URL-friendly slug format
 */
export function titleToSlug(title: string): string {
  title = title.trim();
  title = title.replace(/ /g, '-');
  const url = new URL('https://example.com/' + title);
  const slug = url.pathname.replace(/^\//, '');
  return slug;
}

/**
 * Generic handler for Firebase Cloud Function callable responses
 */
export function handleCallableResponse<TData>(
  callableRequest: CallableRequest,
  errorMessage: string,
  expectData?: true,
  validation?: CallableValidation,
  loggingMeta?: CallableRequestLoggingMeta
): Promise<TData>;
export function handleCallableResponse<TData>(
  callableRequest: CallableRequest,
  errorMessage: string,
  expectData: false,
  validation?: CallableValidation,
  loggingMeta?: CallableRequestLoggingMeta
): Promise<CallableResponseWithData<TData>>;
export async function handleCallableResponse<T>(
  callableRequest: CallableRequest,
  errorMessage: string,
  expectData: boolean = true,
  validation: CallableValidation | undefined = undefined,
  loggingMeta: CallableRequestLoggingMeta | undefined = undefined
): Promise<T | CallableResponseWithData<T>> {
  const localizedErrorMessage = translateCommonMessage(errorMessage);
  const operationName = loggingMeta?.operationName ?? errorMessage;
  const requestId = nextNetworkRequestId(operationName);

  // Useful in development to force loading spinners, no-op in production by default.
  await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_CALLABLE_DELAY));

  // Optionally enforce client-side schema checks before the network round trip.
  if (validation && !DISABLE_CLIENT_SIDE_VALIDATION) {
    validateDataIfEnabled(validation.schema, validation.data);
  }

  const requestStartedAt = Date.now();
  const requestPayload =
    loggingMeta?.requestPayload ??
    (validation && !DISABLE_CLIENT_SIDE_VALIDATION ? validation.data : null);
  networkLogger.log('REQUEST', {
    requestId,
    operationName,
    expectData,
    requestPayload: sanitizeForLogging(requestPayload),
    context: sanitizeForLogging(loggingMeta?.context),
  });

  try {
    const callablePromise =
      typeof callableRequest === 'function'
        ? callableRequest()
        : callableRequest;
    const res = await withRequestTimeout(callablePromise);
    const data = res.data as CallableResponseWithData<T>;
    const requestDurationMs = Date.now() - requestStartedAt;

    networkLogger.log('RESPONSE', {
      requestId,
      operationName,
      requestDurationMs,
      status: data.status,
      hasData: data.data !== null && data.data !== undefined,
      messageKey: data.message,
    });
    if (expectData) {
      networkLogger.log(
        'RESPONSE_DATA',
        {
          requestId,
          operationName,
          data: sanitizeForLogging(data.data),
        },
        'debug'
      );
    }

    // Backends must use 2xx + localized message contract for callable responses.
    if (data.status < 200 || data.status >= 300) {
      throwErrorAndLog(
        new CallableStatusError(translateCommonMessage(data.message))
      );
    }

    // When data is expected, null/undefined means the callable contract was violated.
    if (expectData && (data.data === undefined || data.data === null)) {
      throwErrorAndLog(new Error(INVALID_CALLABLE_DATA_MESSAGE));
    }

    return expectData ? data.data! : data;
  } catch (error) {
    const requestDurationMs = Date.now() - requestStartedAt;
    networkLogger.log(
      'RESPONSE_ERROR',
      {
        requestId,
        operationName,
        requestDurationMs,
        error: serializeErrorForLogging(error),
      },
      'error'
    );
    logger.error(error);

    if (isRequestTimeoutError(error)) {
      throwErrorAndLog(new Error(TIMEOUT_MESSAGE));
    }

    // Preserve server-provided domain errors (for example, team guardrail errors)
    // instead of replacing them with generic operation fallback text.
    if (error instanceof CallableStatusError) {
      throw error;
    }

    throwErrorAndLog(new Error(localizedErrorMessage));
  }
}

export function validateDataIfEnabled<TOutput>(
  schema: ZodType<TOutput>,
  data: unknown
): TOutput {
  if (DISABLE_CLIENT_SIDE_VALIDATION) {
    return data as TOutput;
  }

  // Fail fast with translated field-level validation messages.
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    logger.error(VALIDATION_FAILED_MESSAGE, validationResult.error);
    throw new Error(
      validationResult.error.errors
        .map(error => translateCommonMessage(error.message))
        .join('; ')
    );
  }

  return validationResult.data as TOutput;
}

/**
 * Throws an error and logs it to the console
 */
export function throwErrorAndLog(error: Error): never {
  logger.error(error);
  throw error;
}
