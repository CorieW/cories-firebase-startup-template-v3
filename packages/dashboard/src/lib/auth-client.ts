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

export function useActiveMember() {
  return authClient.useActiveMember()
}
