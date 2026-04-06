/**
 * Tests auth user write normalization before Firestore persistence.
 */
import { describe, expect, it } from 'vitest'
import { normalizeAuthUserForStorage } from '@/lib/auth-user-normalization'

describe('normalizeAuthUserForStorage', () => {
  it('replaces an undefined image with null', () => {
    expect(
      normalizeAuthUserForStorage({
        email: 'alex@example.com',
        image: undefined,
        name: 'Alex',
      })
    ).toEqual({
      email: 'alex@example.com',
      image: null,
      name: 'Alex',
    })
  })

  it('preserves a populated image value', () => {
    expect(
      normalizeAuthUserForStorage({
        email: 'alex@example.com',
        image: 'https://example.com/avatar.png',
        name: 'Alex',
      })
    ).toEqual({
      email: 'alex@example.com',
      image: 'https://example.com/avatar.png',
      name: 'Alex',
    })
  })
})
