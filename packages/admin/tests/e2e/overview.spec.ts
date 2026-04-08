/**
 * End-to-end coverage for the admin overview route and workspace entry cards.
 */
import type { Locator, Page } from '@playwright/test';
import { expect, test } from './admin.fixtures';

function getWorkspaceCard(page: Page, heading: string): Locator {
  return page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: heading }) });
}

test('@core shows seeded overview metrics and opens each workspace from the landing page', async ({
  adminPage,
  seededAdminData,
}) => {
  await adminPage.goto('/');
  const main = adminPage.getByRole('main');

  await expect(
    adminPage.getByRole('heading', { name: 'Operations overview' })
  ).toBeVisible();
  await expect(main.getByText('At a glance')).toBeVisible();
  await expect(main.getByText('System state')).toBeVisible();
  await expect(main.getByText('Users', { exact: true })).toBeVisible();
  await expect(main.getByText('Orgs', { exact: true })).toBeVisible();
  await expect(main.getByText('Admins', { exact: true })).toBeVisible();
  await expect(main.getByText('Audits', { exact: true })).toBeVisible();
  await expect(main.getByText(/\d+\s+users$/)).toBeVisible();
  await expect(main.getByText(/\d+\s+organizations$/)).toBeVisible();
  await expect(main.getByText(/\d+\s+active$/)).toBeVisible();
  await expect(
    main.getByText(
      /\d+\s+disabled admin accounts remain outside the active rotation\./
    )
  ).toBeVisible();
  await expect(
    main.getByText(seededAdminData.autumn ? 'Configured' : 'Unavailable', {
      exact: true,
    })
  ).toBeVisible();

  const cardExpectations = [
    {
      destinationHeading: 'User directory',
      title: 'Open user directory',
    },
    {
      destinationHeading: 'Organization directory',
      title: 'Open organization directory',
    },
    {
      destinationHeading: 'Audit timeline',
      title: 'Open audit timeline',
    },
  ] as const;

  for (const card of cardExpectations) {
    await adminPage.goto('/');

    const workspaceCard = getWorkspaceCard(adminPage, card.title);

    await expect(
      workspaceCard.getByRole('heading', { name: card.title })
    ).toBeVisible();
    await workspaceCard.getByRole('link', { name: 'Open' }).click();
    await expect(
      adminPage.getByRole('heading', { name: card.destinationHeading })
    ).toBeVisible();
  }
});
