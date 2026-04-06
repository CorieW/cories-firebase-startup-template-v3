/**
 * Shared billing scope types used by the dashboard billing UI.
 */
export type BillingScope = 'user' | 'organization'

/**
 * Resolves the current billing scope from the active organization state.
 */
export function getBillingScope({
  activeOrganizationId,
  sessionActiveOrganizationId,
}: {
  activeOrganizationId: string | null | undefined
  sessionActiveOrganizationId: string | null | undefined
}): BillingScope {
  if (typeof activeOrganizationId !== 'undefined') {
    return activeOrganizationId ? 'organization' : 'user'
  }

  return sessionActiveOrganizationId ? 'organization' : 'user'
}

/**
 * Builds a stable Autumn provider key that follows the resolved billing scope.
 * When organization state has settled to `null`, prefer the personal account
 * key even if the session cache still holds the previous org id briefly.
 */
export function getAutumnCustomerScopeKey({
  activeOrganizationId,
  sessionActiveOrganizationId,
  sessionUserId,
  userId,
}: {
  activeOrganizationId: string | null | undefined
  sessionActiveOrganizationId: string | null | undefined
  sessionUserId: string | null | undefined
  userId: string | null | undefined
}): string {
  if (activeOrganizationId) {
    return `org:${activeOrganizationId}`
  }

  if (typeof activeOrganizationId !== 'undefined') {
    if (sessionUserId) {
      return `user:${sessionUserId}`
    }

    if (userId) {
      return `user:${userId}`
    }

    return 'signed-out'
  }

  if (sessionActiveOrganizationId) {
    return `org:${sessionActiveOrganizationId}`
  }

  if (sessionUserId) {
    return `user:${sessionUserId}`
  }

  if (userId) {
    return `user:${userId}`
  }

  return 'signed-out'
}
