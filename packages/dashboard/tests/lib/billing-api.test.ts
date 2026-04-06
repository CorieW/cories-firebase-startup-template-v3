/**
 * Tests billing scope and Autumn provider key helpers for personal and organization switching.
 */
import { describe, expect, it } from 'vitest';
import {
  getAutumnCustomerScopeKey,
  getBillingScope,
} from '@/lib/billing-api';

describe('billing-api helpers', () => {
  it('keeps organization scope while active organization is still unresolved', () => {
    expect(
      getBillingScope({
        activeOrganizationId: undefined,
        sessionActiveOrganizationId: 'org_1',
      })
    ).toBe('organization');

    expect(
      getAutumnCustomerScopeKey({
        activeOrganizationId: undefined,
        sessionActiveOrganizationId: 'org_1',
        sessionUserId: 'user_1',
        userId: 'user_1',
      })
    ).toBe('org:org_1');
  });

  it('switches back to the personal scope once active organization resolves to null', () => {
    expect(
      getBillingScope({
        activeOrganizationId: null,
        sessionActiveOrganizationId: 'org_1',
      })
    ).toBe('user');

    expect(
      getAutumnCustomerScopeKey({
        activeOrganizationId: null,
        sessionActiveOrganizationId: 'org_1',
        sessionUserId: 'user_1',
        userId: 'user_1',
      })
    ).toBe('user:user_1');
  });
});
