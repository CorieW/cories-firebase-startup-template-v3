/**
 * Smoke coverage for the authenticated admin shell and section navigation.
 */
import { expect, test } from './admin.fixtures';

test('@smoke lets an authenticated admin reach each primary admin section', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto('/');

  await expect(
    adminPage.getByRole('heading', { name: 'Operations overview' })
  ).toBeVisible();
  await expect(
    adminPage.getByText(seededAdminData.adminUser.email)
  ).toBeVisible();

  await adminPage.getByRole('link', { name: 'Users' }).click();
  await expect(
    adminPage.getByRole('heading', { name: 'User directory' })
  ).toBeVisible();

  await adminPage.getByRole('link', { name: 'Organizations' }).click();
  await expect(
    adminPage.getByRole('heading', { name: 'Organization directory' })
  ).toBeVisible();

  await adminPage.getByRole('link', { name: 'Audit' }).click();
  await expect(
    adminPage.getByRole('heading', { name: 'Audit timeline' })
  ).toBeVisible();
});
