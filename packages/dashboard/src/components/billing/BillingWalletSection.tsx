/**
 * Extracted wallet summary, top-up, and activity section.
 */
import { panelMutedClass } from '../../lib/ui';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import {
  formatBalanceAmount,
  formatTimestamp,
  normalizeWholeNumberInput,
} from './billing-dashboard.lib';
import type {
  AutumnBalance,
  AutumnPlan,
  BillingSubmissionState,
  WalletTransaction,
} from './billing-dashboard.types';

function WalletTopUpCard({
  canManageOrgBilling,
  onAddFunds,
  onQuantityChange,
  submissionState,
  topUpQuantityInput,
  walletBalance,
  walletFeatureId,
  walletTopUpConfigurationMessage,
  walletTopUpDescription,
  walletTopUpMaxPurchase,
  walletTopUpPlan,
}: {
  canManageOrgBilling: boolean;
  onAddFunds: () => void;
  onQuantityChange: (value: string) => void;
  submissionState: BillingSubmissionState | null;
  topUpQuantityInput: string;
  walletBalance: AutumnBalance | null;
  walletFeatureId: string | null;
  walletTopUpConfigurationMessage: string | null;
  walletTopUpDescription: string;
  walletTopUpMaxPurchase: number | null;
  walletTopUpPlan: AutumnPlan | null;
}) {
  if (!walletTopUpPlan) {
    return null;
  }

  const isSubmitting =
    submissionState?.action === 'top-up-wallet' &&
    submissionState.planId === walletTopUpPlan.id;

  return (
    <article className='grid gap-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='grid gap-1'>
          <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
            Add funds
          </p>
          <p className='m-0 text-sm text-[var(--ink-soft)]'>
            {walletTopUpDescription}
          </p>
        </div>
      </div>

      <div className='flex flex-wrap items-end gap-3'>
        <div className='grid min-w-[180px] gap-2'>
          <p className='m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]'>
            Balance to add
          </p>
          <Input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            value={topUpQuantityInput}
            disabled={
              Boolean(walletTopUpConfigurationMessage) ||
              !canManageOrgBilling ||
              isSubmitting
            }
            onChange={event => {
              const normalizedValue = normalizeWholeNumberInput(
                event.target.value
              );

              if (normalizedValue !== null) {
                onQuantityChange(normalizedValue);
              }
            }}
          />
        </div>
        <Button
          disabled={
            Boolean(walletTopUpConfigurationMessage) ||
            !canManageOrgBilling ||
            isSubmitting
          }
          onClick={onAddFunds}
        >
          {isSubmitting ? 'Opening checkout...' : 'Add funds'}
        </Button>
      </div>

      {walletTopUpConfigurationMessage ? (
        <p className='m-0 text-xs text-[#92400e]'>
          {walletTopUpConfigurationMessage}
        </p>
      ) : (
        <p className='m-0 text-xs text-[var(--ink-soft)]'>
          {walletTopUpMaxPurchase !== null &&
          walletTopUpMaxPurchase !== undefined
            ? `Maximum per purchase: ${formatBalanceAmount(walletTopUpMaxPurchase, walletBalance, walletFeatureId)}.`
            : 'Use checkout to purchase additional balance.'}
        </p>
      )}
    </article>
  );
}

export default function BillingWalletSection({
  canManageOrgBilling,
  onAddFunds,
  onLoadOlderActivity,
  onQuantityChange,
  submissionState,
  topUpQuantityInput,
  walletBalance,
  walletConfigured,
  walletEventsHasMore,
  walletEventsIsPending,
  walletFeatureId,
  walletLabel,
  walletTopUpConfigurationMessage,
  walletTopUpDescription,
  walletTopUpMaxPurchase,
  walletTopUpPlan,
  walletTransactions,
}: {
  canManageOrgBilling: boolean;
  onAddFunds: () => void;
  onLoadOlderActivity: () => void;
  onQuantityChange: (value: string) => void;
  submissionState: BillingSubmissionState | null;
  topUpQuantityInput: string;
  walletBalance: AutumnBalance | null;
  walletConfigured: boolean;
  walletEventsHasMore: boolean;
  walletEventsIsPending: boolean;
  walletFeatureId: string | null;
  walletLabel: string;
  walletTopUpConfigurationMessage: string | null;
  walletTopUpDescription: string;
  walletTopUpMaxPurchase: number | null;
  walletTopUpPlan: AutumnPlan | null;
  walletTransactions: WalletTransaction[];
}) {
  return walletBalance ? (
    <div className='grid gap-4'>
      <div className='grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr]'>
        <article className='grid gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'>
          <div>
            <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
              Remaining balance
            </p>
            <h3 className='m-0 mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
              {formatBalanceAmount(
                walletBalance.remaining,
                walletBalance,
                walletFeatureId
              )}
            </h3>
          </div>
          <p className='m-0 text-sm text-[var(--ink-soft)]'>
            Available {walletLabel.toLowerCase()}
          </p>
        </article>

        <article className={`${panelMutedClass} grid gap-2 p-4`}>
          <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
            Total added
          </p>
          <p className='m-0 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
            {formatBalanceAmount(
              walletBalance.granted,
              walletBalance,
              walletFeatureId
            )}
          </p>
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            Total balance added so far.
          </p>
        </article>

        <article className={`${panelMutedClass} grid gap-2 p-4`}>
          <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
            Total used
          </p>
          <p className='m-0 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
            {formatBalanceAmount(
              walletBalance.usage,
              walletBalance,
              walletFeatureId
            )}
          </p>
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            {walletBalance.overageAllowed
              ? 'Overages are allowed after your included balance is spent.'
              : 'Usage stops when the wallet runs out.'}
          </p>
        </article>
      </div>

      <WalletTopUpCard
        canManageOrgBilling={canManageOrgBilling}
        onAddFunds={onAddFunds}
        onQuantityChange={onQuantityChange}
        submissionState={submissionState}
        topUpQuantityInput={topUpQuantityInput}
        walletBalance={walletBalance}
        walletFeatureId={walletFeatureId}
        walletTopUpConfigurationMessage={walletTopUpConfigurationMessage}
        walletTopUpDescription={walletTopUpDescription}
        walletTopUpMaxPurchase={walletTopUpMaxPurchase}
        walletTopUpPlan={walletTopUpPlan}
      />

      <div className='grid gap-3'>
        <article className='grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                Usage history
              </p>
              <p className='m-0 mt-1 text-sm text-[var(--ink-soft)]'>
                Balance changes from purchases and usage will appear here.
              </p>
            </div>
          </div>

          {walletEventsIsPending ? (
            <div
              role='status'
              aria-label='Loading wallet transactions'
              className='grid gap-3'
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  aria-hidden='true'
                  className={`${panelMutedClass} flex flex-wrap items-start justify-between gap-3 p-4`}
                >
                  <div className='grid flex-1 gap-2'>
                    <Skeleton className='h-4 w-24 rounded-full' />
                    <Skeleton className='h-4 w-full max-w-sm rounded-full' />
                    <Skeleton className='h-3 w-28 rounded-full' />
                  </div>
                  <Skeleton className='h-8 w-20 rounded-full' />
                </div>
              ))}
            </div>
          ) : walletTransactions.length > 0 ? (
            <div className='grid gap-3'>
              {walletTransactions.map(transaction => {
                const amountLabel =
                  transaction.amountLabel ??
                  (transaction.amount === null
                    ? null
                    : `${transaction.amount >= 0 ? '+' : '-'}${formatBalanceAmount(
                        Math.abs(transaction.amount),
                        walletBalance,
                        walletFeatureId
                      )}`);

                return (
                  <article
                    key={transaction.id}
                    className={`${panelMutedClass} flex flex-wrap items-start justify-between gap-3 p-4`}
                  >
                    <div className='grid gap-1'>
                      <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
                        {transaction.title}
                      </p>
                      <p className='m-0 text-sm text-[var(--ink-soft)]'>
                        {transaction.description}
                      </p>
                      <p className='m-0 text-xs text-[var(--ink-soft)]'>
                        {formatTimestamp(transaction.timestamp)}
                      </p>
                    </div>
                    {amountLabel ? (
                      <p
                        className={`m-0 rounded-full px-3 py-1 text-sm font-semibold ${
                          transaction.tone === 'credit'
                            ? 'bg-[var(--surface)] text-[var(--success)]'
                            : 'bg-[var(--surface)] text-[var(--warning)]'
                        }`}
                      >
                        {amountLabel}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              className={`${panelMutedClass} p-4 text-sm text-[var(--ink-soft)]`}
            >
              No usage history yet. Purchases and usage events will show up
              here.
            </div>
          )}

          {walletEventsHasMore ? (
            <div>
              <Button variant='secondary' onClick={onLoadOlderActivity}>
                Load older activity
              </Button>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  ) : (
    <div className='grid gap-4'>
      <div className='grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr]'>
        <article className='grid gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'>
          <div>
            <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
              Remaining balance
            </p>
            <h3 className='m-0 mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
              {formatBalanceAmount(0, walletBalance, walletFeatureId)}
            </h3>
          </div>
          <p className='m-0 text-sm text-[var(--ink-soft)]'>
            Available balance
          </p>
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            Balance will appear here after grants or purchases are recorded.
          </p>
        </article>

        <article className={`${panelMutedClass} grid gap-2 p-4`}>
          <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
            Total added
          </p>
          <p className='m-0 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
            {formatBalanceAmount(0, walletBalance, walletFeatureId)}
          </p>
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            No balance has been granted to this customer yet.
          </p>
        </article>

        <article className={`${panelMutedClass} grid gap-2 p-4`}>
          <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
            Total used
          </p>
          <p className='m-0 text-2xl font-bold tracking-[-0.03em] text-[var(--ink)]'>
            {formatBalanceAmount(0, walletBalance, walletFeatureId)}
          </p>
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            Usage will show here once wallet activity is recorded.
          </p>
        </article>
      </div>

      <WalletTopUpCard
        canManageOrgBilling={canManageOrgBilling}
        onAddFunds={onAddFunds}
        onQuantityChange={onQuantityChange}
        submissionState={submissionState}
        topUpQuantityInput={topUpQuantityInput}
        walletBalance={walletBalance}
        walletFeatureId={walletFeatureId}
        walletTopUpConfigurationMessage={walletTopUpConfigurationMessage}
        walletTopUpDescription={walletTopUpDescription}
        walletTopUpMaxPurchase={walletTopUpMaxPurchase}
        walletTopUpPlan={walletTopUpPlan}
      />

      <div className='grid gap-3'>
        <article className='grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] p-4'>
          <div>
            <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
              Usage history
            </p>
            <p className='m-0 mt-1 text-sm text-[var(--ink-soft)]'>
              Purchases and usage events will show up here once this customer
              has activity.
            </p>
          </div>
          <div
            className={`${panelMutedClass} p-4 text-sm text-[var(--ink-soft)]`}
          >
            {walletConfigured
              ? 'The wallet is configured, but this customer does not have a balance yet.'
              : 'No wallet data is available for this customer yet.'}
          </div>
        </article>
      </div>
    </div>
  );
}
