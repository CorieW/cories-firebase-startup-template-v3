/**
 * Billing dashboard Autumn model aliases and internal UI types.
 */
import type { useCustomer, useListPlans } from 'autumn-js/react';
import type { BillingScope } from '../../lib/billing-api';
import type { BillingSection } from '../../lib/route-paths';

export interface BillingDashboardProps {
  scope: BillingScope;
  view: BillingSection;
}

export type AutumnCustomer = NonNullable<
  ReturnType<typeof useCustomer>['data']
>;
export type AutumnBalance = AutumnCustomer['balances'][string];
export type AutumnSubscription = AutumnCustomer['subscriptions'][number];
export type AutumnPlan = NonNullable<
  ReturnType<typeof useListPlans>['data']
>[number];
export type AutumnPlanItem = AutumnPlan['items'][number];

export type WalletTransaction = {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  amount: number | null;
  amountLabel?: string;
  tone: 'credit' | 'debit';
};

export type BillingSubmissionAction =
  | 'select-plan'
  | 'cancel-plan'
  | 'unschedule-plan'
  | 'top-up-wallet';

export type BillingSubmissionState = {
  action: BillingSubmissionAction;
  planId: string;
};
