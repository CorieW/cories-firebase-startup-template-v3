/**
 * Better Auth email delivery and template helpers for the admin app.
 */
import {
  createScopedLogger,
  serializeErrorForLogging,
} from "@cories-firebase-startup-template-v3/common";
import { Resend } from "resend";
import { getResendConfig } from "./env";

const emailLogger = createScopedLogger("ADMIN_AUTH_EMAIL");

async function sendEmail({
  template,
  to,
  subject,
  html,
  text,
}: {
  template: "verification";
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resendConfig = getResendConfig();

  if (!resendConfig) {
    emailLogger.action(
      "sendEmailSkipped",
      {
        template,
        reason: "resend-not-configured",
        hasRecipient: Boolean(to),
      },
      "info",
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

    emailLogger.action(
      "sendEmail",
      {
        template,
        subject,
        status: "success",
      },
      "info",
    );
  } catch (error) {
    emailLogger.log(
      "SEND_EMAIL_ERROR",
      {
        action: "sendEmail",
        template,
        subject,
        status: "error",
        error: serializeErrorForLogging(error),
      },
      "error",
    );
    throw error;
  }
}

/**
 * Sends the admin email verification message.
 */
export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  await sendEmail({
    template: "verification",
    to: email,
    subject: "Verify your admin email address",
    text: `${greeting}\n\nVerify your admin sign-in by opening this link:\n${url}`,
    html: `<p>${greeting}</p><p>Verify your admin sign-in by opening the link below.</p><p><a href="${url}">${url}</a></p>`,
  });
}
