/**
 * Root route shell and providers for the docs app.
 */
import {
  FIXED_DARK_THEME_CLASS_NAME,
  FIXED_DARK_THEME_MODE,
  sharedDocumentBodyClass,
} from '@cories-firebase-startup-template-v3/common/client';
import {
  TEMPLATE_APP_TITLES,
  TEMPLATE_COPY,
} from '@cories-firebase-startup-template-v3/common';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import type { ReactNode } from 'react';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: TEMPLATE_APP_TITLES.docs,
      },
      {
        content: TEMPLATE_COPY.docsMetaDescription,
        name: 'description',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={FIXED_DARK_THEME_CLASS_NAME}
      data-theme={FIXED_DARK_THEME_MODE}
      data-theme-preference={FIXED_DARK_THEME_MODE}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className={sharedDocumentBodyClass}>
        <RootProvider
          search={{
            links: [
              ['Docs home', '/'],
              ['Getting started', '/getting-started'],
              ['Guides', '/guides'],
              ['Reference', '/reference'],
            ],
          }}
          theme={{
            enabled: false,
          }}
        >
          {children}
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
