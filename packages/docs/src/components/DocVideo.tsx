/**
 * Rich video block for MDX docs pages.
 */
interface DocVideoProps {
  caption?: string;
  poster?: string;
  src: string;
}

/**
 * Renders a self-hosted video with docs-friendly framing.
 */
export default function DocVideo({ caption, poster, src }: DocVideoProps) {
  return (
    <figure className='my-8 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_48px_rgba(91,72,39,0.08)]'>
      <video
        className='block aspect-video w-full bg-[var(--surface-soft)]'
        controls
        playsInline
        poster={poster}
      >
        <source src={src} />
      </video>
      {caption ? (
        <figcaption className='border-t border-[var(--line)] px-4 py-3 text-sm text-[var(--ink-soft)]'>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
