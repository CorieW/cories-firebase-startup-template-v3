/**
 * Backend domain error types.
 */
export type DomainErrorKind =
  | 'Unauthorized'
  | 'Forbidden'
  | 'Validation'
  | 'NotFound'
  | 'Precondition'
  | 'UpstreamDependency'
  | 'Internal';

abstract class BaseDomainError extends Error {
  readonly kind: DomainErrorKind;
  readonly messageKey: string;

  protected constructor(kind: DomainErrorKind, messageKey: string) {
    super(messageKey);
    this.kind = kind;
    this.messageKey = messageKey;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedDomainError extends BaseDomainError {
  constructor(messageKey: string = 'Unauthorized') {
    super('Unauthorized', messageKey);
    this.name = 'UnauthorizedDomainError';
  }
}

export class ValidationDomainError extends BaseDomainError {
  constructor(messageKey: string = 'Validation failed') {
    super('Validation', messageKey);
    this.name = 'ValidationDomainError';
  }
}

export class ForbiddenDomainError extends BaseDomainError {
  constructor(messageKey: string = 'Forbidden') {
    super('Forbidden', messageKey);
    this.name = 'ForbiddenDomainError';
  }
}

export class NotFoundDomainError extends BaseDomainError {
  constructor(messageKey: string) {
    super('NotFound', messageKey);
    this.name = 'NotFoundDomainError';
  }
}

export class PreconditionDomainError extends BaseDomainError {
  constructor(messageKey: string) {
    super('Precondition', messageKey);
    this.name = 'PreconditionDomainError';
  }
}

export class UpstreamDependencyDomainError extends BaseDomainError {
  constructor(messageKey: string = 'A backend dependency is unavailable') {
    super('UpstreamDependency', messageKey);
    this.name = 'UpstreamDependencyDomainError';
  }
}

export class InternalDomainError extends BaseDomainError {
  constructor(
    messageKey: string = 'An unknown error occurred. Please try again.'
  ) {
    super('Internal', messageKey);
    this.name = 'InternalDomainError';
  }
}

export function isDomainError(error: unknown): error is BaseDomainError {
  return error instanceof BaseDomainError;
}
