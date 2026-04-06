/**
 * Reusable page heading component.
 */
interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * Shared top-of-page header used above route content cards.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className='mb-[1.1rem]'>
      <p className='m-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--primary)_72%,var(--ink-soft))]'>
        {eyebrow}
      </p>
      <h1 className='mt-[0.45rem] max-w-[18ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.04] font-bold tracking-[-0.04em] text-[var(--ink)]'>
        {title}
      </h1>
      {description ? (
        <p className='mt-3 max-w-[68ch] leading-[1.65] text-[var(--ink-soft)]'>
          {description}
        </p>
      ) : null}
    </header>
  );
}
