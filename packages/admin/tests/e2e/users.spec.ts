/**
 * End-to-end coverage for seeded admin user directory and detail flows.
 */
import { expect, test } from './admin.fixtures';
import {
  formatAdminBalanceAmount,
  formatAdminDateTime,
} from './admin-test-helpers';

test('@core filters the user directory with seeded fake data', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto('/users');

  await expect(
    adminPage.getByRole('heading', { name: 'User directory' })
  ).toBeVisible();

  await adminPage
    .getByPlaceholder('Search by email, name, or uid')
    .fill(seededAdminData.subjectUser.name);
  await adminPage.getByRole('button', { name: 'Search' }).click();

  const matchingRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.subjectUser.email) });

  await expect(matchingRow).toHaveCount(1);
  await expect(matchingRow).toContainText(seededAdminData.subjectUser.name);
  await expect(matchingRow).toContainText(seededAdminData.subjectUser.id);
  await expect(matchingRow).toContainText(
    formatAdminDateTime(seededAdminData.subjectUser.createdAt)
  );
  await expect(
    adminPage.getByRole('row').filter({
      has: adminPage.getByText(seededAdminData.secondaryUser.email),
    })
  ).toHaveCount(0);
  await expect(adminPage.getByText('Showing 1-1 of 1')).toBeVisible();
});

test('@core shows seeded fake data on the user detail page', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto('/users');
  await adminPage
    .getByPlaceholder('Search by email, name, or uid')
    .fill(seededAdminData.subjectUser.email);
  await adminPage.getByRole('button', { name: 'Search' }).click();

  const subjectRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.subjectUser.email) });

  await expect(subjectRow).toHaveCount(1);
  await subjectRow.getByRole('link', { name: 'Open profile' }).click();

  await expect(adminPage).toHaveURL(
    new RegExp(`/users/${seededAdminData.subjectUser.id}(\\?.*)?$`)
  );
  await expect(
    adminPage.getByRole('heading', { name: seededAdminData.subjectUser.name })
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'User summary' })
  ).toBeVisible();
  await expect(
    adminPage.getByText(seededAdminData.subjectUser.id, { exact: true }).first()
  ).toBeVisible();
  await expect(
    adminPage
      .getByText(seededAdminData.subjectUser.email, { exact: true })
      .first()
  ).toBeVisible();
  await expect(
    adminPage.getByText(
      formatAdminDateTime(seededAdminData.subjectUser.createdAt),
      { exact: true }
    )
  ).toBeVisible();

  await expect(
    adminPage.getByRole('heading', { name: 'Organizations (1)' })
  ).toBeVisible();
  const organizationRow = adminPage
    .getByRole('row')
    .filter({ has: adminPage.getByText(seededAdminData.organization.id) });
  await expect(organizationRow).toHaveCount(1);
  await expect(organizationRow).toContainText(
    seededAdminData.organization.name
  );
  await expect(organizationRow).toContainText(seededAdminData.organization.id);
  await expect(
    organizationRow.getByText(
      formatAdminDateTime(seededAdminData.membership.createdAt)
    )
  ).toBeVisible();
  await expect(
    organizationRow.getByRole('link', { name: 'Open organization' })
  ).toHaveAttribute(
    'href',
    `/organizations/${seededAdminData.organization.id}?page=1&search=`
  );

  await expect(
    adminPage.getByRole('heading', { name: 'Wallet balance' })
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Auth user record' })
  ).toBeVisible();
  await expect(
    adminPage.getByText(`"email": "${seededAdminData.subjectUser.email}"`)
  ).toBeVisible();
  await expect(
    adminPage.getByText(`"name": "${seededAdminData.subjectUser.name}"`)
  ).toBeVisible();
});

test('@core shows an empty state when no users match the current search', async ({
  adminPage,
}) => {
  await adminPage.goto('/users');
  await adminPage
    .getByPlaceholder('Search by email, name, or uid')
    .fill('missing-user-for-playwright');
  await adminPage.getByRole('button', { name: 'Search' }).click();

  await expect(
    adminPage.getByText('No users matched this search')
  ).toBeVisible();
  await expect(
    adminPage.getByText(
      'Try a different prefix or clear the current filter to see the newest users.'
    )
  ).toBeVisible();
});

test('@core shows a not-found state for a missing user id', async ({
  adminPage,
}) => {
  await adminPage.goto('/users/missing-user-id');

  await expect(
    adminPage.getByRole('heading', { name: 'User not found' })
  ).toBeVisible();
  await expect(adminPage.getByText('No user record was found')).toBeVisible();
});

test('@core shows the no-membership user states for organizations and subscriptions', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto(`/users/${seededAdminData.membershiplessUser.id}`);

  await expect(
    adminPage.getByRole('heading', {
      name: seededAdminData.membershiplessUser.name,
    })
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Organizations (0)' })
  ).toBeVisible();
  await expect(adminPage.getByText('No organizations found')).toBeVisible();

  if (seededAdminData.autumn) {
    await expect(
      adminPage.getByRole('heading', { name: 'Wallet balance' })
    ).toBeVisible();
    await expect(
      adminPage
        .locator('dl > div')
        .filter({
          has: adminPage.locator('dt').filter({ hasText: 'Wallet balance' }),
        })
        .getByText(
          formatAdminBalanceAmount(
            seededAdminData.autumn.membershiplessCustomer.wallet?.remaining ??
              null,
            seededAdminData.autumn.membershiplessCustomer.wallet?.featureId ??
              null
          ),
          { exact: true }
        )
    ).toBeVisible();
    await expect(
      adminPage.getByRole('heading', { name: 'Autumn subscriptions (0)' })
    ).toBeVisible();
    await expect(
      adminPage.getByText('No Autumn subscriptions found')
    ).toBeVisible();
  } else {
    await expect(
      adminPage.getByText('Billing integration unavailable')
    ).toBeVisible();
  }
});

test('@core shows a billing-ready user detail view with a real Autumn wallet and subscription', async ({
  adminPage,
  seededAdminData,
}) => {
  const autumn = seededAdminData.autumn;
  if (!autumn) {
    test.skip(true, 'This coverage needs Autumn billing.');
    return;
  }

  await adminPage.goto(`/users/${seededAdminData.subjectUser.id}`);

  await expect(
    adminPage.getByText(autumn.userCustomer.customerId, {
      exact: true,
    })
  ).toBeVisible();
  await expect(adminPage.getByText('Wallet found')).toBeVisible();
  await expect(
    adminPage
      .locator('dl > div')
      .filter({
        has: adminPage.locator('dt').filter({ hasText: 'Wallet balance' }),
      })
      .getByText(
        formatAdminBalanceAmount(
          autumn.userCustomer.wallet?.remaining ?? null,
          autumn.userCustomer.wallet?.featureId ?? null
        ),
        { exact: true }
      )
  ).toBeVisible();
  await expect(
    adminPage
      .locator('dl > div')
      .filter({
        has: adminPage.locator('dt').filter({ hasText: 'Granted' }),
      })
      .getByText(
        formatAdminBalanceAmount(
          autumn.userCustomer.wallet?.granted ?? null,
          autumn.userCustomer.wallet?.featureId ?? null
        ),
        { exact: true }
      )
  ).toBeVisible();
  await expect(
    adminPage.getByRole('heading', { name: 'Autumn subscriptions (1)' })
  ).toBeVisible();
  const userSubscriptionRow = adminPage
    .getByRole('row')
    .filter({ hasText: autumn.userPlanId });
  await expect(userSubscriptionRow).toHaveCount(1);
  await expect(userSubscriptionRow).toContainText(autumn.userPlanId);
  await expect(userSubscriptionRow).toContainText('active');

  if (autumn.userCustomer.wallet?.nextResetAt) {
    await expect(
      adminPage.getByText(
        formatAdminDateTime(autumn.userCustomer.wallet.nextResetAt)
      )
    ).toBeVisible();
  }

  if (autumn.userCustomer.subscriptions[0]?.startedAt) {
    await expect(
      adminPage.getByText(
        formatAdminDateTime(autumn.userCustomer.subscriptions[0].startedAt)
      )
    ).toBeVisible();
  }
});
