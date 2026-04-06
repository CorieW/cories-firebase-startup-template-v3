/**
 * Verifies production dashboard server behavior for authenticated apps.
 *
 * Contract enforced by this smoke test:
 * 1) Public auth routes return `200` with HTML and TanStack SSR markers.
 * 2) Protected routes return `307` redirecting to `/sign-in`.
 * 3) The dashboard server becomes reachable before route checks run.
 *
 * Environment overrides:
 * - BASE_URL: dashboard server base URL (default: http://127.0.0.1:4173)
 * - PUBLIC_ROUTES: comma-separated public auth routes
 * - PROTECTED_ROUTES: comma-separated protected routes
 * - READINESS_ROUTE: route used for startup probe (default: /sign-in)
 *
 * Flags:
 * - `--debug`: print readiness polling and per-route request diagnostics.
 */
function parseCliArgs(args) {
  let debug = false;

  for (const arg of args) {
    if (arg === '--debug') {
      debug = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { debug };
}

function readCliArgsOrExit() {
  try {
    return parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${String(error.message ?? error)}`);
    process.exit(1);
  }
}

const { debug: DEBUG_ENABLED } = readCliArgsOrExit();

function logDebug(message) {
  if (!DEBUG_ENABLED) {
    return;
  }

  console.log(`[debug] ${message}`);
}

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const readinessRoute = process.env.READINESS_ROUTE ?? '/sign-in';

const defaultPublicRoutes = ['/sign-in', '/sign-up'];
const defaultProtectedRoutes = [
  '/',
  '/support',
  '/pricing/user',
  '/pricing/organization',
];

function parseRoutesFromEnv(rawValue, fallbackRoutes) {
  if (!rawValue) {
    return [...fallbackRoutes];
  }

  const routes = rawValue
    .split(',')
    .map(route => route.trim())
    .filter(route => route.length > 0)
    .map(route => (route.startsWith('/') ? route : `/${route}`));

  return [...new Set(routes)];
}

const publicRoutes = parseRoutesFromEnv(
  process.env.PUBLIC_ROUTES,
  defaultPublicRoutes
);
const protectedRoutes = parseRoutesFromEnv(
  process.env.PROTECTED_ROUTES,
  defaultProtectedRoutes
);

if (publicRoutes.length === 0 && protectedRoutes.length === 0) {
  throw new Error(
    'No routes configured. Set PUBLIC_ROUTES and/or PROTECTED_ROUTES.'
  );
}

function resolveRouteUrl(route) {
  return new URL(route, baseUrl).toString();
}

function getRouteDiagnostics(route, response, responseBody = '') {
  const location = response.headers.get('location') ?? '<none>';
  const contentType = response.headers.get('content-type') ?? '<none>';
  const bodyPreview = responseBody.replace(/\s+/g, ' ').slice(0, 140);

  return [
    `route=${route}`,
    `status=${response.status}`,
    `location=${location}`,
    `content-type=${contentType}`,
    `body-preview=${bodyPreview || '<empty>'}`,
  ].join(' | ');
}

async function fetchRoute(route) {
  const routeUrl = resolveRouteUrl(route);
  logDebug(`Fetching ${route} via ${routeUrl}`);
  const response = await fetch(routeUrl, { redirect: 'manual' });
  logDebug(
    [
      `Received ${response.status} for ${route}`,
      `location=${response.headers.get('location') ?? '<none>'}`,
      `content-type=${response.headers.get('content-type') ?? '<none>'}`,
    ].join(' | ')
  );
  return response;
}

async function verifyPublicRoute(route) {
  const response = await fetchRoute(route);
  const contentType = response.headers.get('content-type') ?? '';
  const html = await response.text();

  if (response.status !== 200) {
    throw new Error(
      `Public route failed (${getRouteDiagnostics(route, response, html)})`
    );
  }

  if (!contentType.includes('text/html')) {
    throw new Error(
      `Public route did not return HTML (${getRouteDiagnostics(route, response, html)})`
    );
  }

  if (!html.includes('<html')) {
    throw new Error(
      `Public route did not return an HTML document (${getRouteDiagnostics(route, response, html)})`
    );
  }

  const hasTanStackSsrMarker =
    html.includes('id="$tsr-stream-barrier"') || html.includes('$_TSR');
  if (!hasTanStackSsrMarker) {
    throw new Error(
      `Public route missing TanStack SSR marker (${getRouteDiagnostics(route, response, html)})`
    );
  }

  console.log(`✓ Public route ${route} returned 200 HTML`);
}

async function verifyProtectedRoute(route) {
  const response = await fetchRoute(route);
  const location = response.headers.get('location') ?? '';

  if (response.status !== 307) {
    throw new Error(
      `Protected route expected 307 redirect (${getRouteDiagnostics(route, response)})`
    );
  }

  if (!location.startsWith('/sign-in')) {
    throw new Error(
      `Protected route did not redirect to /sign-in (${getRouteDiagnostics(route, response)})`
    );
  }

  console.log(`✓ Protected route ${route} returned 307 -> ${location}`);
}

async function waitForPreview() {
  const maxAttempts = 30;
  const delayMs = 1000;
  const readinessUrl = resolveRouteUrl(readinessRoute);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      logDebug(
        `Readiness probe ${attempt}/${maxAttempts}: requesting ${readinessUrl}`
      );
      const response = await fetch(readinessUrl, {
        redirect: 'manual',
      });
      logDebug(
        `Readiness probe ${attempt}/${maxAttempts}: status ${response.status}`
      );

      if (response.status >= 200 && response.status < 400) {
        logDebug(`Dashboard server became ready on attempt ${attempt}.`);
        return;
      }
    } catch (error) {
      logDebug(
        `Readiness probe ${attempt}/${maxAttempts} failed: ${String(error)}`
      );
    }

    if (attempt < maxAttempts) {
      logDebug(`Waiting ${delayMs}ms before the next readiness probe.`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(
    `Dashboard server did not become ready at ${baseUrl} (readiness route: ${readinessRoute})`
  );
}

async function main() {
  logDebug(
    [
      `Base URL: ${baseUrl}`,
      `Readiness route: ${readinessRoute}`,
      `Public routes: ${publicRoutes.join(', ') || '<none>'}`,
      `Protected routes: ${protectedRoutes.join(', ') || '<none>'}`,
    ].join(' | ')
  );
  await waitForPreview();

  for (const route of publicRoutes) {
    await verifyPublicRoute(route);
  }

  for (const route of protectedRoutes) {
    await verifyProtectedRoute(route);
  }

  console.log(
    [
      'Production dashboard smoke passed.',
      `Public routes: ${publicRoutes.length}`,
      `Protected routes: ${protectedRoutes.length}`,
      `Base URL: ${baseUrl}`,
    ].join(' ')
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
