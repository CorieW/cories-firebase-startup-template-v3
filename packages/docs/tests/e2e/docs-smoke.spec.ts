/**
 * Smoke coverage for docs navigation and search in the fixed-dark shell.
 */
import { expect, test } from '@playwright/test';

test('@smoke docs navigation and search in fixed dark mode', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-preference',
    'dark'
  );

  const searchTrigger = page
    .getByTestId('docs-search-trigger-full')
    .or(page.getByTestId('docs-search-trigger-sm'));

  await searchTrigger.click();
  await page.getByRole('textbox').fill('Rich Content');
  await page.getByRole('button', { name: /rich content examples/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Rich Content Examples' })
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-preference',
    'dark'
  );
});
