/**
 * Root route shell and document wrapper for the admin app.
 */
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { pageContainerClass, shellFrameClass } from '../lib/ui';
import { THEME_INIT_SCRIPT } from '../lib/theme';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Admin Console',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
});

/**
 * Renders the top-level HTML document for the admin app.
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className={shellFrameClass}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Provides a simple shell wrapper for nested admin routes.
 */
function RootLayout() {
  return (
    <div className={pageContainerClass}>
      <Outlet />
    </div>
  );
}
