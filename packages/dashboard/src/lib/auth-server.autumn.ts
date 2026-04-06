/**
 * Autumn server client creation and customer or entity sync helpers.
 */
import { Autumn } from 'autumn-js';
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import {
  getAutumnBaseUrl,
  getAutumnSecretKey,
  getAutumnSeatFeatureId,
} from './env';
import { getAutumnCustomerId, getAutumnEntityId } from './auth-autumn-ids';

const autumnLogger = createScopedLogger('DASH_AUTH_AUTUMN');

export function getAutumnServerClient(): Autumn | null {
  const secretKey = getAutumnSecretKey();
  if (!secretKey) {
    return null;
  }

  return new Autumn({
    secretKey,
    ...(getAutumnBaseUrl() ? { baseURL: getAutumnBaseUrl() } : {}),
  });
}

export async function syncAutumnCustomer(
  customerId: string,
  customerData: {
    email?: string | null;
    name?: string | null;
  }
) {
  const autumnClient = getAutumnServerClient();
  if (!autumnClient) {
    autumnLogger.log(
      'CUSTOMER_SYNC',
      {
        action: 'syncAutumnCustomer',
        status: 'skipped',
        customerId,
        reason: 'autumn-not-configured',
      },
      'debug'
    );
    return;
  }

  try {
    await autumnClient.customers.getOrCreate({
      customerId,
      ...(customerData.name ? { name: customerData.name } : {}),
      ...(customerData.email ? { email: customerData.email } : {}),
    });

    autumnLogger.log(
      'CUSTOMER_SYNC',
      {
        action: 'syncAutumnCustomer',
        status: 'success',
        customerId,
        hasEmail: Boolean(customerData.email),
        hasName: Boolean(customerData.name),
      },
      'info'
    );
  } catch (error) {
    autumnLogger.log(
      'CUSTOMER_SYNC_ERROR',
      {
        action: 'syncAutumnCustomer',
        status: 'error',
        customerId,
        error: serializeErrorForLogging(error),
      },
      'error'
    );
    throw error;
  }
}

export async function syncAutumnSeatEntity(
  organizationId: string,
  memberId: string,
  memberName?: string | null
) {
  const autumnClient = getAutumnServerClient();
  const seatFeatureId = getAutumnSeatFeatureId();

  if (!autumnClient || !seatFeatureId) {
    autumnLogger.log(
      'SEAT_SYNC',
      {
        action: 'syncAutumnSeatEntity',
        status: 'skipped',
        organizationId,
        memberId,
        reason: !autumnClient ? 'autumn-not-configured' : 'missing-seat-feature',
      },
      'debug'
    );
    return;
  }

  const payload = {
    customerId: getAutumnCustomerId('org', organizationId),
    entityId: getAutumnEntityId('member', memberId),
    featureId: seatFeatureId,
    name: memberName ?? memberId,
  };

  try {
    await autumnClient.entities.create(payload);
    autumnLogger.log(
      'SEAT_SYNC',
      {
        action: 'syncAutumnSeatEntity',
        status: 'created',
        organizationId,
        memberId,
        featureId: seatFeatureId,
      },
      'info'
    );
  } catch {
    await autumnClient.entities.update(payload);
    autumnLogger.log(
      'SEAT_SYNC',
      {
        action: 'syncAutumnSeatEntity',
        status: 'updated',
        organizationId,
        memberId,
        featureId: seatFeatureId,
      },
      'info'
    );
  }
}

export async function removeAutumnSeatEntity(
  organizationId: string,
  memberId: string
) {
  const autumnClient = getAutumnServerClient();
  if (!autumnClient || !getAutumnSeatFeatureId()) {
    autumnLogger.log(
      'SEAT_DELETE',
      {
        action: 'removeAutumnSeatEntity',
        status: 'skipped',
        organizationId,
        memberId,
        reason: !autumnClient ? 'autumn-not-configured' : 'missing-seat-feature',
      },
      'debug'
    );
    return;
  }

  await autumnClient.entities
    .delete({
      customerId: getAutumnCustomerId('org', organizationId),
      entityId: getAutumnEntityId('member', memberId),
    })
    .then(() => {
      autumnLogger.log(
        'SEAT_DELETE',
        {
          action: 'removeAutumnSeatEntity',
          status: 'success',
          organizationId,
          memberId,
        },
        'info'
      );
    })
    .catch(error => {
      autumnLogger.log(
        'SEAT_DELETE_ERROR',
        {
          action: 'removeAutumnSeatEntity',
          status: 'error',
          organizationId,
          memberId,
          error: serializeErrorForLogging(error),
        },
        'error'
      );
    });
}

export async function removeAutumnCustomer(customerId: string) {
  const autumnClient = getAutumnServerClient();
  if (!autumnClient) {
    autumnLogger.log(
      'CUSTOMER_DELETE',
      {
        action: 'removeAutumnCustomer',
        status: 'skipped',
        customerId,
        reason: 'autumn-not-configured',
      },
      'debug'
    );
    return;
  }

  await autumnClient.customers
    .delete({
      customerId,
      deleteInStripe: false,
    })
    .then(() => {
      autumnLogger.log(
        'CUSTOMER_DELETE',
        {
          action: 'removeAutumnCustomer',
          status: 'success',
          customerId,
        },
        'info'
      );
    })
    .catch(error => {
      autumnLogger.log(
        'CUSTOMER_DELETE_ERROR',
        {
          action: 'removeAutumnCustomer',
          status: 'error',
          customerId,
          error: serializeErrorForLogging(error),
        },
        'error'
      );
      throw error;
    });
}
