// @vitest-environment jsdom

/**
 * Smoke tests for the custom rich-content MDX blocks.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DocEmbed from '@/components/DocEmbed';
import DocImage from '@/components/DocImage';
import DocVideo from '@/components/DocVideo';
import { getMDXComponents } from '@/components/mdx';

describe('Doc rich content blocks', () => {
  it('renders framed image, video, embed blocks, and numbered code blocks', () => {
    const components = getMDXComponents();
    const CodeBlock =
      components.CodeBlock as typeof import('fumadocs-ui/components/codeblock').CodeBlock;
    const Pre =
      components.Pre as typeof import('fumadocs-ui/components/codeblock').Pre;

    render(
      <div>
        <DocImage
          alt='Screenshot'
          caption='Image caption'
          src='https://example.com/image.png'
        />
        <DocVideo caption='Video caption' src='https://example.com/video.mp4' />
        <DocEmbed
          caption='Embed caption'
          src='https://example.com/embed'
          title='Embed example'
        />
        <CodeBlock title='Example'>
          <Pre>
            <code>
              <span className='line'>const docs = true;</span>
            </code>
          </Pre>
        </CodeBlock>
      </div>
    );

    expect(screen.getByRole('img', { name: 'Screenshot' })).not.toBeNull();
    expect(screen.getByText('Image caption')).not.toBeNull();
    expect(screen.getByText('Video caption')).not.toBeNull();
    expect(screen.getByTitle('Embed example')).not.toBeNull();
    expect(screen.getByText('Embed caption')).not.toBeNull();
    expect(
      screen
        .getByText('Example')
        .closest('figure')
        ?.hasAttribute('data-line-numbers')
    ).toBe(true);
  });
});
