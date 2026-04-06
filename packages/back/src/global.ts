/**
 * Backend environment/config accessors and shared constants.
 */
import {
  configureLogger,
  createScopedLogger,
  parseLogSeverity,
  type LogSeverity,
} from '@cories-firebase-startup-template-v3/common';
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const BACK_LOG_LEVEL = process.env.BACK_LOG_LEVEL;
const PROJECT_ID = process.env.PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const FIRESTORE_EMULATOR_HOST = process.env.MY_FIRESTORE_EMULATOR_HOST;
const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';
const backendLogger = createScopedLogger('BACKEND');

configureLogger(getBackLogLevel());

function logConfigErrorAndThrowInternalError(message: string): never {
  backendLogger.log(
    'CONFIG_ERROR',
    {
      action: 'validateBackendEnvironment',
      message,
      nodeEnv: NODE_ENV ?? null,
    },
    'error'
  );
  throw new Error(INTERNAL_SERVER_ERROR_MESSAGE);
}

if (!isProdEnvironment()) {
  backendLogger.log(
    'CONFIG',
    {
      action: 'loadBackendEnvironment',
      nodeEnv: NODE_ENV ?? null,
      logLevel: getBackLogLevel(),
      projectId: PROJECT_ID ?? null,
      hasPrivateKey: Boolean(PRIVATE_KEY),
      hasClientEmail: Boolean(CLIENT_EMAIL),
      firestoreEmulatorHost: FIRESTORE_EMULATOR_HOST ?? null,
    },
    'debug'
  );
}

// Verify that the environment variables are set
if (!NODE_ENV) {
  logConfigErrorAndThrowInternalError(
    'Missing required environment variable: NODE_ENV'
  );
}

if (!PROJECT_ID) {
  logConfigErrorAndThrowInternalError(
    'Missing required environment variable: PROJECT_ID'
  );
}

if (!PRIVATE_KEY) {
  logConfigErrorAndThrowInternalError(
    'Missing required environment variable: PRIVATE_KEY'
  );
}

if (!CLIENT_EMAIL) {
  logConfigErrorAndThrowInternalError(
    'Missing required environment variable: CLIENT_EMAIL'
  );
}

if (!isProdEnvironment()) {
  // Only check emulator wiring in non-production environments.
  if (!FIRESTORE_EMULATOR_HOST) {
    logConfigErrorAndThrowInternalError(
      'Missing required environment variable: MY_FIRESTORE_EMULATOR_HOST'
    );
  }
}

export function isProdEnvironment() {
  return NODE_ENV === 'production';
}

export function getBackLogLevel(): LogSeverity {
  return parseLogSeverity(
    BACK_LOG_LEVEL,
    isProdEnvironment() ? 'info' : 'debug'
  );
}

export function getProjectId() {
  return PROJECT_ID!;
}

export function getPrivateKey() {
  return PRIVATE_KEY!;
}

export function getClientEmail() {
  return CLIENT_EMAIL!;
}

export function getFirestoreEmulatorHost() {
  return FIRESTORE_EMULATOR_HOST!;
}
