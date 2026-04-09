/**
 * Client-rendered MDX page body for docs content routes.
 */
import { Suspense } from 'react';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import browserCollections from 'fumadocs-mdx:collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import type { LoadedDocsPage } from '../lib/docs-types';
import DocsShell from './DocsShell';
import { getMDXComponents } from './mdx';

const clientLoader = browserCollections.docs.createClientLoader<LoadedDocsPage>(
  {
    component: (loaded, props) => {
      const MDX = loaded.default;

      return (
        <DocsPage toc={props.toc}>
          <DocsTitle className='docs-page-title'>{props.title}</DocsTitle>
          <DocsDescription className='docs-page-description'>
            {props.description ?? props.summary}
          </DocsDescription>
          <DocsBody className='docs-page-body'>
            <MDX components={getMDXComponents()} />
          </DocsBody>
        </DocsPage>
      );
    },
    id: 'docs-content',
  }
);

/**
 * Preloads a compiled MDX page before the route renders it.
 */
export async function preloadDocsPageContent(path: string) {
  await clientLoader.preload(path);
}

/**
 * Renders a full docs route from serialized loader data.
 */
export default function DocsPageContent({
  loaderData,
}: {
  loaderData: unknown;
}) {
  const page = useFumadocsLoader(
    loaderData as LoadedDocsPage
  ) as LoadedDocsPage & {
    pageTree: Parameters<typeof DocsShell>[0]['tree'];
  };

  return (
    <DocsShell tree={page.pageTree}>
      <Suspense>{clientLoader.useContent(page.path, page)}</Suspense>
    </DocsShell>
  );
}
