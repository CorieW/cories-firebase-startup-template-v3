/**
 * Core authentication journey coverage.
 */
import { expect, test } from '@playwright/test';

test('@core redirects signed-out users from protected home route', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/sign-in/);
});

test('@core allows direct navigation to the sign-up route', async ({
  page,
}) => {
  await page.goto('/sign-up');

  await expect(page).toHaveURL(/\/sign-up/);
  await expect(
    page.getByRole('button', { name: /Theme preference/i })
  ).toBeVisible();
});
