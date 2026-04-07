/**
 * Better Auth client and shared auth hooks.
 */
import { createAuthHooks } from '@daveyplate/better-auth-tanstack'
import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [
    organizationClient(),
  ],
})

const authHooks = createAuthHooks(authClient)

export const useAuthSession = authHooks.useSession
export const useActiveOrganization = authHooks.useActiveOrganization
export const useListOrganizations = authHooks.useListOrganizations

/**
 * Returns the active organization member using a query key that tracks the
 * current org id so profile switches refetch immediately.
 */
export function useActiveMember() {
  const { session } = useAuthSession()
  const { data: activeOrganization } = useActiveOrganization()
  const activeOrganizationId =
    typeof activeOrganization === 'undefined'
      ? (session?.activeOrganizationId ?? null)
      : (activeOrganization?.id ?? null)

  return authHooks.useAuthQuery({
    queryKey: ['active-member', activeOrganizationId],
    queryFn: authClient.organization.getActiveMember,
    options: {
      enabled: Boolean(activeOrganizationId),
    },
  })
}
