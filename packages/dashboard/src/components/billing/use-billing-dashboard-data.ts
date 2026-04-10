/**
 * Billing dashboard derived data and Autumn hook composition.
 */
import commonLogging from '@cories-firebase-startup-template-v3/common/logging';
import { useCustomer, useListEvents, useListPlans } from 'autumn-js/react';
import { useEffect, useMemo, useRef } from 'react';
import { useActiveMember } from '../../lib/auth-client';
import type { BillingScope } from '../../lib/billing-api';
import {
  WALLET_CREDIT_COST_SNAPSHOT_PROPERTY,
  WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY,
} from '../../lib/chat-usage';
import type { BillingSection } from '../../lib/route-paths';
import {
  formatBalanceAmount,
  formatFeatureLabel,
  formatInvoiceDate,
  formatQuantity,
  getAutumnErrorMessage,
  getBalanceCurrencyCode,
  getBalanceLabel,
  getFeatureCurrencyCode,
  getNumericEventProperty,
  getPricedPlanItem,
  getSubscriptionPlanId,
  getSubscriptionPlanName,
  getUnitLabel,
  getWalletBalance,
  getWalletPurchaseCredits,
  getWalletTopUpConfigurationMessage,
  getWalletTopUpItem,
  getWalletTopUpPlan,
  hasPaidPlanPrice,
  isScheduledSubscription,
  isSubscriptionCanceling,
} from './billing-dashboard.lib';
import type {
  AutumnSubscription,
  WalletTransaction,
} from './billing-dashboard.types';

const scopePlanGroupMap: Record<BillingScope, string> = {
  user: 'user',
  organization: 'org',
};
const { createScopedLogger } = commonLogging;
const billingDataLogger = createScopedLogger('BILLING_DATA');

function matchesBillingScope(
  planGroup: string | null | undefined,
  expectedGroup: string
) {
  return !planGroup || planGroup === expectedGroup;
}

function isManagedSubscriptionPlan(
  plan:
    | {
        price?: {
          interval?: string | null;
        } | null;
        items?: Array<{
          price?: {
            interval?: string | null;
          } | null;
        }> | null;
      }
    | null
    | undefined
) {
  const pricedItem = getPricedPlanItem(plan);

  return (
    plan?.price?.interval !== 'one_off' &&
    pricedItem?.price?.interval !== 'one_off'
  );
}

export function useBillingDashboardData({
  scope,
  view,
}: {
  scope: BillingScope;
  view: BillingSection;
}) {
  const showsWalletActivity = view === 'wallet';
  const {
    data: customer,
    isPending,
    isRefetchError: isCustomerRefetchError,
    openCustomerPortal,
    attach,
    updateSubscription,
    error: customerError,
  } = useCustomer();
  const {
    data: plans,
    error: plansError,
    isRefetchError: isPlansRefetchError,
  } = useListPlans();
  const activeMember = useActiveMember();

  const canManageOrgBilling =
    scope === 'user' ||
    activeMember.data?.role === 'owner' ||
    activeMember.data?.role === 'admin';

  const plansById = useMemo(() => {
    return new Map((plans ?? []).map(plan => [plan.id, plan]));
  }, [plans]);

  const scopedSubscriptions = useMemo<AutumnSubscription[]>(() => {
    const expectedGroup = scopePlanGroupMap[scope];

    return (customer?.subscriptions ?? []).filter(subscription => {
      const planId = getSubscriptionPlanId(subscription);

      if (!planId) {
        return false;
      }

      const matchingPlan = plansById.get(planId);

      return matchingPlan
        ? matchesBillingScope(matchingPlan.group, expectedGroup) &&
            isManagedSubscriptionPlan(matchingPlan)
        : true;
    });
  }, [customer, plansById, scope]);

  const activeSubscriptions = useMemo(() => {
    return scopedSubscriptions.filter(
      subscription => !isScheduledSubscription(subscription)
    );
  }, [scopedSubscriptions]);

  const scheduledSubscriptions = useMemo(() => {
    return scopedSubscriptions.filter(subscription => {
      if (!isScheduledSubscription(subscription)) {
        return false;
      }

      const planId = getSubscriptionPlanId(subscription);

      return planId ? hasPaidPlanPrice(plansById.get(planId)) : true;
    });
  }, [plansById, scopedSubscriptions]);

  const currentSubscriptionIds = useMemo(() => {
    return new Set(
      activeSubscriptions
        .map(subscription => getSubscriptionPlanId(subscription))
        .filter((planId): planId is string => Boolean(planId))
    );
  }, [activeSubscriptions]);

  const activeSubscriptionsByPlanId = useMemo(() => {
    return new Map(
      activeSubscriptions
        .map(subscription => {
          const planId = getSubscriptionPlanId(subscription);

          return planId ? [planId, subscription] : null;
        })
        .filter(
          (entry): entry is [string, AutumnSubscription] => entry !== null
        )
    );
  }, [activeSubscriptions]);

  const cancelingActiveSubscription = useMemo(() => {
    return (
      activeSubscriptions.find(subscription =>
        isSubscriptionCanceling(subscription)
      ) ?? null
    );
  }, [activeSubscriptions]);

  const visiblePlans = useMemo(() => {
    const expectedGroup = scopePlanGroupMap[scope];

    return (plans ?? []).filter(plan => {
      if (!matchesBillingScope(plan.group, expectedGroup)) {
        return false;
      }

      if (!isManagedSubscriptionPlan(plan)) {
        return false;
      }

      return hasPaidPlanPrice(plan) || currentSubscriptionIds.has(plan.id);
    });
  }, [currentSubscriptionIds, plans, scope]);
  const scheduledSubscriptionIds = useMemo(() => {
    return new Set(
      scheduledSubscriptions
        .map(subscription => getSubscriptionPlanId(subscription))
        .filter((planId): planId is string => Boolean(planId))
    );
  }, [scheduledSubscriptions]);

  const scheduledSubscriptionsByPlanId = useMemo(() => {
    return new Map(
      scheduledSubscriptions
        .map(subscription => {
          const planId = getSubscriptionPlanId(subscription);

          return planId ? [planId, subscription] : null;
        })
        .filter(
          (entry): entry is [string, AutumnSubscription] => entry !== null
        )
    );
  }, [scheduledSubscriptions]);

  const walletTopUpPlan = useMemo(() => {
    return getWalletTopUpPlan(plans ?? null);
  }, [plans]);

  const walletFeatureId = useMemo(() => {
    const creditBalanceFeatureId = Object.values(customer?.balances ?? {}).find(
      balance => balance.feature?.type === 'credit_system'
    )?.featureId;

    return (
      creditBalanceFeatureId ??
      walletTopUpPlan?.items.find(
        item =>
          item.price?.interval === 'one_off' &&
          item.price?.billingMethod === 'prepaid'
      )?.featureId ??
      null
    );
  }, [customer, walletTopUpPlan]);

  const walletTopUpItem = useMemo(() => {
    return getWalletTopUpItem(walletTopUpPlan, walletFeatureId);
  }, [walletFeatureId, walletTopUpPlan]);

  const walletBalance = useMemo(() => {
    return getWalletBalance(customer ?? undefined, walletFeatureId);
  }, [customer, walletFeatureId]);

  const walletConfigured = useMemo(() => {
    const hasWalletPlan = Boolean(walletTopUpItem);
    const hasWalletPurchase = (customer?.purchases ?? []).some(
      purchase => getWalletPurchaseCredits(purchase, walletFeatureId) !== null
    );

    return Boolean(walletBalance) || hasWalletPlan || hasWalletPurchase;
  }, [customer, walletBalance, walletFeatureId, walletTopUpItem]);

  const walletTopUpPrice = walletTopUpItem?.price ?? null;
  const walletTopUpMaxPurchase =
    walletTopUpPrice?.maxPurchase ?? walletBalance?.maxPurchase ?? null;
  const walletTopUpConfigurationMessage = useMemo(() => {
    if (walletTopUpItem) {
      return null;
    }

    return getWalletTopUpConfigurationMessage(walletTopUpPlan);
  }, [walletTopUpItem, walletTopUpPlan]);
  const walletFeatureDisplayName =
    walletBalance?.feature?.name ??
    walletTopUpItem?.feature?.name ??
    walletFeatureId ??
    'Balance';
  const walletUsesCurrencyDisplay = Boolean(
    getBalanceCurrencyCode(walletBalance) ??
    getFeatureCurrencyCode(walletFeatureId)
  );
  const walletLabel = walletUsesCurrencyDisplay
    ? 'Balance'
    : walletFeatureDisplayName;
  const walletTopUpDescription = 'Add balance through secure checkout.';

  const walletCreditCostByFeatureId = useMemo(() => {
    return new Map(
      (walletBalance?.feature?.creditSchema ?? []).map(entry => [
        entry.meteredFeatureId,
        entry.creditCost,
      ])
    );
  }, [walletBalance]);

  const walletTransactionFeatureIds = useMemo(() => {
    const relatedFeatureIds = Array.from(walletCreditCostByFeatureId.keys());

    if (walletBalance) {
      return Array.from(
        new Set([walletBalance.featureId, ...relatedFeatureIds])
      );
    }

    if (walletConfigured && walletFeatureId) {
      return [walletFeatureId];
    }

    return relatedFeatureIds;
  }, [
    walletBalance,
    walletConfigured,
    walletCreditCostByFeatureId,
    walletFeatureId,
  ]);

  const walletRelatedFeatureNames = useMemo(() => {
    const relatedNames = new Map<string, string>();

    if (walletFeatureId) {
      relatedNames.set(walletFeatureId, getBalanceLabel(walletBalance));
    }

    for (const balance of Object.values(customer?.balances ?? {})) {
      relatedNames.set(
        balance.featureId,
        balance.feature?.name ?? formatFeatureLabel(balance.featureId)
      );
    }

    for (const meteredFeatureId of walletTransactionFeatureIds) {
      if (!relatedNames.has(meteredFeatureId)) {
        relatedNames.set(
          meteredFeatureId,
          formatFeatureLabel(meteredFeatureId)
        );
      }
    }

    return relatedNames;
  }, [customer, walletBalance, walletFeatureId, walletTransactionFeatureIds]);

  const walletEvents = useListEvents({
    featureId: walletTransactionFeatureIds,
    limit: 8,
    queryOptions: {
      enabled: showsWalletActivity && walletTransactionFeatureIds.length > 0,
      refetchOnMount: true,
    },
  });
  // Keep background refresh failures from surfacing as blocking UI when we
  // already have cached billing data on screen.
  const hasCustomerData = typeof customer !== 'undefined';
  const hasPlansData = typeof plans !== 'undefined';
  const hasWalletEventsData = typeof walletEvents.data !== 'undefined';

  const customerErrorMessage = useMemo(() => {
    if (!customerError) {
      return null;
    }

    if (isCustomerRefetchError && hasCustomerData) {
      return null;
    }

    return getAutumnErrorMessage(
      customerError,
      'Unable to load billing details.'
    );
  }, [customerError, hasCustomerData, isCustomerRefetchError]);
  const plansErrorMessage = useMemo(() => {
    if (!plansError) {
      return null;
    }

    if (isPlansRefetchError && hasPlansData) {
      return null;
    }

    return getAutumnErrorMessage(plansError, 'Unable to load billing plans.');
  }, [hasPlansData, isPlansRefetchError, plansError]);
  const walletEventsErrorMessage = useMemo(() => {
    if (!walletEvents.error) {
      return null;
    }

    if (walletEvents.isRefetchError && hasWalletEventsData) {
      return null;
    }

    return getAutumnErrorMessage(
      walletEvents.error,
      'Unable to load recent wallet activity.'
    );
  }, [
    hasWalletEventsData,
    walletEvents.data,
    walletEvents.error,
    walletEvents.isRefetchError,
  ]);

  const walletPurchaseTransactions = useMemo<WalletTransaction[]>(() => {
    return (customer?.purchases ?? [])
      .filter(
        purchase => getWalletPurchaseCredits(purchase, walletFeatureId) !== null
      )
      .map(purchase => {
        const creditsAdded =
          getWalletPurchaseCredits(purchase, walletFeatureId) ?? 0;
        const planName = purchase.plan?.name ?? purchase.planId;

        return {
          id: `purchase-${purchase.planId}-${purchase.startedAt}`,
          title: planName,
          description: walletUsesCurrencyDisplay
            ? `Added ${formatBalanceAmount(creditsAdded, walletBalance, walletFeatureId)} balance`
            : `Added ${formatQuantity(creditsAdded)} ${getUnitLabel(walletBalance, creditsAdded)}`,
          timestamp: purchase.startedAt,
          amount: creditsAdded,
          tone: 'credit',
        };
      });
  }, [customer, walletBalance, walletFeatureId, walletUsesCurrencyDisplay]);

  const walletEventTransactions = useMemo<WalletTransaction[]>(() => {
    return (walletEvents.list ?? []).map(event => {
      const featureName =
        walletRelatedFeatureNames.get(event.featureId) ?? event.featureId;
      const snapshotCreditCost = getNumericEventProperty(
        event.properties,
        WALLET_CREDIT_COST_SNAPSHOT_PROPERTY
      );
      const snapshotWalletAmount = getNumericEventProperty(
        event.properties,
        WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY
      );

      if (walletFeatureId && event.featureId === walletFeatureId) {
        return {
          id: event.id,
          title: featureName,
          description: `${formatQuantity(event.value)} ${getUnitLabel(walletBalance, event.value)} adjusted`,
          timestamp: event.timestamp,
          amount: event.value,
          tone: event.value >= 0 ? 'credit' : 'debit',
        };
      }

      const walletAmount =
        snapshotWalletAmount !== null
          ? snapshotWalletAmount
          : snapshotCreditCost !== null
            ? event.value * snapshotCreditCost
            : null;

      return {
        id: event.id,
        title: featureName,
        description: `${formatQuantity(event.value)} units`,
        timestamp: event.timestamp,
        amount: walletAmount !== null ? -walletAmount : null,
        tone: 'debit',
      };
    });
  }, [
    walletEvents.list,
    walletRelatedFeatureNames,
    walletFeatureId,
    walletBalance,
  ]);

  const walletTransactions = useMemo(() => {
    return [...walletPurchaseTransactions, ...walletEventTransactions].sort(
      (first, second) => second.timestamp - first.timestamp
    );
  }, [walletEventTransactions, walletPurchaseTransactions]);

  const activeSubscriptionSummary =
    activeSubscriptions.length > 0
      ? activeSubscriptions
          .map(subscription => getSubscriptionPlanName(subscription, plansById))
          .join(', ')
      : 'No active paid plan yet.';

  const scheduledSubscriptionSummary =
    scheduledSubscriptions.length > 0
      ? scheduledSubscriptions
          .map(subscription => {
            const planName = getSubscriptionPlanName(subscription, plansById);
            const startsAtLabel = formatInvoiceDate(subscription.startedAt);

            return `${planName} (${startsAtLabel})`;
          })
          .join(', ')
      : null;

  const lastSummaryRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    const nextSummary = JSON.stringify({
      scope,
      view,
      hasCustomer: Boolean(customer?.id),
      visiblePlansCount: visiblePlans.length,
      activeSubscriptionsCount: activeSubscriptions.length,
      scheduledSubscriptionsCount: scheduledSubscriptions.length,
      walletTransactionsCount: walletTransactions.length,
      hasWalletBalance: Boolean(walletBalance),
    });

    if (lastSummaryRef.current === nextSummary) {
      return;
    }

    lastSummaryRef.current = nextSummary;
    billingDataLogger.log(
      'VIEW_READY',
      {
        action: 'loadBillingDashboardView',
        status: 'success',
        scope,
        view,
        hasCustomer: Boolean(customer?.id),
        visiblePlansCount: visiblePlans.length,
        activeSubscriptionsCount: activeSubscriptions.length,
        scheduledSubscriptionsCount: scheduledSubscriptions.length,
        walletTransactionsCount: walletTransactions.length,
        hasWalletBalance: Boolean(walletBalance),
      },
      'info'
    );
  }, [
    activeSubscriptions.length,
    customer?.id,
    isPending,
    scheduledSubscriptions.length,
    scope,
    view,
    visiblePlans.length,
    walletBalance,
    walletTransactions.length,
  ]);

  return {
    activeSubscriptions,
    activeSubscriptionsByPlanId,
    activeSubscriptionSummary,
    attach,
    cancelingActiveSubscription,
    canManageOrgBilling,
    currentSubscriptionIds,
    customer,
    customerErrorMessage,
    isPending,
    openCustomerPortal,
    plans,
    plansById,
    plansErrorMessage,
    scheduledSubscriptionIds,
    scheduledSubscriptions,
    scheduledSubscriptionsByPlanId,
    scheduledSubscriptionSummary,
    scopedSubscriptions,
    showsWalletActivity,
    updateSubscription,
    view,
    visiblePlans,
    walletBalance,
    walletConfigured,
    walletEvents,
    walletEventsErrorMessage,
    walletFeatureId,
    walletLabel,
    walletRelatedFeatureNames,
    walletTopUpConfigurationMessage,
    walletTopUpDescription,
    walletTopUpItem,
    walletTopUpMaxPurchase,
    walletTopUpPlan,
    walletTransactions,
    walletUsesCurrencyDisplay,
  };
}
