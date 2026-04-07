/**
 * Shared formatting helpers for admin route content.
 */
export function formatAdminDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Unavailable';
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

/**
 * Formats numeric admin counts with locale-aware separators.
 */
export function formatAdminNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat().format(value ?? 0);
}

/**
 * Formats nullable text so sparse records stay readable in the UI.
 */
export function formatAdminText(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || typeof value === 'undefined' || value === '') {
    return 'Unavailable';
  }

  return String(value);
}

/**
 * Pretty-prints structured records for admin detail pages.
 */
export function formatAdminJson(value: unknown): string {
  if (value === null || typeof value === 'undefined') {
    return '{}';
  }

  return JSON.stringify(value, null, 2);
}
