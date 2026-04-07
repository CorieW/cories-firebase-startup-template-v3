/**
 * End-to-end coverage for seeded admin organization directory and detail flows.
 */
import { expect, test } from './admin.fixtures';
import {
  formatAdminBalanceAmount,
  formatAdminDateTime,
} from './admin-test-helpers';

test('@core filters the organization directory with seeded fake data', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto('/organizations');

  await expect(
    adminPage.getByRole('heading', { name: 'Organization directory' })
  ).toBeVisible();

  await adminPage
    .getByPlaceholder('Search by name or organization id')
    .fill(seededAdminData.organization.name);
  await adminPage.getByRole('button', { name: 'Search' }).click();

  const matchingRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.organization.id) });

  await expect(matchingRow).toHaveCount(1);
  await expect(matchingRow).toContainText(seededAdminData.organization.name);
  await expect(matchingRow).toContainText(seededAdminData.organization.slug);
  await expect(matchingRow).toContainText(
    formatAdminDateTime(seededAdminData.organization.createdAt)
  );
});

test('@core shows the populated organization detail view', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto(`/organizations/${seededAdminData.organization.id}`);

  await expect(
    adminPage.getByRole('heading', { name: seededAdminData.organization.name })
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Organization summary' })
  ).toBeVisible();
  await expect(
    adminPage
      .getByText(seededAdminData.organization.id, { exact: true })
      .first()
  ).toBeVisible();
  await expect(
    adminPage
      .getByText(seededAdminData.organization.slug, { exact: true })
      .first()
  ).toBeVisible();
  await expect(
    adminPage.getByText(
      formatAdminDateTime(seededAdminData.organization.createdAt),
      { exact: true }
    )
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Members (1)' })
  ).toBeVisible();
  const memberRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.subjectUser.email) });
  await expect(memberRow).toHaveCount(1);
  await expect(memberRow).toContainText(seededAdminData.subjectUser.name);
  await expect(memberRow).toContainText(seededAdminData.subjectUser.email);
  await expect(memberRow).toContainText('member');
  await expect(
    memberRow.getByRole('link', { name: 'Open profile' })
  ).toHaveAttribute('href', `/users/${seededAdminData.subjectUser.id}`);
  await expect(
    adminPage.getByText(`"name": "${seededAdminData.organization.name}"`)
  ).toBeVisible();
});

test('@core shows an empty state when no organizations match the current search', async ({
  adminPage,
}) => {
  await adminPage.goto('/organizations');
  await adminPage
    .getByPlaceholder('Search by name or organization id')
    .fill('missing-organization-for-playwright');
  await adminPage.getByRole('button', { name: 'Search' }).click();

  await expect(
    adminPage.getByText('No organizations matched this search')
  ).toBeVisible();
});

test('@core shows a not-found state for a missing organization id', async ({
  adminPage,
}) => {
  await adminPage.goto('/organizations/missing-organization-id');

  await expect(
    adminPage.getByRole('heading', { name: 'Organization not found' })
  ).toBeVisible();
  await expect(
    adminPage.getByText('No organization record was found')
  ).toBeVisible();
});

test('@core shows the empty organization member state', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto(
    `/organizations/${seededAdminData.emptyOrganization.id}`
  );

  await expect(
    adminPage.getByRole('heading', {
      name: seededAdminData.emptyOrganization.name,
    })
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Members (0)' })
  ).toBeVisible();
  await expect(adminPage.getByText('No members found')).toBeVisible();
});

test('@core shows a billing-ready organization detail view with a real Autumn wallet and subscription', async ({
  adminPage,
  seededAdminData,
}) => {
  const autumn = seededAdminData.autumn;
  if (!autumn) {
    test.skip(true, 'This coverage needs Autumn billing.');
    return;
  }

  await adminPage.goto(`/organizations/${seededAdminData.organization.id}`);

  await expect(
    adminPage.getByText(autumn.organizationCustomer.customerId, {
      exact: true,
    })
  ).toBeVisible();
  await expect(adminPage.getByText('Wallet found')).toBeVisible();
  await expect(
    adminPage.getByText(
      formatAdminBalanceAmount(
        autumn.organizationCustomer.wallet?.remaining ?? null,
        autumn.organizationCustomer.wallet?.featureId ?? null
      )
    )
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Autumn subscriptions (1)' })
  ).toBeVisible();
  await expect(adminPage.getByText(autumn.organizationPlanName)).toBeVisible();
  await expect(adminPage.getByText('active')).toBeVisible();

  if (autumn.organizationCustomer.wallet?.nextResetAt) {
    await expect(
      adminPage.getByText(
        formatAdminDateTime(autumn.organizationCustomer.wallet.nextResetAt)
      )
    ).toBeVisible();
  }
});
