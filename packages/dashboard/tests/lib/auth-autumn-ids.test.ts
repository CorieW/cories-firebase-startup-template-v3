/**
 * Tests Autumn-safe customer and entity id helpers.
 */
import { describe, expect, it } from 'vitest'
import { getAutumnCustomerId, getAutumnEntityId } from '@/lib/auth-autumn-ids'

describe('getAutumnCustomerId', () => {
  it('uses hyphen-scoped ids for users', () => {
    expect(getAutumnCustomerId('user', 'abc123')).toBe('user-abc123')
  })

  it('uses hyphen-scoped ids for organizations', () => {
    expect(getAutumnCustomerId('org', 'org_123')).toBe('org-org_123')
  })
})

describe('getAutumnEntityId', () => {
  it('uses hyphen-scoped ids for members', () => {
    expect(getAutumnEntityId('member', 'user_123')).toBe('member-user_123')
  })

  it('never introduces colons into generated ids', () => {
    expect(getAutumnCustomerId('user', 'abc123').includes(':')).toBe(false)
    expect(getAutumnCustomerId('org', 'org_123').includes(':')).toBe(false)
    expect(getAutumnEntityId('member', 'user_123').includes(':')).toBe(false)
  })
})
