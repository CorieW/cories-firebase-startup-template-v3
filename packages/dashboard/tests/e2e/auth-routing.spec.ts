/**
 * Auth-entry redirect coverage for already-authenticated users.
 */
import { expect, test } from './billing.fixtures';

test('@smoke redirects authenticated users away from the sign-in entry route', async ({
  personalPage,
}) => {
  await personalPage.goto('/sign-in');

  await expect(personalPage).toHaveURL(/\/$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Welcome to your starter app' })
  ).toBeVisible();
});

test('@smoke redirects authenticated users away from the sign-up entry route', async ({
  personalPage,
}) => {
  await personalPage.goto('/sign-up');

  await expect(personalPage).toHaveURL(/\/$/);
  await expect(
    personalPage.getByRole('heading', { name: 'Welcome to your starter app' })
  ).toBeVisible();
});
