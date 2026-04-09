/**
 * Shared docs route data types used by server loaders and client renderers.
 */
export interface LoadedDocsPage {
  description?: string;
  pageTree: { [key: string]: {} };
  path: string;
  structuredData: {
    contents: Array<{
      content: string;
      heading?: string;
    }>;
    headings: Array<{
      content: string;
      id: string;
    }>;
  };
  summary?: string;
  title: string;
  toc: Array<{
    depth: number;
    title: string;
    url: string;
  }>;
}
