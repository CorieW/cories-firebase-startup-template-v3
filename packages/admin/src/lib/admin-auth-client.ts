/**
 * Better Auth client used by the admin sign-in and session-aware UI.
 */
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  basePath: '/api/auth',
});

export const useAdminAuthSession = authClient.useSession;

