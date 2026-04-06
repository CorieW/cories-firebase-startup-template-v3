/**
 * Assistant chat reply and error parsing helpers.
 */
export function buildAssistantReply(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('billing') ||
    normalizedMessage.includes('credit')
  ) {
    return 'Billing sounds like the main topic. We can use this chat surface as a starting point and connect it to real account data when you are ready.';
  }

  if (
    normalizedMessage.includes('auth') ||
    normalizedMessage.includes('sign')
  ) {
    return 'Auth is a common starter-app question. A next step could be connecting this page to your real backend assistant so replies can reference account state.';
  }

  if (
    normalizedMessage.includes('feature') ||
    normalizedMessage.includes('build')
  ) {
    return 'That sounds like a product-building question. This page is intentionally lightweight, so it is ready to swap from canned responses to a real model later.';
  }

  return 'Message received. This lightweight chat is ready to be connected to a real assistant whenever you are ready.';
}

export function extractErrorMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    if (
      (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
      (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))
    ) {
      try {
        return extractErrorMessage(JSON.parse(trimmedValue)) ?? trimmedValue;
      } catch {
        return trimmedValue;
      }
    }

    return trimmedValue;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const recordValue = value as Record<string, unknown>;

  return (
    extractErrorMessage(recordValue.message) ??
    extractErrorMessage(recordValue.error) ??
    extractErrorMessage(recordValue.body) ??
    null
  );
}

export async function getChatUsageErrorMessage(response: Response) {
  const fallbackMessage = 'Usage tracking did not complete. Please try again.';
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const message = extractErrorMessage(await response.json());

      if (message) {
        return message;
      }
    } else {
      const message = extractErrorMessage(await response.text());

      if (message) {
        return message;
      }
    }
  } catch {
    // Fall back to status-based handling below when the response body is unreadable.
  }

  if (response.status === 429) {
    return 'Too many requests, please try again later.';
  }

  return fallbackMessage;
}

export function getRequestErrorMessage(
  caughtError: unknown,
  fallbackMessage: string
) {
  return extractErrorMessage(caughtError) ?? fallbackMessage;
}
