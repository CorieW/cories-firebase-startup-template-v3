/**
 * Better Auth API route mounted under the admin server.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import { auth } from '../lib/server/auth-server';

const authApiLogger = createScopedLogger('ADMIN_AUTH_API');

async function handleAuthRequest(request: Request) {
  const startedAt = Date.now();
  const pathname = new URL(request.url).pathname;

  authApiLogger.log(
    'REQUEST',
    {
      action: 'handleBetterAuthRequest',
      method: request.method,
      path: pathname,
      status: 'start',
    },
    'debug'
  );

  try {
    const response = await auth.handler(request);

    authApiLogger.log(
      'RESPONSE',
      {
        action: 'handleBetterAuthRequest',
        method: request.method,
        path: pathname,
        status: 'success',
        durationMs: Date.now() - startedAt,
        responseStatus: response.status,
      },
      'info'
    );

    return response;
  } catch (error) {
    authApiLogger.log(
      'RESPONSE_ERROR',
      {
        action: 'handleBetterAuthRequest',
        method: request.method,
        path: pathname,
        status: 'error',
        durationMs: Date.now() - startedAt,
        error: serializeErrorForLogging(error),
      },
      'error'
    );
    throw error;
  }
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthRequest(request),
      POST: ({ request }) => handleAuthRequest(request),
    },
  },
});
