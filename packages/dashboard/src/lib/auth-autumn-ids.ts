/**
 * Helpers for consistent Autumn customer and entity id formats.
 */
type AutumnCustomerScope = 'org' | 'user'
type AutumnEntityScope = 'member'

function buildAutumnScopedId(scope: string, id: string): string {
  return `${scope}-${id}`
}

/**
 * Builds an Autumn-safe customer id for user and organization customers.
 */
export function getAutumnCustomerId(
  scope: AutumnCustomerScope,
  id: string
): string {
  return buildAutumnScopedId(scope, id)
}

/**
 * Builds an Autumn-safe entity id for feature-scoped entities.
 */
export function getAutumnEntityId(
  scope: AutumnEntityScope,
  id: string
): string {
  return buildAutumnScopedId(scope, id)
}
