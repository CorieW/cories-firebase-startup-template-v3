/**
 * Search trigger wrappers for the docs shell.
 */
import {
  FullSearchTrigger,
  SearchTrigger,
  type FullSearchTriggerProps,
  type SearchTriggerProps,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger';

/**
 * Small viewport search trigger with stable test hooks.
 */
export function DocsSearchTriggerSm(props: SearchTriggerProps) {
  return (
    <SearchTrigger
      {...props}
      aria-label='Search docs'
      data-testid='docs-search-trigger-sm'
    />
  );
}

/**
 * Full-width search trigger shown in larger docs navigation contexts.
 */
export function DocsSearchTriggerFull(props: FullSearchTriggerProps) {
  return (
    <FullSearchTrigger
      {...props}
      aria-label='Search docs'
      data-testid='docs-search-trigger-full'
    />
  );
}
