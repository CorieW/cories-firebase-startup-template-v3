/**
 * End-to-end coverage for admin billing diagnostics display states.
 */
import { expect, test } from './admin.fixtures';
import { formatAdminDateTime } from './admin-test-helpers';

test('@core shows the unavailable billing state when Autumn is not configured', async ({
  adminPage,
  seededAdminData,
}) => {
  test.skip(
    Boolean(seededAdminData.autumn),
    'This coverage expects Autumn to be disabled.'
  );

  await adminPage.goto('/billing');

  await expect(
    adminPage.getByRole('heading', { name: 'Billing diagnostics' })
  ).toBeVisible();
  await expect(
    adminPage.getByText('Billing integration is not configured')
  ).toBeVisible();
  await expect(
    adminPage.getByText(
      'Set `AUTUMN_SECRET_KEY` in packages/admin/.env to unlock this page locally.'
    )
  ).toBeVisible();
});

test('@core filters billing customers with a real Autumn-backed search result', async ({
  adminPage,
  seededAdminData,
}) => {
  const autumn = seededAdminData.autumn;
  if (!autumn) {
    test.skip(true, 'This coverage needs Autumn billing.');
    return;
  }

  await adminPage.goto('/billing');
  await adminPage
    .getByPlaceholder('Search by customer id, name, or email')
    .fill(autumn.billingSearchPrefix);
  await adminPage.getByRole('button', { name: 'Search' }).click();

  await expect(
    adminPage.getByText(`Showing 1-25 of ${autumn.directoryCustomerCount}`)
  ).toBeVisible();
  await expect(adminPage.getByRole('row')).toHaveCount(26);

  await adminPage.getByRole('button', { name: 'Next' }).click();

  await expect(
    adminPage.getByText(`Showing 26-26 of ${autumn.directoryCustomerCount}`)
  ).toBeVisible();
  await expect(adminPage.getByRole('row')).toHaveCount(2);
});

test('@core shows billing customer row content for an exact Autumn search match', async ({
  adminPage,
  seededAdminData,
}) => {
  const autumn = seededAdminData.autumn;
  if (!autumn) {
    test.skip(true, 'This coverage needs Autumn billing.');
    return;
  }

  await adminPage.goto('/billing');
  await adminPage
    .getByPlaceholder('Search by customer id, name, or email')
    .fill(seededAdminData.subjectUser.email);
  await adminPage.getByRole('button', { name: 'Search' }).click();

  const matchingRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.subjectUser.email) });

  await expect(matchingRow).toHaveCount(1);
  await expect(matchingRow).toContainText(autumn.userCustomer.name ?? '');
  await expect(matchingRow).toContainText(autumn.userCustomer.customerId);
  await expect(matchingRow).toContainText('1');
  await expect(matchingRow).toContainText('0');

  if (autumn.userCustomer.createdAt) {
    await expect(matchingRow).toContainText(
      formatAdminDateTime(autumn.userCustomer.createdAt)
    );
  }

  await expect(adminPage.getByText('Showing 1-1 of 1')).toBeVisible();
});
