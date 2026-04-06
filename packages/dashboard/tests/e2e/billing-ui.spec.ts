/**
 * Billing UI action coverage for shared portal affordances.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './billing.fixtures';

async function expectPortalAction(page: Page, path: string) {
  await page.goto(path);

  await expect(
    page.getByRole('button', { name: 'Open billing portal' })
  ).toBeVisible({ timeout: 15_000 });
}

test('@core shows the billing portal action on personal subscriptions', async ({
  personalPage,
}) => {
  await expectPortalAction(personalPage, '/pricing/subscriptions');
});

test('@core shows the billing portal action on personal wallet', async ({
  personalPage,
}) => {
  await expectPortalAction(personalPage, '/pricing/wallet');
});

test('@core shows the billing portal action on organization subscriptions', async ({
  organizationPage,
}) => {
  await expectPortalAction(organizationPage, '/pricing/subscriptions');
});

test('@core shows the billing portal action on organization wallet', async ({
  organizationPage,
}) => {
  await expectPortalAction(organizationPage, '/pricing/wallet');
});
