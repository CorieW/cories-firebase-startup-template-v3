/**
 * Billing dashboard logging and toast reporting helpers.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import { getAutumnErrorMessage } from './billing-dashboard.lib';
import type { BillingSubmissionState } from './billing-dashboard.types';

const billingActionLogger = createScopedLogger('BILLING_ACTION');

type BillingActionContext = {
  route: string | null;
  scope: 'user' | 'organization';
  view: 'subscriptions' | 'wallet';
};

type BillingToast = {
  error: (input: {
    title: string;
    description: string;
    durationMs?: number;
  }) => void;
  info: (input: { title: string; description: string }) => void;
  success: (input: { title: string; description: string }) => void;
};

type BillingActionDetails = Record<string, unknown>;

type BillingToastVariant = 'error' | 'info' | 'success';

type BillingActionRunnerOptions = {
  action: string;
  details?: BillingActionDetails;
  submissionState?: BillingSubmissionState;
  startNotice?: {
    title: string;
    message: string;
  };
  successNotice?: {
    title: string;
    message: string;
  };
  errorTitle: string;
  fallbackErrorMessage: string;
  skipActionLog?: boolean;
  run: () => Promise<unknown>;
};

/**
 * Creates a billing-specific reporter so action handlers stay focused on flow logic.
 */
export function createBillingActionReporter({
  getActionContext,
  setPortalError,
  setSubmissionState,
  toast,
}: {
  getActionContext: () => BillingActionContext;
  setPortalError: (message: string | null) => void;
  setSubmissionState: (state: BillingSubmissionState | null) => void;
  toast: BillingToast;
}) {
  function logAction(action: string, details: BillingActionDetails = {}) {
    billingActionLogger.action(
      action,
      {
        ...details,
        ...getActionContext(),
      },
      'info'
    );
  }

  function logBlocked(action: string, details: BillingActionDetails = {}) {
    billingActionLogger.log(
      'ACTION_BLOCKED',
      {
        action,
        ...details,
        ...getActionContext(),
      },
      'warn'
    );
  }

  function reportToast(
    variant: BillingToastVariant,
    title: string,
    message: string
  ) {
    const context = getActionContext();

    if (variant === 'error') {
      billingActionLogger.log(
        'TOAST_ERROR',
        {
          action: 'reportBillingError',
          title,
          message,
          ...context,
        },
        'error'
      );
      setPortalError(message);
      toast.error({
        title,
        description: message,
        durationMs: 7200,
      });

      return;
    }

    if (variant === 'success') {
      billingActionLogger.log(
        'TOAST_SUCCESS',
        {
          action: 'reportBillingSuccess',
          title,
          message,
          ...context,
        },
        'info'
      );
      toast.success({
        title,
        description: message,
      });

      return;
    }

    billingActionLogger.log(
      'TOAST_INFO',
      {
        action: 'reportBillingInfo',
        title,
        message,
        ...context,
      },
      'debug'
    );
    toast.info({
      title,
      description: message,
    });
  }

  async function runAction({
    action,
    details = {},
    submissionState,
    startNotice,
    successNotice,
    errorTitle,
    fallbackErrorMessage,
    skipActionLog = false,
    run,
  }: BillingActionRunnerOptions) {
    setPortalError(null);

    if (!skipActionLog) {
      logAction(action, details);
    }

    if (submissionState) {
      setSubmissionState(submissionState);
    }

    if (startNotice) {
      reportToast('info', startNotice.title, startNotice.message);
    }

    try {
      await run();
      billingActionLogger.log(
        'ACTION_RESULT',
        {
          action,
          status: 'success',
          ...details,
          ...getActionContext(),
        },
        'info'
      );

      if (successNotice) {
        reportToast('success', successNotice.title, successNotice.message);
      }

      if (submissionState) {
        setSubmissionState(null);
      }
    } catch (caughtError) {
      billingActionLogger.log(
        'ACTION_RESULT',
        {
          action,
          status: 'error',
          ...details,
          error: serializeErrorForLogging(caughtError),
          ...getActionContext(),
        },
        'error'
      );
      reportToast(
        'error',
        errorTitle,
        getAutumnErrorMessage(caughtError, fallbackErrorMessage)
      );

      if (submissionState) {
        setSubmissionState(null);
      }
    }
  }

  return {
    logAction,
    logBlocked,
    reportError: (title: string, message: string) => {
      reportToast('error', title, message);
    },
    runAction,
  };
}
