/**
 * Tests shared general utilities.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { CallableResponseWithData } from '../src/types';
import { translateCommonMessage } from '../src/messages';
import {
  convertFirebaseAuthErrorToString,
  getFirebaseAuthErrorCode,
  handleCallableResponse,
  isRequestTimeoutError,
  RequestTimeoutError,
  titleToSlug,
  throwErrorAndLog,
  validateDataIfEnabled,
  withRequestTimeout,
} from '../src/utils';
import logger from '../src/utils/logger';

vi.mock('../src/global', () => ({
  ARTIFICIAL_CALLABLE_DELAY: 0,
  DISABLE_CLIENT_SIDE_VALIDATION: false,
  NETWORK_REQUEST_TIMEOUT_MS: 5000,
}));

vi.mock('../src/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

interface MockLogger {
  error: ReturnType<typeof vi.fn>;
}

function buildCallablePromise<TData>(
  payload: CallableResponseWithData<TData>
): Promise<{ data: CallableResponseWithData<TData> }> {
  return Promise.resolve({ data: payload });
}

describe('titleToSlug', () => {
  it('converts spaces to hyphens and trims edges', () => {
    expect(titleToSlug('  Hello World  ')).toBe('Hello-World');
  });

  it('keeps url-safe punctuation', () => {
    expect(titleToSlug('Build v1.0 now!')).toBe('Build-v1.0-now!');
  });
});

describe('getFirebaseAuthErrorCode', () => {
  it('returns timeout for request timeout errors', () => {
    expect(getFirebaseAuthErrorCode(new RequestTimeoutError())).toBe('timeout');
  });

  it('strips auth prefix from firebase auth error codes', () => {
    expect(
      getFirebaseAuthErrorCode({ code: 'auth/wrong-password' } as unknown)
    ).toBe('wrong-password');
  });

  it('extracts embedded auth error code from network-request-failed errors', () => {
    expect(
      getFirebaseAuthErrorCode({
        code: 'auth/network-request-failed',
        customData: {
          message:
            'Firebase: Error (auth/user-not-found). Please check the account.',
        },
      } as unknown)
    ).toBe('user-not-found');
  });

  it('returns undefined when error does not include a string code', () => {
    expect(getFirebaseAuthErrorCode({ message: 'oops' })).toBeUndefined();
  });
});

describe('convertFirebaseAuthErrorToString', () => {
  it('maps known auth error codes to translated messages', () => {
    expect(
      convertFirebaseAuthErrorToString({ code: 'auth/wrong-password' })
    ).toBe(translateCommonMessage('errors.auth.wrong-password'));
  });

  it('maps network request failures to generic network message', () => {
    expect(
      convertFirebaseAuthErrorToString({ code: 'auth/network-request-failed' })
    ).toBe(translateCommonMessage('errors.network.generic'));
  });

  it('falls back to unknown message for unmapped errors', () => {
    expect(
      convertFirebaseAuthErrorToString({ code: 'auth/not-a-real-code' })
    ).toBe(translateCommonMessage('errors.unknown'));
    expect(convertFirebaseAuthErrorToString({})).toBe(
      translateCommonMessage('errors.unknown')
    );
  });
});

describe('withRequestTimeout and timeout helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns original promise result when timeout is non-positive', async () => {
    await expect(withRequestTimeout(Promise.resolve('ok'), 0)).resolves.toBe(
      'ok'
    );
    await expect(withRequestTimeout(Promise.resolve('ok'), -1)).resolves.toBe(
      'ok'
    );
  });

  it('resolves when promise completes before timeout', async () => {
    vi.useFakeTimers();

    const resultPromise = withRequestTimeout(
      new Promise<string>(resolve => {
        setTimeout(() => resolve('done'), 10);
      }),
      50
    );

    await vi.advanceTimersByTimeAsync(10);
    await expect(resultPromise).resolves.toBe('done');
  });

  it('rejects with RequestTimeoutError when promise exceeds timeout', async () => {
    vi.useFakeTimers();

    const resultPromise = withRequestTimeout(new Promise<string>(() => {}), 25);
    const capturedError = resultPromise.catch(error => error);

    await vi.advanceTimersByTimeAsync(25);
    const error = await capturedError;
    expect(error).toBeInstanceOf(RequestTimeoutError);
    expect(isRequestTimeoutError(error)).toBe(true);
  });
});

describe('validateDataIfEnabled', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = logger as unknown as MockLogger;
    mockLogger.error.mockClear();
  });

  it('returns parsed data when schema is valid', () => {
    const schema = z.object({
      username: z.string(),
    });

    expect(validateDataIfEnabled(schema, { username: 'alice' })).toEqual({
      username: 'alice',
    });
  });

  it('throws translated validation errors when schema validation fails', () => {
    const schema = z.object({
      username: z.string().min(3, 'validation.username.minLength'),
    });

    expect(() => validateDataIfEnabled(schema, { username: 'ab' })).toThrow(
      'Username must be at least {usernameMinLength} characters long'
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      translateCommonMessage('errors.validation.failed'),
      expect.anything()
    );
  });
});

describe('throwErrorAndLog', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = logger as unknown as MockLogger;
    mockLogger.error.mockClear();
  });

  it('logs and throws the same error instance', () => {
    const error = new Error('boom');

    expect(() => throwErrorAndLog(error)).toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(error);
  });
});

describe('handleCallableResponse', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = logger as unknown as MockLogger;
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns callable data when status is 2xx and data exists', async () => {
    const payload = {
      status: 200,
      message: 'Success',
      data: { id: 1, name: 'Test' },
    };

    const result = await handleCallableResponse(
      buildCallablePromise(payload),
      'errors.callable.getUserFailed'
    );

    expect(result).toEqual(payload.data);
  });

  it('returns full response when expectData is false', async () => {
    const payload = {
      status: 200,
      message: 'Success',
    };

    const result = await handleCallableResponse(
      buildCallablePromise(payload),
      'errors.callable.getUserFailed',
      false
    );

    expect(result).toEqual(payload);
  });

  it('defers callable execution when request factory is provided', async () => {
    const payload = {
      status: 200,
      message: 'Success',
      data: { ok: true },
    };
    let requestStarted = false;

    const resultPromise = handleCallableResponse(() => {
      requestStarted = true;
      return buildCallablePromise(payload);
    }, 'errors.callable.getUserFailed');

    expect(requestStarted).toBe(false);
    const result = await resultPromise;
    expect(result).toEqual(payload.data);
    expect(requestStarted).toBe(true);
  });

  it('throws operation-specific fallback message when data is missing', async () => {
    const payload = {
      status: 200,
      message: 'Success',
      data: undefined,
    };

    await expect(
      handleCallableResponse(
        buildCallablePromise(payload),
        'errors.callable.getUserFailed'
      )
    ).rejects.toThrow(translateCommonMessage('errors.callable.getUserFailed'));
  });

  it('throws translated backend message when callable status is non-2xx', async () => {
    const payload = {
      status: 400,
      message: 'errors.callable.getUserFailed',
    };

    await expect(
      handleCallableResponse(
        buildCallablePromise(payload),
        'errors.callable.getUserFailed'
      )
    ).rejects.toThrow(translateCommonMessage('errors.callable.getUserFailed'));
  });

  it('throws fallback translated operation error when callable promise rejects', async () => {
    const upstreamError = new Error('Network is down');
    const delayedRejection = (async (): Promise<never> => {
      await new Promise(resolve => setTimeout(resolve, 20));
      throw upstreamError;
    })();

    await expect(
      handleCallableResponse(delayedRejection, 'errors.callable.getUserFailed')
    ).rejects.toThrow(translateCommonMessage('errors.callable.getUserFailed'));

    expect(mockLogger.error).toHaveBeenCalledWith(upstreamError);
  });

  it('throws timeout message when callable exceeds network timeout', async () => {
    vi.useFakeTimers();

    const resultPromise = handleCallableResponse(
      new Promise<{ data: never }>(() => {}),
      'errors.callable.getUserFailed'
    );
    const capturedError = resultPromise.catch(error => error);

    await vi.advanceTimersByTimeAsync(5000);
    const error = await capturedError;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      translateCommonMessage('errors.auth.timeout')
    );
  });
});
