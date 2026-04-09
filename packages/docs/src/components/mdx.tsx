/**
 * Shared MDX component registry for docs content.
 */
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import {
  CodeBlock as FumadocsCodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import type { HTMLAttributes } from 'react';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import DocEmbed from './DocEmbed';
import DocImage from './DocImage';
import DocVideo from './DocVideo';

function DocsCodeBlock(props: CodeBlockProps) {
  return (
    <FumadocsCodeBlock
      data-line-numbers={props['data-line-numbers'] ?? true}
      {...props}
    />
  );
}

function DocsPre(props: HTMLAttributes<HTMLPreElement>) {
  return (
    <DocsCodeBlock {...props}>
      <Pre>{props.children}</Pre>
    </DocsCodeBlock>
  );
}

/**
 * Combines the default Fumadocs MDX helpers with the docs-specific media
 * components used across this package.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    CodeBlock: DocsCodeBlock,
    Callout,
    Card,
    Cards,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    DocEmbed,
    DocImage,
    DocVideo,
    pre: DocsPre,
    Pre,
    Step,
    Steps,
    Tab,
    Tabs,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
