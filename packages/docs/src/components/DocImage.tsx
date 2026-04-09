/**
 * Rich image block for MDX docs pages.
 */
interface DocImageProps {
  alt: string;
  caption?: string;
  src: string;
}

/**
 * Renders an image with the docs package framing and optional caption.
 */
export default function DocImage({ alt, caption, src }: DocImageProps) {
  return (
    <figure className='my-8 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_48px_rgba(91,72,39,0.08)]'>
      <img className='block h-auto w-full' src={src} alt={alt} />
      {caption ? (
        <figcaption className='border-t border-[var(--line)] px-4 py-3 text-sm text-[var(--ink-soft)]'>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
