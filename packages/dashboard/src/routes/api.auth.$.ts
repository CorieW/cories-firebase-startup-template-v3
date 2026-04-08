/**
 * Better Auth API route mounted under the dashboard server.
 */
import { createFileRoute } from '@tanstack/react-router';
import { default as commonLogging } from '@cories-firebase-startup-template-v3/common/logging';
import { auth } from '../lib/auth-server';

const { createScopedLogger, serializeErrorForLogging } = commonLogging;
const authApiLogger = createScopedLogger('DASH_AUTH_API');

async function handleAuthRequest(request: Request) {
  const startedAt = Date.now();

  authApiLogger.log(
    'REQUEST',
    {
      action: 'handleBetterAuthRequest',
      method: request.method,
      path: new URL(request.url).pathname,
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
        path: new URL(request.url).pathname,
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
        path: new URL(request.url).pathname,
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
