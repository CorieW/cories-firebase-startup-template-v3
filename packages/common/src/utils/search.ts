/**
 * Shared search-field normalization helpers for auth and admin flows.
 */
export interface AuthUserSearchFields {
  emailSearch: string | null;
  nameSearch: string | null;
}

export interface AuthOrganizationSearchFields {
  nameSearch: string | null;
}

/**
 * Normalizes user-entered search text for deterministic Firestore queries.
 */
export function normalizeSearchValue(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
}

/**
 * Builds the stored search fields for a Better Auth user record.
 */
export function buildAuthUserSearchFields(input: {
  email?: string | null;
  name?: string | null;
}): AuthUserSearchFields {
  return {
    emailSearch: normalizeSearchValue(input.email),
    nameSearch: normalizeSearchValue(input.name),
  };
}

/**
 * Builds the stored search fields for a Better Auth organization record.
 */
export function buildAuthOrganizationSearchFields(input: {
  name?: string | null;
}): AuthOrganizationSearchFields {
  return {
    nameSearch: normalizeSearchValue(input.name),
  };
}

/**
 * Returns the inclusive prefix bounds used by Firestore string prefix queries.
 */
export function getSearchPrefixBounds(prefix: string): [string, string] {
  const normalizedPrefix = normalizeSearchValue(prefix) ?? '';
  return [normalizedPrefix, `${normalizedPrefix}\uf8ff`];
}
