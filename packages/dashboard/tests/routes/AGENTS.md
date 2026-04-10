# packages/dashboard/tests/routes

Route-level tests for dashboard redirects, handlers, and server-side behavior.

## Directories

- None.

## Files

- `-pricing-redirects.test.ts`: Tests canonical pricing route redirect behavior.
- `-support-redirects.test.ts`: Tests canonical support route redirect behavior.
- `api.chat-usage.test.ts`: Tests chat-usage route validation and pricing snapshot recording.

## Writing Rules

- Keep route tests centered on route contracts such as redirects, validation, and request handling.
- Update file when additional route suites or shared route test helpers are introduced.
- Treat billing and pricing routes as high-risk contracts and add route coverage whenever changes could affect money movement, billing state, or customer access.
