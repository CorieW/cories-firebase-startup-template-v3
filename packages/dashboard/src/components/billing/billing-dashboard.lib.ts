/**
 * Billing dashboard formatting, parsing, and wallet helper functions.
 */
import commonLogging from '@cories-firebase-startup-template-v3/common/logging';
import { useEffect, useRef } from 'react';
import {
  type AutumnCustomer,
  type AutumnBalance,
  type AutumnPlan,
  type AutumnPlanItem,
} from './billing-dashboard.types';

const { createScopedLogger } = commonLogging;
const billingUiLogger = createScopedLogger('BILLING_UI');

const quantityFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});
const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const invoiceDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});
const fallbackCurrencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function getSubscriptionPlanId(subscription: {
  plan?: {
    id: string;
  } | null;
  planId?: string | null;
}) {
  return subscription.plan?.id ?? subscription.planId ?? null;
}

export function getSubscriptionPlanName(
  subscription: {
    plan?: {
      id: string;
      name?: string | null;
    } | null;
    planId?: string | null;
  },
  plansById?: ReadonlyMap<string, AutumnPlan>
) {
  const planId = getSubscriptionPlanId(subscription);

  return (
    subscription.plan?.name ??
    (planId ? plansById?.get(planId)?.name : null) ??
    planId ??
    'Billing plan'
  );
}

export function isScheduledSubscription(subscription: {
  status?: string | null;
}) {
  return subscription.status?.toLowerCase() === 'scheduled';
}

export function isSubscriptionCanceling(subscription: {
  canceledAt?: number | null;
}) {
  return (
    subscription.canceledAt !== null && subscription.canceledAt !== undefined
  );
}

export function hasPaidPlanPrice(plan: AutumnPlan | null | undefined) {
  if (!plan) {
    return false;
  }

  if (typeof plan.price?.amount === 'number' && plan.price.amount > 0) {
    return true;
  }

  return plan.items.some(item => {
    if (!item.price) {
      return false;
    }

    if (item.price.tiers && item.price.tiers.length > 0) {
      return true;
    }

    return typeof item.price.amount === 'number' && item.price.amount > 0;
  });
}

export function formatQuantity(value: number) {
  return quantityFormatter.format(value);
}

function formatCurrency(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return fallbackCurrencyFormatter.format(value);
  }
}

export function getFeatureCurrencyCode(featureId: string | null | undefined) {
  const match = featureId?.match(/^([a-z]{3})[_-]/i);

  return match ? match[1].toUpperCase() : null;
}

export function getBalanceCurrencyCode(
  balance: AutumnBalance | null | undefined
) {
  return getFeatureCurrencyCode(balance?.featureId ?? balance?.feature?.id);
}

export function formatBalanceAmount(
  value: number,
  balance: AutumnBalance | null | undefined,
  featureId?: string | null
) {
  const currencyCode =
    getBalanceCurrencyCode(balance) ?? getFeatureCurrencyCode(featureId);

  return currencyCode
    ? formatCurrency(value, currencyCode)
    : formatQuantity(value);
}

export function getNumericEventProperty(properties: unknown, key: string) {
  if (!properties || typeof properties !== 'object') {
    return null;
  }

  const value = (properties as Record<string, unknown>)[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

export function normalizeWholeNumberInput(value: string) {
  return /^\d*$/.test(value) ? value : null;
}

export function formatTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) {
    return 'Not scheduled';
  }

  return timestampFormatter.format(timestamp);
}

export function formatInvoiceDate(timestamp: number | null | undefined) {
  if (!timestamp) {
    return 'Unknown date';
  }

  return invoiceDateFormatter.format(timestamp);
}

export function getBalanceLabel(balance: AutumnBalance | null | undefined) {
  return balance?.feature?.name ?? 'Wallet balance';
}

export function formatFeatureLabel(featureId: string | null | undefined) {
  if (!featureId) {
    return 'Usage';
  }

  return featureId
    .replaceAll(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

export function getUnitLabel(
  balance: AutumnBalance | null | undefined,
  quantity: number,
  fallback = 'balance'
) {
  const absoluteQuantity = Math.abs(quantity);
  const singular = balance?.feature?.display?.singular;
  const plural = balance?.feature?.display?.plural;

  if (absoluteQuantity === 1 && singular) {
    return singular;
  }

  return plural ?? singular ?? fallback;
}

export function getWalletPurchaseCredits(
  purchase: AutumnCustomer['purchases'][number],
  walletFeatureId: string | null
) {
  if (!walletFeatureId) {
    return null;
  }

  const walletItemCredits =
    purchase.plan?.items
      ?.filter(item => item.featureId === walletFeatureId)
      .reduce((total, item) => total + item.included, 0) ?? 0;

  if (walletItemCredits <= 0) {
    return null;
  }

  return walletItemCredits * Math.max(purchase.quantity, 1);
}

export function getDefaultTopUpQuantity(item: AutumnPlanItem | null) {
  if (!item) {
    return 1;
  }

  const suggestedQuantity = Math.max(
    item.included ?? 0,
    item.price?.billingUnits ?? 0,
    1
  );
  const maxPurchase = item.price?.maxPurchase;

  if (maxPurchase !== null && maxPurchase !== undefined) {
    return Math.min(suggestedQuantity, maxPurchase);
  }

  return suggestedQuantity;
}

export function getPricedPlanItem(
  plan:
    | {
        items?: Array<{
          featureId?: string;
          price?: {
            amount?: number | null;
            billingUnits?: number | null;
            interval?: string | null;
            billingMethod?: string | null;
          } | null;
        }> | null;
      }
    | null
    | undefined
) {
  if (!plan?.items?.length) {
    return null;
  }

  return (
    plan.items.find(
      item =>
        item.price?.amount !== null &&
        item.price?.amount !== undefined &&
        item.price.interval === 'one_off'
    ) ??
    plan.items.find(
      item => item.price?.amount !== null && item.price?.amount !== undefined
    ) ??
    null
  );
}

export function parseAutumnErrorBody(body: unknown) {
  if (typeof body !== 'string') {
    return null;
  }

  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmedBody) as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }

    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return parsed.error;
    }

    return null;
  } catch {
    return trimmedBody;
  }
}

export function getAutumnErrorMessage(
  caughtError: unknown,
  fallbackMessage: string
) {
  function sanitizeBillingMessage(message: string) {
    return message
      .replaceAll('Autumn-backed', 'billing')
      .replaceAll('Autumn', 'Billing')
      .replaceAll('autumn', 'billing');
  }

  if (!caughtError || typeof caughtError !== 'object') {
    return caughtError instanceof Error
      ? sanitizeBillingMessage(caughtError.message)
      : fallbackMessage;
  }

  const typedError = caughtError as {
    body?: unknown;
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
  };
  const parsedBodyMessage = parseAutumnErrorBody(typedError.body);

  if (parsedBodyMessage) {
    const currencyMismatch = parsedBodyMessage.match(
      /supports [`']?([a-z]{3})[`']?.*expected currency:\s*[`']?([a-z]{3})[`']?/i
    );

    if (currencyMismatch) {
      const [, supportedCurrency, expectedCurrency] = currencyMismatch;

      return `Wallet top-up is configured for ${supportedCurrency.toUpperCase()}, but your current billing currency is ${expectedCurrency.toUpperCase()}. Add a matching ${expectedCurrency.toUpperCase()} price to the top-up product or align your billing currencies.`;
    }

    return sanitizeBillingMessage(parsedBodyMessage);
  }

  if (typeof typedError.message === 'string' && typedError.message.trim()) {
    return sanitizeBillingMessage(typedError.message);
  }

  if (typedError.status === 429 || typedError.statusCode === 429) {
    return 'Too many requests, please try again later.';
  }

  return fallbackMessage;
}

export function useBillingErrorToast(
  errorMessage: string | null,
  title: string,
  toast: {
    error: (input: {
      title: string;
      description: string;
      durationMs: number;
    }) => void;
  }
) {
  const lastErrorMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!errorMessage) {
      lastErrorMessageRef.current = null;
      return;
    }

    if (lastErrorMessageRef.current === errorMessage) {
      return;
    }

    lastErrorMessageRef.current = errorMessage;
    billingUiLogger.log(
      'ERROR_TOAST',
      {
        action: 'showBillingErrorToast',
        title,
        message: errorMessage,
      },
      'error'
    );
    toast.error({
      title,
      description: errorMessage,
      durationMs: 7200,
    });
  }, [errorMessage, title, toast]);
}

export function getWalletTopUpConfigurationMessage(plan: AutumnPlan | null) {
  if (!plan) {
    return null;
  }

  return `The "${plan.id}" top-up product does not currently include a balance feature item, so checkout cannot honor the requested quantity or grant balance. Update the product to include the intended balance feature and pricing before enabling top-ups here.`;
}

export function getWalletTopUpPlan(plans: AutumnPlan[] | null | undefined) {
  if (!plans?.length) {
    return null;
  }

  const topUpKeywords = /\b(top[\s_-]?up|wallet|credit)s?\b/i;

  return (
    plans.find(plan => {
      const searchableCopy = [plan.id, plan.name, plan.description ?? ''].join(
        ' '
      );

      return topUpKeywords.test(searchableCopy);
    }) ??
    plans.find(plan =>
      plan.items.some(
        item =>
          item.price?.interval === 'one_off' &&
          item.price?.billingMethod === 'prepaid'
      )
    ) ??
    plans.find(plan => {
      const searchableCopy = [plan.id, plan.name, plan.description ?? ''].join(
        ' '
      );

      return (
        plan.price?.interval === 'one_off' && topUpKeywords.test(searchableCopy)
      );
    }) ??
    null
  );
}

export function getWalletTopUpItem(
  plan: AutumnPlan | null,
  walletFeatureId: string | null
) {
  return (
    (walletFeatureId
      ? plan?.items.find(item => item.featureId === walletFeatureId)
      : null) ??
    plan?.items.find(
      item =>
        item.price?.interval === 'one_off' &&
        item.price?.billingMethod === 'prepaid'
    ) ??
    plan?.items[0] ??
    null
  );
}

export function getWalletBalance(
  customer: AutumnCustomer | undefined,
  walletFeatureId: string | null
) {
  if (!customer) {
    return null;
  }

  if (walletFeatureId) {
    const matchingBalance =
      customer.balances?.[walletFeatureId] ??
      Object.values(customer.balances ?? {}).find(
        balance => balance.featureId === walletFeatureId
      );

    if (matchingBalance) {
      return matchingBalance;
    }
  }

  return (
    Object.values(customer.balances ?? {}).find(
      balance => balance.feature?.type === 'credit_system'
    ) ?? null
  );
}
