/**
 * Mobile drawer and signed-in shell navigation coverage.
 */
import { expect, test } from './billing.fixtures';

test.describe('mobile shell navigation', () => {
  test.use({
    viewport: {
      width: 390,
      height: 844,
    },
  });

  test('@smoke opens the mobile navigation drawer', async ({
    personalPage,
  }) => {
    await personalPage.goto('/');

    await personalPage
      .getByRole('button', { name: 'Open navigation menu' })
      .click();

    await expect(
      personalPage
        .locator('aside')
        .getByRole('button', { name: 'Close navigation menu' })
    ).toBeVisible();
    await expect(
      personalPage.locator('aside').getByRole('link', { name: 'Support' })
    ).toBeVisible();
  });

  test('@smoke navigates to support from the mobile navigation drawer', async ({
    personalPage,
  }) => {
    await personalPage.goto('/');

    await personalPage
      .getByRole('button', { name: 'Open navigation menu' })
      .click();
    const supportLink = personalPage
      .locator('aside')
      .getByRole('link', { name: 'Support' });
    await supportLink.scrollIntoViewIfNeeded();
    await supportLink.evaluate(node => {
      (node as HTMLAnchorElement).click();
    });

    await expect(personalPage).toHaveURL(/\/support$/);
    await expect(
      personalPage.getByRole('heading', { name: 'Get help from the team' })
    ).toBeVisible();
  });

  test('@smoke navigates to home from the mobile navigation drawer', async ({
    personalPage,
  }) => {
    await personalPage.goto('/support');

    await personalPage
      .getByRole('button', { name: 'Open navigation menu' })
      .click();
    const homeLink = personalPage.locator('aside').getByRole('link', {
      name: 'Home',
    });
    await homeLink.scrollIntoViewIfNeeded();
    await homeLink.evaluate(node => {
      (node as HTMLAnchorElement).click();
    });

    await expect(personalPage).toHaveURL(/\/$/);
    await expect(
      personalPage.getByRole('heading', { name: 'Welcome to your starter app' })
    ).toBeVisible();
  });
});
