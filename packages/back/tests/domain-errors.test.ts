/**
 * Tests backend domain error mapping.
 */
import { describe, expect, it } from 'vitest';
import {
  InternalDomainError,
  isDomainError,
  NotFoundDomainError,
  PreconditionDomainError,
  UnauthorizedDomainError,
  UpstreamDependencyDomainError,
  ValidationDomainError,
} from '../src/utils/domain-errors';

describe('domain errors', () => {
  it('creates typed domain errors with message keys', () => {
    const unauthorized = new UnauthorizedDomainError();
    const validation = new ValidationDomainError('validation.custom');
    const notFound = new NotFoundDomainError('errors.missing');
    const precondition = new PreconditionDomainError('errors.invalidState');
    const upstream = new UpstreamDependencyDomainError();
    const internal = new InternalDomainError();

    expect(unauthorized.kind).toBe('Unauthorized');
    expect(validation.kind).toBe('Validation');
    expect(notFound.kind).toBe('NotFound');
    expect(precondition.kind).toBe('Precondition');
    expect(upstream.kind).toBe('UpstreamDependency');
    expect(internal.kind).toBe('Internal');

    expect(validation.messageKey).toBe('validation.custom');
    expect(notFound.messageKey).toBe('errors.missing');
    expect(precondition.messageKey).toBe('errors.invalidState');
  });

  it('identifies domain errors correctly', () => {
    expect(isDomainError(new UnauthorizedDomainError())).toBe(true);
    expect(isDomainError(new Error('boom'))).toBe(false);
    expect(isDomainError({ message: 'plain' })).toBe(false);
  });
});
