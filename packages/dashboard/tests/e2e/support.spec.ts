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

test('@core opens live chat from the support page', async ({
  personalPage,
}) => {
  await personalPage.goto('/support');
  await expect(
    personalPage.getByRole('heading', { name: 'Get help from the team' })
  ).toBeVisible();

  const liveChatCard = personalPage.getByRole('button', {
    name: /^Live Chat/i,
  });
  await clickUntilNavigated(
    personalPage,
    () =>
      liveChatCard.evaluate(node => {
        (node as HTMLButtonElement).click();
      }),
    /\/chat\?source=live-chat$/
  );

  await expect(
    personalPage.getByRole('heading', { name: 'Live chat support' })
  ).toBeVisible();
  await expect(
    personalPage.getByText('Welcome to live chat. How can we help today?')
  ).toBeVisible();
});

test('@core opens contact support chat from the support page', async ({
  personalPage,
}) => {
  await personalPage.goto('/support');
  await expect(
    personalPage.getByRole('heading', { name: 'Get help from the team' })
  ).toBeVisible();

  await clickUntilNavigated(
    personalPage,
    () => personalPage.getByRole('button', { name: 'Contact support' }).click(),
    /\/chat\?source=contact-support$/
  );

  await expect(
    personalPage.getByRole('heading', { name: 'Contact support' })
  ).toBeVisible();
  await expect(
    personalPage.getByText(
      'Thanks for reaching out. What can we help you solve?'
    )
  ).toBeVisible();
});

test('@core sends a support message and shows the simulated reply', async ({
  personalPage,
}) => {
  await personalPage.goto('/chat?source=live-chat');

  await expect(
    personalPage.getByRole('heading', { name: 'Live chat support' })
  ).toBeVisible();

  const chatInput = personalPage.getByPlaceholder('Write a message to support');
  const sendButton = personalPage.getByRole('button', { name: 'Send message' });

  await expect(chatInput).toBeVisible();
  await chatInput.fill('I need help understanding the billing page.');
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  await expect(
    personalPage.getByText('I need help understanding the billing page.')
  ).toBeVisible();
  await expect(
    personalPage.getByText(
      'Thanks for the details. A support specialist will follow up shortly.'
    )
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
    /\/support$/
  );

  await expect(
    personalPage.getByRole('heading', { name: 'Get help from the team' })
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
