/**
 * Dashboard server environment accessors for auth, billing, email, and Firebase credentials.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { getDashboardLogLevel } from './dashboard-log-level'

const DEFAULT_APP_URL = 'http://localhost:3001'
const DEFAULT_BETTER_AUTH_SECRET =
  'better-auth-dev-secret-12345678901234567890'
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

function trimString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = trimString(process.env[key])
    if (value) {
      return value
    }
  }

  return undefined
}

function isFirebasePrivateKeyPlaceholder(value: string): boolean {
  return /replace_with_your_private_key/i.test(value)
}

function readDefaultFirebaseProjectIdFromFirebaserc(): string | undefined {
  const candidatePaths = [
    path.resolve(process.cwd(), '.firebaserc'),
    path.resolve(process.cwd(), '..', '.firebaserc'),
    path.resolve(process.cwd(), '..', '..', '.firebaserc'),
  ]

  for (const candidatePath of candidatePaths) {
    if (!existsSync(candidatePath)) {
      continue
    }

    try {
      const parsed = JSON.parse(readFileSync(candidatePath, 'utf8')) as {
        projects?: {
          default?: string
        }
      }

      const projectId = trimString(parsed.projects?.default)
      if (projectId) {
        return projectId
      }
    } catch {
      // Ignore malformed local config and fall back to the template project id.
    }
  }

  return undefined
}

export function getAppUrl(): string {
  return readEnv('BETTER_AUTH_URL', 'APP_URL') ?? DEFAULT_APP_URL
}

export function getBetterAuthSecret(): string {
  return readEnv('BETTER_AUTH_SECRET') ?? DEFAULT_BETTER_AUTH_SECRET
}

export function getGoogleOAuthConfig():
  | {
      clientId: string
      clientSecret: string
    }
  | undefined {
  const clientId = readEnv('GOOGLE_CLIENT_ID')
  const clientSecret = readEnv('GOOGLE_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    return undefined
  }

  return {
    clientId,
    clientSecret,
  }
}

export function getAutumnSecretKey(): string | undefined {
  return readEnv('AUTUMN_SECRET_KEY')
}

export function getAutumnBaseUrl(): string | undefined {
  return readEnv('AUTUMN_URL', 'AUTUMN_BASE_URL')
}

export function getAutumnSeatFeatureId(): string | undefined {
  return readEnv('AUTUMN_SEAT_FEATURE_ID')
}

export function getResendConfig():
  | {
      apiKey: string
      from: string
    }
  | undefined {
  const apiKey = readEnv('RESEND_API_KEY')
  const from = readEnv('RESEND_FROM_EMAIL')

  if (!apiKey || !from) {
    return undefined
  }

  return {
    apiKey,
    from,
  }
}

export function getFirebaseProjectId(): string {
  return (
    readEnv('FIREBASE_PROJECT_ID', 'PROJECT_ID') ??
    readDefaultFirebaseProjectIdFromFirebaserc() ??
    'demo-startup-template'
  )
}

export function getFirebaseClientEmail(): string | undefined {
  return readEnv('FIREBASE_CLIENT_EMAIL', 'CLIENT_EMAIL')
}

export function getFirebasePrivateKey(): string | undefined {
  const key = readEnv('FIREBASE_PRIVATE_KEY', 'PRIVATE_KEY')
  if (!key) {
    return undefined
  }

  const normalized = key.replace(/\r\n/g, '\n').replace(/\\n/g, '\n')
  return isFirebasePrivateKeyPlaceholder(normalized) ? undefined : normalized
}

export function getFirestoreEmulatorHost(): string | undefined {
  return (
    readEnv('FIRESTORE_EMULATOR_HOST', 'MY_FIRESTORE_EMULATOR_HOST') ??
    (isProductionEnvironment() ? undefined : DEFAULT_FIRESTORE_EMULATOR_HOST)
  )
}

export { getDashboardLogLevel }
