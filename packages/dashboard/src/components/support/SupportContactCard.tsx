/**
 * Support contact card UI.
 */
import { panelClass } from '../../lib/ui';

interface SupportContactCardProps {
  onContactSupportClick: () => void;
}

/**
 * Final call-to-action for users who still need help.
 */
export default function SupportContactCard({
  onContactSupportClick,
}: SupportContactCardProps) {
  return (
    <section className={`${panelClass} p-5`}>
      <h2 className='m-0 text-xl font-bold text-[var(--ink)]'>
        Still need help?
      </h2>
      <p className='mb-0 mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
        Contact our team and include your environment details so we can help
        faster.
      </p>
      <button
        type='button'
        onClick={onContactSupportClick}
        className='mt-4 inline-flex h-10 items-center justify-center rounded-[12px] border border-transparent bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-ink)] transition hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)]'
      >
        Contact support
      </button>
    </section>
  );
}
