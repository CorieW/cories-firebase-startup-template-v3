/**
 * Better Auth email delivery and message template helpers.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from '@cories-firebase-startup-template-v3/common';
import { Resend } from 'resend';
import { getAppUrl, getResendConfig } from './env';

const emailLogger = createScopedLogger('DASH_AUTH_EMAIL');

async function sendEmail({
  template,
  to,
  subject,
  html,
  text,
}: {
  template: 'password-reset' | 'verification' | 'organization-invitation';
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resendConfig = getResendConfig();

  if (!resendConfig) {
    emailLogger.log(
      'SEND_EMAIL',
      {
        action: 'sendEmail',
        template,
        status: 'skipped',
        reason: 'resend-not-configured',
        hasRecipient: Boolean(to),
        subject,
      },
      'info'
    );
    return;
  }

  const resend = new Resend(resendConfig.apiKey);

  try {
    await resend.emails.send({
      from: resendConfig.from,
      to,
      subject,
      html,
      text,
    });
    emailLogger.log(
      'SEND_EMAIL',
      {
        action: 'sendEmail',
        template,
        status: 'success',
        subject,
      },
      'info'
    );
  } catch (error) {
    emailLogger.log(
      'SEND_EMAIL_ERROR',
      {
        action: 'sendEmail',
        template,
        status: 'error',
        subject,
        error: serializeErrorForLogging(error),
      },
      'error'
    );
    throw error;
  }
}

export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  await sendEmail({
    template: 'verification',
    to: email,
    subject: 'Verify your email address',
    text: `${greeting}\n\nVerify your email address by opening this link:\n${url}`,
    html: `<p>${greeting}</p><p>Verify your email address by opening the link below.</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordResetEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  await sendEmail({
    template: 'password-reset',
    to: email,
    subject: 'Reset your password',
    text: `${greeting}\n\nReset your password by opening this link:\n${url}`,
    html: `<p>${greeting}</p><p>Reset your password by opening the link below.</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendOrganizationInvitationEmail({
  email,
  invitationId,
  organizationName,
}: {
  email: string;
  invitationId: string;
  organizationName: string;
}) {
  const invitationUrl = `${getAppUrl()}/organization-profile/accept-invitation?id=${invitationId}`;

  await sendEmail({
    template: 'organization-invitation',
    to: email,
    subject: `Join ${organizationName}`,
    text: `You were invited to join ${organizationName}.\n\nAccept the invitation here:\n${invitationUrl}`,
    html: `<p>You were invited to join <strong>${organizationName}</strong>.</p><p><a href="${invitationUrl}">Accept the invitation</a></p>`,
  });
}
