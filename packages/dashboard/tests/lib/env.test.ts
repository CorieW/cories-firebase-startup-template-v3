/**
 * Tests dashboard environment normalization for Firebase credentials.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { getDashboardLogLevel, getFirebasePrivateKey } from '@/lib/env'

const originalFirebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
const originalDashboardLogLevel = process.env.DASHBOARD_LOG_LEVEL
const originalNodeEnv = process.env.NODE_ENV

describe('getFirebasePrivateKey', () => {
  afterEach(() => {
    if (originalFirebasePrivateKey === undefined) {
      delete process.env.FIREBASE_PRIVATE_KEY
      return
    }

    process.env.FIREBASE_PRIVATE_KEY = originalFirebasePrivateKey
  })

  it('returns undefined for the example placeholder private key', () => {
    process.env.FIREBASE_PRIVATE_KEY =
      '-----BEGIN PRIVATE KEY-----\\nREPLACE_WITH_YOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n'

    expect(getFirebasePrivateKey()).toBeUndefined()
  })

  it('normalizes escaped newlines for configured private keys', () => {
    process.env.FIREBASE_PRIVATE_KEY =
      '-----BEGIN PRIVATE KEY-----\\nabc123\\n-----END PRIVATE KEY-----\\n'

    expect(getFirebasePrivateKey()).toBe(
      '-----BEGIN PRIVATE KEY-----\nabc123\n-----END PRIVATE KEY-----\n'
    )
  })
})

describe('getDashboardLogLevel', () => {
  afterEach(() => {
    if (originalDashboardLogLevel === undefined) {
      delete process.env.DASHBOARD_LOG_LEVEL
    } else {
      process.env.DASHBOARD_LOG_LEVEL = originalDashboardLogLevel
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it('defaults to debug outside production', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.DASHBOARD_LOG_LEVEL

    expect(getDashboardLogLevel()).toBe('debug')
  })

  it('defaults to info in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.DASHBOARD_LOG_LEVEL

    expect(getDashboardLogLevel()).toBe('info')
  })

  it('uses configured severities and falls back when invalid', () => {
    process.env.NODE_ENV = 'development'
    process.env.DASHBOARD_LOG_LEVEL = 'warn'
    expect(getDashboardLogLevel()).toBe('warn')

    process.env.DASHBOARD_LOG_LEVEL = 'verbose'
    expect(getDashboardLogLevel()).toBe('debug')
  })
})
