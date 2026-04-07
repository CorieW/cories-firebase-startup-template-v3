/**
 * End-to-end coverage for admin audit timeline display and filtering.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './admin.fixtures';

async function generateAuditRows(input: {
  adminPage: Page;
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
}

test('@core shows generated audit rows and filters them by action and resource type', async ({
  adminPage,
  seededAdminData,
}) => {
  await generateAuditRows({
    adminPage,
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
