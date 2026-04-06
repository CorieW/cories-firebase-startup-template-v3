/**
 * Billing route access, scope redirects, and primary billing page coverage.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './billing.fixtures';

async function expectBillingPage(
  page: Page,
  {
    dashboardHeading,
    pageHeading,
    path,
  }: {
    dashboardHeading: string;
    pageHeading: string;
    path: string;
  }
) {
  await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
  await expect(page.getByRole('heading', { name: pageHeading })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: dashboardHeading })
  ).toBeVisible();
}

test('@smoke redirects signed-out users away from subscriptions billing routes', async ({
  page,
}) => {
  await page.goto('/pricing/subscriptions');

  await expect(page).toHaveURL(/\/sign-in/);
});

test('@smoke redirects signed-out users away from wallet billing routes', async ({
  page,
}) => {
  await page.goto('/pricing/wallet');

  await expect(page).toHaveURL(/\/sign-in/);
});

test('@smoke redirects user billing index to subscriptions', async ({
  personalPage,
}) => {
  await personalPage.goto('/pricing');

  await expectBillingPage(personalPage, {
    dashboardHeading: 'Plans and billing',
    pageHeading: 'Manage personal billing',
    path: '/pricing/subscriptions',
  });
});

test('@smoke redirects organization billing index to subscriptions', async ({
  organizationPage,
}) => {
  await organizationPage.goto('/pricing');

  await expectBillingPage(organizationPage, {
    dashboardHeading: 'Plans and billing',
    pageHeading: 'Manage organization billing',
    path: '/pricing/subscriptions',
  });
});

test('@core shows the personal subscriptions billing page for a user without an active organization', async ({
  personalPage,
}) => {
  await personalPage.goto('/pricing/subscriptions');

  await expectBillingPage(personalPage, {
    dashboardHeading: 'Plans and billing',
    pageHeading: 'Manage personal billing',
    path: '/pricing/subscriptions',
  });
});

test('@core shows the personal wallet billing page for a user without an active organization', async ({
  personalPage,
}) => {
  await personalPage.goto('/pricing/wallet');

  await expectBillingPage(personalPage, {
    dashboardHeading: 'Wallet balance and activity',
    pageHeading: 'Review personal wallet activity',
    path: '/pricing/wallet',
  });
});

test('@core shows the organization subscriptions billing page for a user with an active organization', async ({
  organizationPage,
}) => {
  await organizationPage.goto('/pricing/subscriptions');

  await expectBillingPage(organizationPage, {
    dashboardHeading: 'Plans and billing',
    pageHeading: 'Manage organization billing',
    path: '/pricing/subscriptions',
  });
});

test('@core shows the organization wallet billing page for a user with an active organization', async ({
  organizationPage,
}) => {
  await organizationPage.goto('/pricing/wallet');

  await expectBillingPage(organizationPage, {
    dashboardHeading: 'Wallet balance and activity',
    pageHeading: 'Review organization wallet activity',
    path: '/pricing/wallet',
  });
});
