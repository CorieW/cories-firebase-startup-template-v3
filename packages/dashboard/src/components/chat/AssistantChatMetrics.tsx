/**
 * Extracted assistant chat billing summary cards.
 */
import { panelMutedClass } from '../../lib/ui';

export default function AssistantChatMetrics({
  isCustomerPending,
  remainingBalanceLabel,
  draftCostLabel,
  messageAllowanceLabel,
  draftCostDescription,
  allowanceDescription,
  walletBalanceDescription,
}: {
  isCustomerPending: boolean;
  remainingBalanceLabel: string;
  draftCostLabel: string;
  messageAllowanceLabel: string;
  draftCostDescription: string;
  allowanceDescription: string;
  walletBalanceDescription: string;
}) {
  return (
    <div className='grid gap-3 min-[820px]:grid-cols-[repeat(3,minmax(0,1fr))]'>
      <article className={`${panelMutedClass} p-4`}>
        <p className='m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]'>
          Wallet balance
        </p>
        <p className='mb-0 mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
          {isCustomerPending ? 'Loading...' : remainingBalanceLabel}
        </p>
        <p className='mb-0 mt-2 text-sm text-[var(--ink-soft)]'>
          {walletBalanceDescription}
        </p>
      </article>

      <article className={`${panelMutedClass} p-4`}>
        <p className='m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]'>
          Current draft cost
        </p>
        <p className='mb-0 mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
          {isCustomerPending ? 'Loading...' : draftCostLabel}
        </p>
        <p className='mb-0 mt-2 text-sm text-[var(--ink-soft)]'>
          {draftCostDescription}
        </p>
      </article>

      <article className={`${panelMutedClass} p-4`}>
        <p className='m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]'>
          Chat access
        </p>
        <p className='mb-0 mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
          {isCustomerPending ? 'Loading...' : messageAllowanceLabel}
        </p>
        <p className='mb-0 mt-2 text-sm text-[var(--ink-soft)]'>
          {allowanceDescription}
        </p>
      </article>
    </div>
  );
}
