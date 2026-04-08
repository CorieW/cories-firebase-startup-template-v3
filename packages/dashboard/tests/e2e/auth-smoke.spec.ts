/**
 * Fast smoke coverage for authentication routes.
 */
import { expect, test } from '@playwright/test';

test('@smoke renders the sign-in shell with theme controls', async ({
  page,
}) => {
  await page.goto('/sign-in');

  await expect(page).toHaveURL(/\/sign-in/);
  await expect(
    page.getByRole('link', { name: /Firebase Starter/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Theme preference/i })
  ).toBeVisible();
});

test('@smoke persists theme preference across reloads', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('button', { name: /Theme preference/i }).click();
  await page.getByRole('menuitemradio', { name: 'Light' }).click();

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    )
    .toBe('light');
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-theme-preference')
      )
    )
    .toBe('light');

  await page.reload();

  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-theme-preference')
      )
    )
    .toBe('light');
});
