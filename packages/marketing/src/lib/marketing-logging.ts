/**
 * Lightweight client-side logging helpers for primary marketing interactions.
 */
interface MarketingEventPayload {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Emits a consistent console event for page views and call-to-action clicks.
 */
export function logMarketingEvent(
  action: string,
  payload: MarketingEventPayload,
): void {
  if (typeof window === "undefined") {
    return;
  }

  console.info("[MARKETING]", action, payload);
}
