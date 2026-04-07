/**
 * Admin server environment accessors for auth, billing, email, and Firebase credentials.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_ADMIN_APP_URL = 'http://localhost:3001';
const DEFAULT_BETTER_AUTH_SECRET =
  'better-auth-dev-secret-12345678901234567890';
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

function trimString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = trimString(process.env[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function isFirebasePrivateKeyPlaceholder(value: string): boolean {
  return /replace_with_your_private_key/i.test(value);
}

function readDefaultFirebaseProjectIdFromFirebaserc(): string | undefined {
  const candidatePaths = [
    path.resolve(process.cwd(), '.firebaserc'),
    path.resolve(process.cwd(), '..', '.firebaserc'),
    path.resolve(process.cwd(), '..', '..', '.firebaserc'),
  ];

  for (const candidatePath of candidatePaths) {
    if (!existsSync(candidatePath)) {
      continue;
    }

    try {
      const parsed = JSON.parse(readFileSync(candidatePath, 'utf8')) as {
        projects?: {
          default?: string;
        };
      };

      const projectId = trimString(parsed.projects?.default);
      if (projectId) {
        return projectId;
      }
    } catch {
      // Ignore malformed local config and fall back to the template project id.
    }
  }

  return undefined;
}

/**
 * Returns the admin app origin used by Better Auth callback links.
 */
export function getAdminAppUrl(): string {
  return readEnv('BETTER_AUTH_URL', 'APP_URL') ?? DEFAULT_ADMIN_APP_URL;
}

/**
 * Returns the shared Better Auth secret for the admin app.
 */
export function getBetterAuthSecret(): string {
  return readEnv('BETTER_AUTH_SECRET') ?? DEFAULT_BETTER_AUTH_SECRET;
}

/**
 * Returns the Google OAuth client config when it is available.
 */
export function getGoogleOAuthConfig():
  | {
      clientId: string;
      clientSecret: string;
    }
  | undefined {
  const clientId = readEnv('GOOGLE_CLIENT_ID');
  const clientSecret = readEnv('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    return undefined;
  }

  return {
    clientId,
    clientSecret,
  };
}

/**
 * Returns the Autumn secret key when billing access is configured.
 */
export function getAutumnSecretKey(): string | undefined {
  return readEnv('AUTUMN_SECRET_KEY');
}

/**
 * Returns a custom Autumn base URL when one is configured.
 */
export function getAutumnBaseUrl(): string | undefined {
  return readEnv('AUTUMN_URL', 'AUTUMN_BASE_URL');
}

/**
 * Returns Resend email config for password-reset and verification flows.
 */
export function getResendConfig():
  | {
      apiKey: string;
      from: string;
    }
  | undefined {
  const apiKey = readEnv('RESEND_API_KEY');
  const from = readEnv('RESEND_FROM_EMAIL');

  if (!apiKey || !from) {
    return undefined;
  }

  return {
    apiKey,
    from,
  };
}

/**
 * Returns the Firebase project id for the admin server.
 */
export function getFirebaseProjectId(): string {
  return (
    readEnv('FIREBASE_PROJECT_ID', 'PROJECT_ID') ??
    readDefaultFirebaseProjectIdFromFirebaserc() ??
    'demo-startup-template'
  );
}

/**
 * Returns the Firebase service account email when configured.
 */
export function getFirebaseClientEmail(): string | undefined {
  return readEnv('FIREBASE_CLIENT_EMAIL', 'CLIENT_EMAIL');
}

/**
 * Returns the Firebase private key when configured.
 */
export function getFirebasePrivateKey(): string | undefined {
  const key = readEnv('FIREBASE_PRIVATE_KEY', 'PRIVATE_KEY');
  if (!key) {
    return undefined;
  }

  const normalized = key.replace(/\r\n/g, '\n').replace(/\\n/g, '\n');
  return isFirebasePrivateKeyPlaceholder(normalized) ? undefined : normalized;
}

/**
 * Returns the configured Firestore emulator host when available.
 */
export function getFirestoreEmulatorHost(): string | undefined {
  return (
    readEnv('FIRESTORE_EMULATOR_HOST', 'MY_FIRESTORE_EMULATOR_HOST') ??
    (isProductionEnvironment() ? undefined : DEFAULT_FIRESTORE_EMULATOR_HOST)
  );
}

