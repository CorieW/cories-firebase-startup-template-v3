/**
 * Trusted iframe embed block for MDX docs pages.
 */
interface DocEmbedProps {
  caption?: string;
  src: string;
  title: string;
}

/**
 * Renders a responsive iframe embed inside the docs visual system.
 */
export default function DocEmbed({ caption, src, title }: DocEmbedProps) {
  return (
    <figure className='my-8 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_48px_rgba(91,72,39,0.08)]'>
      <div className='aspect-video w-full overflow-hidden bg-[var(--surface-soft)]'>
        <iframe
          className='h-full w-full border-0'
          src={src}
          title={title}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        />
      </div>
      {caption ? (
        <figcaption className='border-t border-[var(--line)] px-4 py-3 text-sm text-[var(--ink-soft)]'>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
