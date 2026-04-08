/**
 * Firebase Admin bootstrap and Firestore singleton setup for auth.
 */
import commonLogging from '@cories-firebase-startup-template-v3/common/logging';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  getFirebaseClientEmail,
  getDashboardLogLevel,
  getFirebasePrivateKey,
  getFirebaseProjectId,
  getFirestoreEmulatorHost,
} from './env';

const AUTH_APP_NAME = 'dashboard-better-auth';
const { createScopedLogger } = commonLogging;
const firebaseLogger = createScopedLogger('DASH_AUTH_FIREBASE');

function getFirebaseAdminApp() {
  const existing = getApps().find(app => app.name === AUTH_APP_NAME);
  if (existing) {
    firebaseLogger.log(
      'APP_INIT',
      {
        action: 'reuseFirebaseAdminApp',
        appName: AUTH_APP_NAME,
        projectId: getFirebaseProjectId(),
      },
      'debug'
    );
    return existing;
  }

  const projectId = getFirebaseProjectId();
  const clientEmail = getFirebaseClientEmail();
  const privateKey = getFirebasePrivateKey();
  const emulatorHost = getFirestoreEmulatorHost();

  if (emulatorHost && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
    firebaseLogger.log(
      'EMULATOR',
      {
        action: 'configureFirestoreEmulator',
        host: emulatorHost,
        logLevel: getDashboardLogLevel(),
      },
      'debug'
    );
  }

  if (clientEmail && privateKey) {
    const app = initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      },
      AUTH_APP_NAME
    );
    firebaseLogger.log(
      'APP_INIT',
      {
        action: 'initializeFirebaseAdminApp',
        appName: AUTH_APP_NAME,
        mode: 'service-account',
        projectId,
      },
      'info'
    );
    return app;
  }

  const app = initializeApp({ projectId }, AUTH_APP_NAME);
  firebaseLogger.log(
    'APP_INIT',
    {
      action: 'initializeFirebaseAdminApp',
      appName: AUTH_APP_NAME,
      mode: 'project-id',
      projectId,
    },
    'info'
  );
  return app;
}

export const firestore = getFirestore(getFirebaseAdminApp());

firebaseLogger.log(
  'FIRESTORE_READY',
  {
    action: 'initializeFirestore',
    appName: AUTH_APP_NAME,
    projectId: getFirebaseProjectId(),
  },
  'info'
);
