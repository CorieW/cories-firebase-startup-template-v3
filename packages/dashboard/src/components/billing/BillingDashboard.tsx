/**
 * Billing summary and action dashboard component.
 */
import { useToast } from '../toast/ToastProvider';
import { Skeleton } from '../ui/skeleton';
import BillingPlansSection from './BillingPlansSection';
import BillingWalletSection from './BillingWalletSection';
import { useBillingErrorToast } from './billing-dashboard.lib';
import type { BillingDashboardProps } from './billing-dashboard.types';
import { useBillingDashboardActions } from './use-billing-dashboard-actions';
import { useBillingDashboardData } from './use-billing-dashboard-data';

const scopeTitleMap: Record<BillingDashboardProps['scope'], string> = {
  user: 'Personal billing',
  organization: 'Organization billing',
};

const dashboardTitleMap: Record<BillingDashboardProps['view'], string> = {
  subscriptions: 'Plans and billing',
  wallet: 'Wallet balance and activity',
};

function BillingSubscriptionsSkeleton() {
  return (
    <div className='grid gap-4' aria-hidden='true'>
      <div className='grid gap-2 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'>
        <Skeleton className='h-4 w-40 rounded-full' />
        <Skeleton className='h-4 w-full max-w-xl rounded-full' />
        <Skeleton className='h-3 w-56 rounded-full' />
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {Array.from({ length: 2 }).map((_, index) => (
          <article
            key={index}
            className='grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] p-4'
          >
            <div className='grid gap-2'>
              <Skeleton className='h-5 w-28 rounded-full' />
              <Skeleton className='h-4 w-full rounded-full' />
              <Skeleton className='h-4 w-4/5 rounded-full' />
            </div>
            <Skeleton className='h-10 w-32 rounded-[12px]' />
          </article>
        ))}
      </div>
    </div>
  );
}

function BillingWalletSkeleton() {
  return (
    <div className='grid gap-4' aria-hidden='true'>
      <div className='grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr]'>
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className='grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] p-4'
          >
            <Skeleton className='h-4 w-28 rounded-full' />
            <Skeleton className='h-8 w-32 rounded-full' />
            <Skeleton className='h-3 w-24 rounded-full' />
          </article>
        ))}
      </div>

      <article className='grid gap-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'>
        <div className='grid gap-2'>
          <Skeleton className='h-4 w-24 rounded-full' />
          <Skeleton className='h-4 w-56 rounded-full' />
        </div>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='grid min-w-[180px] flex-1 gap-2'>
            <Skeleton className='h-3 w-24 rounded-full' />
            <Skeleton className='h-10 w-full rounded-[12px]' />
          </div>
          <Skeleton className='h-10 w-28 rounded-[12px]' />
        </div>
        <Skeleton className='h-3 w-64 rounded-full' />
      </article>

      <article className='grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)] p-4'>
        <div className='grid gap-2'>
          <Skeleton className='h-4 w-28 rounded-full' />
          <Skeleton className='h-4 w-72 rounded-full' />
        </div>
        <div className='grid gap-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='flex flex-wrap items-start justify-between gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] p-4'
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
      </article>
    </div>
  );
}

function BillingDashboardSkeleton({
  view,
}: Pick<BillingDashboardProps, 'view'>) {
  return (
    <div
      role='status'
      aria-label='Loading billing details'
      className='grid gap-4'
    >
      {view === 'subscriptions' ? <BillingSubscriptionsSkeleton /> : null}
      {view === 'wallet' ? <BillingWalletSkeleton /> : null}
    </div>
  );
}

/**
 * Shared scope-aware billing dashboard shell backed by Autumn.
 */
export default function BillingDashboard({
  scope,
  view,
}: BillingDashboardProps) {
  const { toast } = useToast();
  const data = useBillingDashboardData({
    scope,
    view,
  });
  const actions = useBillingDashboardActions({
    attach: data.attach,
    canManageOrgBilling: data.canManageOrgBilling,
    cancelingActiveSubscription: data.cancelingActiveSubscription,
    openCustomerPortal: data.openCustomerPortal,
    scope,
    toast,
    updateSubscription: data.updateSubscription,
    view,
    walletBalance: data.walletBalance,
    walletFeatureId: data.walletFeatureId,
    walletTopUpItem: data.walletTopUpItem,
    walletTopUpMaxPurchase: data.walletTopUpMaxPurchase,
    walletTopUpPlan: data.walletTopUpPlan,
  });

  useBillingErrorToast(
    data.customerErrorMessage,
    'Unable to load billing details',
    toast
  );
  useBillingErrorToast(
    data.plansErrorMessage,
    'Unable to load billing plans',
    toast
  );
  useBillingErrorToast(
    data.walletEventsErrorMessage,
    'Unable to load wallet activity',
    toast
  );

  const inlineErrorMessage =
    actions.portalError ??
    data.customerErrorMessage ??
    data.plansErrorMessage ??
    data.walletEventsErrorMessage;

  return (
    <section
      aria-busy={data.isPending}
      className='grid gap-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5'
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='m-0 text-xs font-semibold tracking-[0.08em] text-[var(--ink-soft)] uppercase'>
            {scopeTitleMap[scope]}
          </p>
          <h2 className='m-0 mt-1 text-xl font-bold text-[var(--ink)]'>
            {dashboardTitleMap[view]}
          </h2>
        </div>
        {data.isPending ? (
          <Skeleton aria-hidden='true' className='h-10 w-40 rounded-[12px]' />
        ) : (
          <button
            type='button'
            className='inline-flex h-10 items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--line-strong)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60'
            onClick={() => {
              void actions.handleOpenPortal();
            }}
          >
            Open billing portal
          </button>
        )}
      </div>

      {inlineErrorMessage ? (
        <div
          role='alert'
          className='rounded-md border border-[var(--danger)] bg-[var(--danger-surface)] px-3 py-2 text-sm text-[var(--danger)]'
        >
          {inlineErrorMessage}
        </div>
      ) : null}

      {data.isPending ? <BillingDashboardSkeleton view={view} /> : null}

      {!data.isPending ? (
        <div className='grid gap-4'>
          {view === 'subscriptions' ? (
            <BillingPlansSection
              activeSubscriptionSummary={data.activeSubscriptionSummary}
              activeSubscriptionsByPlanId={data.activeSubscriptionsByPlanId}
              canManageOrgBilling={data.canManageOrgBilling}
              hasCancelableSubscription={Boolean(
                data.cancelingActiveSubscription
              )}
              currentSubscriptionIds={data.currentSubscriptionIds}
              scope={scope}
              scheduledSubscriptionIds={data.scheduledSubscriptionIds}
              scheduledSubscriptionsByPlanId={
                data.scheduledSubscriptionsByPlanId
              }
              scheduledSubscriptionSummary={data.scheduledSubscriptionSummary}
              submissionState={actions.submissionState}
              visiblePlans={data.visiblePlans}
              onCancelPlan={subscription => {
                void actions.handleCancelPlan(subscription);
              }}
              onSelectPlan={planId => {
                void actions.handleSelectPlan(planId);
              }}
              onUnschedulePlan={subscription => {
                void actions.handleUnschedulePlan(subscription);
              }}
            />
          ) : null}

          {data.showsWalletActivity ? (
            <BillingWalletSection
              canManageOrgBilling={data.canManageOrgBilling}
              onAddFunds={() => {
                void actions.handleAddFunds();
              }}
              onLoadOlderActivity={() => {
                data.walletEvents.nextPage();
              }}
              onQuantityChange={actions.setTopUpQuantityInput}
              submissionState={actions.submissionState}
              topUpQuantityInput={actions.topUpQuantityInput}
              walletBalance={data.walletBalance}
              walletConfigured={data.walletConfigured}
              walletEventsHasMore={data.walletEvents.hasMore}
              walletEventsIsPending={data.walletEvents.isPending}
              walletFeatureId={data.walletFeatureId}
              walletLabel={data.walletLabel}
              walletTopUpConfigurationMessage={
                data.walletTopUpConfigurationMessage
              }
              walletTopUpDescription={data.walletTopUpDescription}
              walletTopUpMaxPurchase={data.walletTopUpMaxPurchase}
              walletTopUpPlan={data.walletTopUpPlan}
              walletTransactions={data.walletTransactions}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
