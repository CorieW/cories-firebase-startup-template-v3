/**
 * Extracted subscriptions summary and plan card section.
 */
import { Button } from '../ui/button';
import {
  formatInvoiceDate,
  hasPaidPlanPrice,
  isSubscriptionCanceling,
} from './billing-dashboard.lib';
import type {
  AutumnPlan,
  AutumnSubscription,
  BillingSubmissionState,
} from './billing-dashboard.types';

export default function BillingPlansSection({
  activeSubscriptionSummary,
  activeSubscriptionsByPlanId,
  canManageOrgBilling,
  hasCancelableSubscription,
  currentSubscriptionIds,
  scope,
  scheduledSubscriptionIds,
  scheduledSubscriptionsByPlanId,
  scheduledSubscriptionSummary,
  submissionState,
  visiblePlans,
  onCancelPlan,
  onSelectPlan,
  onUnschedulePlan,
}: {
  activeSubscriptionSummary: string;
  activeSubscriptionsByPlanId: Map<string, AutumnSubscription>;
  canManageOrgBilling: boolean;
  hasCancelableSubscription: boolean;
  currentSubscriptionIds: Set<string>;
  scope: 'user' | 'organization';
  scheduledSubscriptionIds: Set<string>;
  scheduledSubscriptionsByPlanId: Map<string, AutumnSubscription>;
  scheduledSubscriptionSummary: string | null;
  submissionState: BillingSubmissionState | null;
  visiblePlans: AutumnPlan[];
  onCancelPlan: (subscription: AutumnSubscription) => void;
  onSelectPlan: (planId: string) => void;
  onUnschedulePlan: (subscription: AutumnSubscription) => void;
}) {
  return (
    <div className='grid gap-4'>
      <div className='grid gap-2 rounded-[16px] border border-[color-mix(in_srgb,var(--line)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface-soft)_80%,var(--primary)_4%)] p-4'>
        <p className='m-0 text-sm font-semibold text-[var(--ink)]'>
          Active subscriptions
        </p>
        <p className='m-0 text-sm text-[var(--ink-soft)]'>
          {activeSubscriptionSummary}
        </p>
        {scheduledSubscriptionSummary ? (
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            Scheduled next: {scheduledSubscriptionSummary}
          </p>
        ) : null}
        {scope === 'organization' ? (
          <p className='m-0 text-xs text-[var(--ink-soft)]'>
            {canManageOrgBilling
              ? 'Owners and admins can change the organization plan.'
              : 'Members can view billing, but only owners and admins can change plans.'}
          </p>
        ) : null}
      </div>

      {visiblePlans.length > 0 ? (
        <div className='grid gap-3 md:grid-cols-2'>
          {visiblePlans.map(plan => {
            const currentSubscription =
              activeSubscriptionsByPlanId.get(plan.id) ?? null;
            const scheduledSubscription =
              scheduledSubscriptionsByPlanId.get(plan.id) ?? null;
            const isCurrentPlan = currentSubscriptionIds.has(plan.id);
            const isScheduledPlan = scheduledSubscriptionIds.has(plan.id);
            const isCancelingPlan = currentSubscription
              ? isSubscriptionCanceling(currentSubscription)
              : false;
            const isFreePlan = !hasPaidPlanPrice(plan);
            const canCancelCurrentPlan =
              isCurrentPlan && hasPaidPlanPrice(plan);
            const isSelectingPlan =
              submissionState?.action === 'select-plan' &&
              submissionState.planId === plan.id;
            const isCancelingAction =
              submissionState?.action === 'cancel-plan' &&
              submissionState.planId === plan.id;
            const isUnschedulingAction =
              submissionState?.action === 'unschedule-plan' &&
              submissionState.planId === plan.id;

            return (
              <article
                key={plan.id}
                className={`grid gap-3 rounded-[18px] border p-4 ${
                  isCurrentPlan
                    ? 'border-[color-mix(in_srgb,var(--primary)_30%,var(--line-strong))] bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface))]'
                    : 'border-[color-mix(in_srgb,var(--line)_62%,transparent)] bg-[var(--surface)]'
                }`}
              >
                <div>
                  <p className='m-0 text-base font-semibold text-[var(--ink)]'>
                    {plan.name}
                  </p>
                  <p className='m-0 mt-1 text-sm text-[var(--ink-soft)]'>
                    {plan.description || ''}
                  </p>
                  {isCancelingPlan && currentSubscription?.expiresAt ? (
                    <p className='m-0 mt-2 text-xs text-[var(--ink-soft)]'>
                      Cancellation scheduled for{' '}
                      {formatInvoiceDate(currentSubscription.expiresAt)}.
                    </p>
                  ) : null}
                </div>
                {isCurrentPlan ? (
                  <div className='flex flex-wrap gap-2'>
                    <Button disabled>Current plan</Button>
                    {canCancelCurrentPlan ? (
                      isCancelingPlan ? (
                        <Button
                          variant='secondary'
                          disabled={
                            !canManageOrgBilling || isUnschedulingAction
                          }
                          onClick={() => {
                            if (currentSubscription) {
                              onUnschedulePlan(currentSubscription);
                            }
                          }}
                        >
                          {isUnschedulingAction
                            ? 'Undoing cancellation...'
                            : 'Undo cancellation'}
                        </Button>
                      ) : (
                        <Button
                          variant='secondary'
                          disabled={!canManageOrgBilling || isCancelingAction}
                          onClick={() => {
                            if (currentSubscription) {
                              onCancelPlan(currentSubscription);
                            }
                          }}
                        >
                          {isCancelingAction ? 'Canceling...' : 'Cancel plan'}
                        </Button>
                      )
                    ) : null}
                  </div>
                ) : isScheduledPlan ? (
                  <div className='flex flex-wrap gap-2'>
                    <Button disabled>Scheduled</Button>
                    {!isFreePlan ? (
                      <Button
                        variant='secondary'
                        disabled={
                          !canManageOrgBilling ||
                          !hasCancelableSubscription ||
                          isUnschedulingAction
                        }
                        onClick={() => {
                          if (scheduledSubscription) {
                            onUnschedulePlan(scheduledSubscription);
                          }
                        }}
                      >
                        {isUnschedulingAction
                          ? 'Unscheduling...'
                          : 'Unschedule'}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Button
                    disabled={!canManageOrgBilling || isSelectingPlan}
                    onClick={() => {
                      onSelectPlan(plan.id);
                    }}
                  >
                    {isSelectingPlan ? 'Opening checkout...' : 'Choose plan'}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
