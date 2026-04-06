/**
 * Tests route guard helpers.
 */
import { describe, expect, it } from 'vitest'
import {
  isAuthEntryRoute,
  isPublicRoute,
  normalizePathname,
} from '@/lib/route-guards'

describe('normalizePathname', () => {
  it('normalizes empty values and trims trailing slash', () => {
    expect(normalizePathname('')).toBe('/')
    expect(normalizePathname('/pricing/')).toBe('/pricing')
    expect(normalizePathname('/')).toBe('/')
  })
})

describe('isPublicRoute', () => {
  it('allows sign-in and sign-up paths including catch-all routes', () => {
    expect(isPublicRoute('/sign-in')).toBe(true)
    expect(isPublicRoute('/sign-in/sso-callback')).toBe(true)
    expect(isPublicRoute('/sign-up')).toBe(true)
    expect(isPublicRoute('/sign-up/invite')).toBe(true)
  })

  it('blocks non-authenticated routes', () => {
    expect(isPublicRoute('/')).toBe(false)
    expect(isPublicRoute('/about')).toBe(false)
    expect(isPublicRoute('/pricing/subscriptions')).toBe(false)
  })
})

describe('isAuthEntryRoute', () => {
  it('only matches the top-level sign-in and sign-up pages', () => {
    expect(isAuthEntryRoute('/sign-in')).toBe(true)
    expect(isAuthEntryRoute('/sign-up/')).toBe(true)
    expect(isAuthEntryRoute('/sign-in/reset-password')).toBe(false)
    expect(isAuthEntryRoute('/sign-up/callback')).toBe(false)
  })
})
