/**
 * End-to-end coverage for admin audit timeline display and filtering.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './admin.fixtures';

async function generateAuditRows(input: {
  adminPage: Page;
  billingSearchTerm: string;
  organizationId: string;
  userId: string;
}) {
  await input.adminPage.goto(`/users/${input.userId}`);
  await expect(
    input.adminPage.getByRole('heading', { name: /Example/ })
  ).toBeVisible();

  await input.adminPage.goto(`/organizations/${input.organizationId}`);
  await expect(
    input.adminPage.getByRole('heading', {
      name: /Northwind Labs|Empty Space/,
    })
  ).toBeVisible();

  await input.adminPage.goto('/billing');
  await input.adminPage
    .getByPlaceholder('Search by customer id, name, or email')
    .fill(input.billingSearchTerm);
  await input.adminPage.getByRole('button', { name: 'Search' }).click();
}

test('@core shows generated audit rows and filters them by action and resource type', async ({
  adminPage,
  seededAdminData,
}) => {
  await generateAuditRows({
    adminPage,
    billingSearchTerm:
      seededAdminData.autumn?.billingSearchPrefix ?? 'no-billing-config',
    organizationId: seededAdminData.organization.id,
    userId: seededAdminData.subjectUser.id,
  });

  await adminPage.goto('/audit');

  await expect(
    adminPage.getByRole('heading', { name: 'Audit timeline' })
  ).toBeVisible();

  await adminPage
    .getByPlaceholder('Actor uid')
    .fill(seededAdminData.adminUser.id);
  await adminPage.getByRole('button', { name: 'Apply filters' }).click();

  await expect(adminPage.getByText('admin.user.view').first()).toBeVisible();
  await expect(
    adminPage.getByText('admin.organization.view').first()
  ).toBeVisible();
  await expect(
    adminPage.getByText(seededAdminData.subjectUser.id, { exact: true }).first()
  ).toBeVisible();
  await expect(
    adminPage
      .getByText(seededAdminData.organization.id, { exact: true })
      .first()
  ).toBeVisible();
  await expect(adminPage.getByText('success').first()).toBeVisible();
  await expect(adminPage.getByText('Request ID').first()).toBeVisible();

  await adminPage.getByPlaceholder('Action').fill('admin.user.view');
  await adminPage.getByPlaceholder('Resource type').fill('user');
  await adminPage.getByRole('button', { name: 'Apply filters' }).click();

  await expect(adminPage.getByText('admin.user.view').first()).toBeVisible();
  await expect(adminPage.getByText('admin.organization.view')).toHaveCount(0);

  await adminPage.getByRole('button', { name: 'Clear' }).click();
  await adminPage.getByPlaceholder('Action').fill('missing.audit.action');
  await adminPage.getByRole('button', { name: 'Apply filters' }).click();

  await expect(
    adminPage.getByText('No audit entries matched these filters')
  ).toBeVisible();
});

test('@core redacts billing search metadata in the audit timeline', async ({
  adminPage,
  seededAdminData,
}) => {
  const autumn = seededAdminData.autumn;
  if (!autumn) {
    test.skip(true, 'This coverage needs Autumn billing.');
    return;
  }

  await generateAuditRows({
    adminPage,
    billingSearchTerm: autumn.billingSearchPrefix,
    organizationId: seededAdminData.organization.id,
    userId: seededAdminData.subjectUser.id,
  });

  await adminPage.goto('/audit');
  await adminPage.getByPlaceholder('Action').fill('admin.billing.view');
  await adminPage
    .getByPlaceholder('Actor uid')
    .fill(seededAdminData.adminUser.id);
  await adminPage.getByRole('button', { name: 'Apply filters' }).click();

  await expect(adminPage.getByText('admin.billing.view')).toBeVisible();
  await adminPage.getByText('View metadata').first().click();
  await expect(adminPage.getByText('"hasSearch": true')).toBeVisible();
  await expect(adminPage.getByText(autumn.billingSearchPrefix)).toHaveCount(0);
});
