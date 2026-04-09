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
      personalPage.locator('aside').getByRole('button', { name: 'Support' })
    ).toBeVisible();
  });

  test('@smoke shows the external docs link in the mobile navigation drawer', async ({
    personalPage,
  }) => {
    await personalPage.goto('/');

    await personalPage
      .getByRole('button', { name: 'Open navigation menu' })
      .click();
    const supportButton = personalPage
      .locator('aside')
      .getByRole('button', { name: 'Support' });
    await supportButton.scrollIntoViewIfNeeded();
    await supportButton.click();
    const supportLink = personalPage
      .locator('aside')
      .getByRole('link', { name: 'Docs' });
    await supportLink.scrollIntoViewIfNeeded();
    await expect(supportLink).toHaveAttribute(
      'href',
      'https://docs.yourcompany.com'
    );
    await expect(supportLink).toHaveAttribute('target', '_blank');
  });

  test('@smoke navigates to home from the mobile navigation drawer', async ({
    personalPage,
  }) => {
    await personalPage.goto('/support/docs');

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
      personalPage.getByRole('heading', { name: 'Home', exact: true })
    ).toBeVisible();
  });
});
