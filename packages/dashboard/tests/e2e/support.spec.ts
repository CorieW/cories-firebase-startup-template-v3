/**
 * Support page and support-chat user journey coverage.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './billing.fixtures';

async function clickUntilNavigated(
  page: Page,
  click: () => Promise<unknown>,
  destination: RegExp
) {
  await expect(async () => {
    await click();
    await expect(page).toHaveURL(destination, { timeout: 1_500 });
  }).toPass({
    intervals: [250, 500, 1_000],
    timeout: 15_000,
  });
}

test('@smoke redirects the support index to the docs page', async ({
  personalPage,
}) => {
  await personalPage.goto('/support');

  await expect(personalPage).toHaveURL(/\/support\/docs$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Support docs' })
  ).toBeVisible();
});

test('@core shows the support docs page resources', async ({
  personalPage,
}) => {
  await personalPage.goto('/support/docs');

  await expect(
    personalPage.getByRole('heading', { name: 'Support docs' })
  ).toBeVisible();
  await expect(
    personalPage.getByRole('link', { name: /Open docs/i })
  ).toBeVisible();
  await expect(
    personalPage.getByRole('link', { name: /View FAQ/i })
  ).toBeVisible();
});

test('@core redirects the contact support route to chat', async ({
  personalPage,
}) => {
  await personalPage.goto('/support/contact');

  await expect(personalPage).toHaveURL(/\/chat\?source=contact-support$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Contact support' })
  ).toBeVisible();
  await expect(
    personalPage.getByRole('link', { name: 'support@yourcompany.com' })
  ).toBeVisible();
});

test('@smoke returns from support chat back to the support page', async ({
  personalPage,
}) => {
  await personalPage.goto('/chat?source=live-chat');
  await expect(
    personalPage.getByRole('heading', { name: 'Live chat support' })
  ).toBeVisible();

  await clickUntilNavigated(
    personalPage,
    () => personalPage.getByRole('button', { name: 'Back to support' }).click(),
    /\/support\/docs$/
  );

  await expect(
    personalPage.getByRole('heading', { name: 'Support docs' })
  ).toBeVisible();
});

test('@smoke normalizes an unknown support chat source to live chat', async ({
  personalPage,
}) => {
  await personalPage.goto('/chat?source=not-a-real-source');

  await expect(personalPage).toHaveURL(/\/chat\?source=live-chat$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Live chat support' })
  ).toBeVisible();
});
