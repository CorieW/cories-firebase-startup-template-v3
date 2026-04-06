/**
 * Shared callable response envelope helpers.
 */
import {
  CallableResponse,
  CallableResponseWithData,
  createScopedLogger,
  sanitizeForLogging,
  serializeErrorForLogging,
  translateCommonMessage,
} from '@cories-firebase-startup-template-v3/common';
import {
  ForbiddenDomainError,
  InternalDomainError,
  isDomainError,
  NotFoundDomainError,
  PreconditionDomainError,
  UnauthorizedDomainError,
  UpstreamDependencyDomainError,
  ValidationDomainError,
} from './domain-errors';

const callableLogger = createScopedLogger('BACK_CALLABLE');
let callableRequestSequence = 0;

function nextCallableRequestId(logContext: string) {
  callableRequestSequence += 1;
  return `${logContext}-${Date.now()}-${callableRequestSequence}`;
}

export function createSuccessResponse(
  message: string = 'ok'
): CallableResponse {
  return {
    status: 200,
    message: toReadableMessage(message),
  };
}

export function createSuccessDataResponse<TData>(
  data: TData,
  message: string = 'ok'
): CallableResponseWithData<TData> {
  return {
    status: 200,
    message: toReadableMessage(message),
    data,
  };
}

export function mapDomainErrorToCallableResponse(
  error: unknown,
  fallbackMessage: string
): CallableResponse {
  if (error instanceof UnauthorizedDomainError) {
    return {
      status: 401,
      message: 'Unauthorized',
    };
  }

  if (error instanceof ForbiddenDomainError) {
    return {
      status: 403,
      message: toReadableMessage(error.messageKey),
    };
  }

  if (error instanceof ValidationDomainError) {
    return {
      status: 400,
      message: toReadableMessage(error.messageKey),
    };
  }

  if (error instanceof NotFoundDomainError) {
    return {
      status: 404,
      message: toReadableMessage(error.messageKey),
    };
  }

  if (error instanceof PreconditionDomainError) {
    return {
      status: 400,
      message: toReadableMessage(error.messageKey),
    };
  }

  if (error instanceof UpstreamDependencyDomainError) {
    return {
      status: 502,
      message: 'A backend dependency is unavailable',
    };
  }

  if (error instanceof InternalDomainError) {
    return {
      status: 500,
      message: toReadableMessage(fallbackMessage),
    };
  }

  if (isDomainError(error)) {
    return {
      status: 500,
      message: toReadableMessage(fallbackMessage),
    };
  }

  return {
    status: 500,
    message: toReadableMessage(fallbackMessage),
  };
}

export function toReadableMessage(message: string): string {
  return translateCommonMessage(message);
}

export async function executeCallable<TResponse extends CallableResponse>(
  operation: () => Promise<TResponse>,
  fallbackMessage: string,
  logContext: string
): Promise<TResponse> {
  const requestId = nextCallableRequestId(logContext);
  const startedAt = Date.now();

  callableLogger.log(
    'REQUEST',
    {
      action: 'executeCallable',
      status: 'start',
      requestId,
      logContext,
      fallbackMessage,
    },
    'info'
  );

  try {
    const response = await operation();

    callableLogger.log(
      'RESPONSE',
      {
        action: 'executeCallable',
        status: 'success',
        requestId,
        logContext,
        durationMs: Date.now() - startedAt,
        responseStatus: response.status,
        responseMessage: response.message,
        hasData:
          'data' in response &&
          response.data !== null &&
          response.data !== undefined,
      },
      'info'
    );

    if ('data' in response && response.data !== undefined) {
      callableLogger.log(
        'RESPONSE_DATA',
        {
          requestId,
          logContext,
          data: sanitizeForLogging(response.data),
        },
        'debug'
      );
    }

    return response;
  } catch (error) {
    callableLogger.log(
      'RESPONSE_ERROR',
      {
        action: 'executeCallable',
        status: 'error',
        requestId,
        logContext,
        durationMs: Date.now() - startedAt,
        error: serializeErrorForLogging(error),
      },
      'error'
    );
    return mapDomainErrorToCallableResponse(
      error,
      fallbackMessage
    ) as TResponse;
  }
}
