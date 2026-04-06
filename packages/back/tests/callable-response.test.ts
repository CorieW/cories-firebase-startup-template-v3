/**
 * Tests shared callable response helpers.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  createSuccessDataResponse,
  createSuccessResponse,
  executeCallable,
  mapDomainErrorToCallableResponse,
} from '../src/utils/callable-response';
import {
  InternalDomainError,
  NotFoundDomainError,
  PreconditionDomainError,
  UnauthorizedDomainError,
  UpstreamDependencyDomainError,
  ValidationDomainError,
} from '../src/utils/domain-errors';

const mockScopedLogger = vi.hoisted(() => ({
  action: vi.fn(),
  log: vi.fn(),
}));

vi.mock('@cories-firebase-startup-template-v3/common', async () => {
  const actual = await vi.importActual<
    typeof import('@cories-firebase-startup-template-v3/common')
  >('@cories-firebase-startup-template-v3/common');

  return {
    ...actual,
    createScopedLogger: () => mockScopedLogger,
    sanitizeForLogging: actual.sanitizeForLogging,
    serializeErrorForLogging: actual.serializeErrorForLogging,
  };
});

describe('callable response helpers', () => {
  it('logs start and failure when executeCallable maps an error response', async () => {
    mockScopedLogger.log.mockClear();

    await executeCallable(
      async () => {
        throw new NotFoundDomainError('errors.callable.userNotFound');
      },
      'errors.callable.getUserFailed',
      'getUser callable failed'
    );

    expect(mockScopedLogger.log).toHaveBeenCalledWith(
      'REQUEST',
      expect.objectContaining({
        action: 'executeCallable',
        status: 'start',
        logContext: 'getUser callable failed',
      }),
      'info'
    );
    expect(mockScopedLogger.log).toHaveBeenCalledWith(
      'RESPONSE_ERROR',
      expect.objectContaining({
        action: 'executeCallable',
        status: 'error',
        logContext: 'getUser callable failed',
      }),
      'error'
    );
  });

  it('builds success responses', () => {
    expect(createSuccessResponse()).toEqual({
      status: 200,
      message: 'ok',
    });
    expect(createSuccessDataResponse({ ok: true })).toEqual({
      status: 200,
      message: 'ok',
      data: { ok: true },
    });
  });

  it('maps UnauthorizedDomainError', () => {
    const response = mapDomainErrorToCallableResponse(
      new UnauthorizedDomainError(),
      'errors.callable.getUserFailed'
    );
    expect(response).toEqual({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('maps ValidationDomainError', () => {
    const response = mapDomainErrorToCallableResponse(
      new ValidationDomainError('validation.payment.priceId.required'),
      'errors.callable.upsertSubscriptionFailed'
    );
    expect(response).toEqual({
      status: 400,
      message: 'Price ID is required',
    });
  });

  it('maps NotFoundDomainError', () => {
    const response = mapDomainErrorToCallableResponse(
      new NotFoundDomainError('errors.callable.paymentMethodNotFound'),
      'errors.callable.deletePaymentMethodFailed'
    );
    expect(response).toEqual({
      status: 404,
      message: 'Payment method not found',
    });
  });

  it('maps PreconditionDomainError', () => {
    const response = mapDomainErrorToCallableResponse(
      new PreconditionDomainError(
        'errors.callable.paymentMethodRequiredForSubscription'
      ),
      'errors.callable.upsertSubscriptionFailed'
    );
    expect(response).toEqual({
      status: 400,
      message: 'A saved payment method is required to start this subscription',
    });
  });

  it('maps UpstreamDependencyDomainError', () => {
    const response = mapDomainErrorToCallableResponse(
      new UpstreamDependencyDomainError(),
      'errors.callable.createPaymentIntentFailed'
    );
    expect(response).toEqual({
      status: 502,
      message: 'A backend dependency is unavailable',
    });
  });

  it('maps InternalDomainError to callable-specific fallback', () => {
    const response = mapDomainErrorToCallableResponse(
      new InternalDomainError('errors.callable.getUserFailed'),
      'errors.callable.getUserFailed'
    );
    expect(response).toEqual({
      status: 500,
      message: 'Failed to get user',
    });
  });

  it('maps unknown errors to fallback', () => {
    const response = mapDomainErrorToCallableResponse(
      new Error('boom'),
      'errors.callable.getUserFailed'
    );
    expect(response).toEqual({
      status: 500,
      message: 'Failed to get user',
    });
  });

  it('executeCallable returns mapped errors', async () => {
    mockScopedLogger.log.mockClear();

    const result = await executeCallable(
      async () => {
        throw new NotFoundDomainError('errors.callable.userNotFound');
      },
      'errors.callable.getUserFailed',
      'getUser callable failed'
    );

    expect(result).toEqual({
      status: 404,
      message: 'User not found',
    });
    expect(mockScopedLogger.log).toHaveBeenCalledWith(
      'RESPONSE_ERROR',
      expect.objectContaining({
        status: 'error',
      }),
      'error'
    );
  });
});
