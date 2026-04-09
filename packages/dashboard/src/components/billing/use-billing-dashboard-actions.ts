/**
 * Billing dashboard portal and checkout action handlers.
 */
import { useEffect, useState } from 'react';
import { createBillingActionReporter } from './billing-dashboard.logging';
import {
  formatBalanceAmount,
  getDefaultTopUpQuantity,
  getSubscriptionPlanId,
} from './billing-dashboard.lib';
import type {
  AutumnBalance,
  AutumnPlan,
  AutumnPlanItem,
  AutumnSubscription,
  BillingSubmissionState,
} from './billing-dashboard.types';

export function useBillingDashboardActions({
  attach,
  canManageOrgBilling,
  cancelingActiveSubscription,
  openCustomerPortal,
  scope,
  toast,
  updateSubscription,
  view,
  walletBalance,
  walletFeatureId,
  walletTopUpItem,
  walletTopUpMaxPurchase,
  walletTopUpPlan,
}: {
  attach: (input: {
    planId: string;
    successUrl?: string;
    featureQuantities?: Array<{
      featureId: string;
      quantity: number;
    }>;
  }) => Promise<unknown>;
  canManageOrgBilling: boolean;
  cancelingActiveSubscription: AutumnSubscription | null;
  openCustomerPortal: (input: { returnUrl?: string }) => Promise<unknown>;
  scope: 'user' | 'organization';
  toast: {
    error: (input: {
      title: string;
      description: string;
      durationMs?: number;
    }) => void;
    info: (input: { title: string; description: string }) => void;
    success: (input: { title: string; description: string }) => void;
  };
  updateSubscription: (input: {
    subscriptionId: string;
    planId?: string;
    cancelAction: 'cancel_end_of_cycle' | 'uncancel';
    redirectMode: 'never';
  }) => Promise<unknown>;
  view: 'subscriptions' | 'wallet';
  walletBalance: AutumnBalance | null;
  walletFeatureId: string | null;
  walletTopUpItem: AutumnPlanItem | null;
  walletTopUpMaxPurchase: number | null;
  walletTopUpPlan: AutumnPlan | null;
}) {
  const [submissionState, setSubmissionState] =
    useState<BillingSubmissionState | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [topUpQuantityInput, setTopUpQuantityInput] = useState('1');

  useEffect(() => {
    setTopUpQuantityInput(String(getDefaultTopUpQuantity(walletTopUpItem)));
  }, [walletTopUpItem]);

  function getActionContext() {
    return {
      route: typeof window !== 'undefined' ? window.location.pathname : null,
      scope,
      view,
    };
  }

  const billingReporter = createBillingActionReporter({
    getActionContext,
    setPortalError,
    setSubmissionState,
    toast,
  });

  function hasBillingManagementAccess(
    action: string,
    details: Record<string, unknown> = {}
  ) {
    if (canManageOrgBilling) {
      return true;
    }

    billingReporter.logBlocked(action, {
      reason: 'insufficient-permissions',
      ...details,
    });

    return false;
  }

  async function handleOpenPortal() {
    await billingReporter.runAction({
      action: 'openCustomerPortal',
      startNotice: {
        title: 'Opening billing portal',
        message: 'Redirecting you to the billing portal.',
      },
      errorTitle: 'Unable to open billing portal',
      fallbackErrorMessage: 'Unable to open the billing portal.',
      run: () =>
        openCustomerPortal({
          returnUrl:
            typeof window !== 'undefined' ? window.location.href : undefined,
        }),
    });
  }

  async function handleSelectPlan(planId: string) {
    if (!hasBillingManagementAccess('selectPlan', { planId })) {
      return;
    }

    await billingReporter.runAction({
      action: 'selectPlan',
      details: { planId },
      submissionState: {
        action: 'select-plan',
        planId,
      },
      startNotice: {
        title: 'Opening checkout',
        message: 'Redirecting you to checkout for the selected plan.',
      },
      errorTitle: 'Unable to update plan',
      fallbackErrorMessage: 'Unable to update the subscription.',
      run: () => attach({ planId }),
    });
  }

  async function handleCancelPlan(subscription: AutumnSubscription) {
    if (
      !hasBillingManagementAccess('cancelPlan', {
        subscriptionId: subscription.id,
      })
    ) {
      return;
    }

    const planId = getSubscriptionPlanId(subscription);
    await billingReporter.runAction({
      action: 'cancelPlan',
      details: {
        planId,
        subscriptionId: subscription.id,
      },
      submissionState: {
        action: 'cancel-plan',
        planId: planId ?? subscription.id,
      },
      successNotice: {
        title: 'Plan cancellation scheduled',
        message:
          'Your subscription will stay active until the end of the current billing period.',
      },
      errorTitle: 'Unable to cancel plan',
      fallbackErrorMessage: 'Unable to cancel the subscription.',
      run: () =>
        updateSubscription({
          subscriptionId: subscription.id,
          ...(planId ? { planId } : {}),
          cancelAction: 'cancel_end_of_cycle',
          redirectMode: 'never',
        }),
    });
  }

  async function handleUnschedulePlan(subscription: AutumnSubscription) {
    if (
      !hasBillingManagementAccess('unschedulePlan', {
        subscriptionId: subscription.id,
      })
    ) {
      return;
    }

    const subscriptionToUncancel = cancelingActiveSubscription ?? subscription;
    const planId = getSubscriptionPlanId(subscriptionToUncancel);
    await billingReporter.runAction({
      action: 'unschedulePlan',
      details: {
        planId,
        subscriptionId: subscriptionToUncancel.id,
      },
      submissionState: {
        action: 'unschedule-plan',
        planId: getSubscriptionPlanId(subscription) ?? subscription.id,
      },
      successNotice: {
        title: 'Plan kept active',
        message: 'The scheduled cancellation has been removed.',
      },
      errorTitle: 'Unable to unschedule plan',
      fallbackErrorMessage: 'Unable to unschedule the plan change.',
      run: () =>
        updateSubscription({
          subscriptionId: subscriptionToUncancel.id,
          ...(planId ? { planId } : {}),
          cancelAction: 'uncancel',
          redirectMode: 'never',
        }),
    });
  }

  async function handleAddFunds() {
    if (!walletTopUpPlan || !walletTopUpItem || !canManageOrgBilling) {
      billingReporter.logBlocked('topUpWallet', {
        hasWalletTopUpPlan: Boolean(walletTopUpPlan),
        hasWalletTopUpItem: Boolean(walletTopUpItem),
        canManageOrgBilling,
      });
      return;
    }

    const parsedQuantity = Number.parseInt(topUpQuantityInput, 10);
    const maxPurchase = walletTopUpMaxPurchase;
    billingReporter.logAction('topUpWallet', {
      planId: walletTopUpPlan.id,
      requestedQuantity: parsedQuantity,
      maxPurchase,
    });

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      billingReporter.logBlocked('topUpWallet', {
        reason: 'invalid-quantity',
        requestedQuantity: topUpQuantityInput,
      });
      billingReporter.reportError(
        'Unable to start wallet top-up',
        'Enter a positive whole number before starting checkout.'
      );
      return;
    }

    if (
      maxPurchase !== null &&
      maxPurchase !== undefined &&
      parsedQuantity > maxPurchase
    ) {
      billingReporter.logBlocked('topUpWallet', {
        reason: 'quantity-exceeds-maximum',
        requestedQuantity: parsedQuantity,
        maxPurchase,
      });
      billingReporter.reportError(
        'Unable to start wallet top-up',
        `Enter ${formatBalanceAmount(maxPurchase, walletBalance, walletFeatureId)} or less for this purchase.`
      );
      return;
    }

    await billingReporter.runAction({
      action: 'topUpWallet',
      details: {
        planId: walletTopUpPlan.id,
        requestedQuantity: parsedQuantity,
      },
      submissionState: {
        action: 'top-up-wallet',
        planId: walletTopUpPlan.id,
      },
      startNotice: {
        title: 'Opening checkout',
        message: 'Redirecting you to checkout for the wallet top-up.',
      },
      errorTitle: 'Unable to start wallet top-up',
      fallbackErrorMessage: 'Unable to start the wallet top-up checkout.',
      skipActionLog: true,
      run: () =>
        attach({
          planId: walletTopUpPlan.id,
          successUrl:
            typeof window !== 'undefined' ? window.location.href : undefined,
          featureQuantities: [
            {
              featureId: walletTopUpItem.featureId,
              quantity: parsedQuantity,
            },
          ],
        }),
    });
  }

  return {
    handleAddFunds,
    handleCancelPlan,
    handleOpenPortal,
    handleSelectPlan,
    handleUnschedulePlan,
    portalError,
    setTopUpQuantityInput,
    submissionState,
    topUpQuantityInput,
  };
}
