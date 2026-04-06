/**
 * Auth user payload normalization helpers for Firestore-safe writes.
 */
type AuthUserWithOptionalImage = {
  image?: string | null
}

/**
 * Better Auth can pass optional profile fields like `image` as `undefined`.
 * Firestore rejects undefined document values, so we normalize them first.
 */
export function normalizeAuthUserForStorage<T extends AuthUserWithOptionalImage>(
  user: T
): Omit<T, 'image'> & { image: string | null } {
  return {
    ...user,
    image: user.image ?? null,
  }
}
