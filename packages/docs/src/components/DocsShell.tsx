/**
 * Shared docs navigation shell built on top of Fumadocs DocsLayout.
 */
import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import AppBrand from './AppBrand';
import {
  DocsSearchTriggerFull,
  DocsSearchTriggerSm,
} from './DocsSearchTriggers';

type DocsShellProps = {
  children: ReactNode;
  tree: DocsLayoutProps['tree'];
};

/**
 * Wraps docs pages with shared navigation, search, theme, and sidebar chrome.
 */
export default function DocsShell({ children, tree }: DocsShellProps) {
  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: <AppBrand />,
      }}
      searchToggle={{
        enabled: true,
      }}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        enabled: true,
      }}
      slots={{
        searchTrigger: {
          full: DocsSearchTriggerFull,
          sm: DocsSearchTriggerSm,
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
