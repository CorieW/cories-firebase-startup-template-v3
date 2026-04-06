/**
 * Billing sidebar link and navigation journey coverage.
 */
import { expect, test } from './billing.fixtures';

test('@core shows personal billing links in the sidebar for a personal user', async ({
  personalPage,
}) => {
  await personalPage.goto('/pricing/subscriptions');

  const billingSidebarToggle = personalPage
    .locator('aside')
    .getByRole('button', { name: 'Billing', exact: true });

  await expect(billingSidebarToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(
    personalPage.locator('aside').getByRole('link', { name: 'Subscriptions' })
  ).toHaveAttribute('href', '/pricing/subscriptions');
  await expect(
    personalPage.locator('aside').getByRole('link', { name: 'Wallet' })
  ).toHaveAttribute('href', '/pricing/wallet');
});

test('@core shows organization billing links in the sidebar for an organization user', async ({
  organizationPage,
}) => {
  await organizationPage.goto('/pricing/subscriptions');

  const billingSidebarToggle = organizationPage
    .locator('aside')
    .getByRole('button', { name: 'Billing', exact: true });

  await expect(billingSidebarToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(
    organizationPage
      .locator('aside')
      .getByRole('link', { name: 'Subscriptions' })
  ).toHaveAttribute('href', '/pricing/subscriptions');
  await expect(
    organizationPage.locator('aside').getByRole('link', { name: 'Wallet' })
  ).toHaveAttribute('href', '/pricing/wallet');
});

test('@smoke opens subscriptions from the billing sidebar group', async ({
  personalPage,
}) => {
  await personalPage.goto('/');
  await personalPage
    .locator('aside')
    .getByRole('link', { name: 'Subscriptions' })
    .click();

  await expect(personalPage).toHaveURL(/\/pricing\/subscriptions$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Manage personal billing' })
  ).toBeVisible();
});

test('@smoke opens wallet from the billing sidebar group', async ({
  personalPage,
}) => {
  await personalPage.goto('/');
  await personalPage
    .locator('aside')
    .getByRole('link', { name: 'Wallet' })
    .click();

  await expect(personalPage).toHaveURL(/\/pricing\/wallet$/);
  await expect(
    personalPage.getByRole('heading', {
      name: 'Review personal wallet activity',
    })
  ).toBeVisible();
});

test('@smoke keeps the billing sidebar group expanded on billing routes', async ({
  personalPage,
}) => {
  await personalPage.goto('/pricing/wallet');

  const billingSidebarToggle = personalPage
    .locator('aside')
    .getByRole('button', { name: 'Billing', exact: true });

  await expect(billingSidebarToggle).toBeVisible();
  await expect(billingSidebarToggle).toHaveAttribute('aria-expanded', 'true');
});
