/**
 * Firebase Admin and Firestore initialization.
 */
import { createScopedLogger } from '@cories-firebase-startup-template-v3/common';
import {
  getClientEmail,
  getFirestoreEmulatorHost,
  getPrivateKey,
  getProjectId,
  isProdEnvironment,
} from './global';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

const firebaseLogger = createScopedLogger('BACK_FIREBASE');

if (!isProdEnvironment()) {
  // Wire Firestore emulator host before initializing admin SDK clients.
  process.env['FIRESTORE_EMULATOR_HOST'] = getFirestoreEmulatorHost();
  firebaseLogger.log(
    'EMULATOR',
    {
      action: 'configureFirestoreEmulator',
      host: getFirestoreEmulatorHost(),
    },
    'debug'
  );
}

let app: App | null = null;
if (isProdEnvironment()) {
  // Production uses explicit service account credentials.
  const serviceAccount = {
    projectId: getProjectId(),
    clientEmail: getClientEmail(),
    privateKey: getPrivateKey(),
  };

  app = initializeApp(
    {
      credential: credential.cert(serviceAccount),
    },
    'admin'
  );
  firebaseLogger.log(
    'APP_INIT',
    {
      action: 'initializeFirebaseAdmin',
      mode: 'service-account',
      projectId: getProjectId(),
    },
    'info'
  );
} else {
  // Local/dev relies on project ID + emulator hosts.
  app = initializeApp(
    {
      projectId: getProjectId(),
    },
    'admin'
  );
  firebaseLogger.log(
    'APP_INIT',
    {
      action: 'initializeFirebaseAdmin',
      mode: 'emulator',
      projectId: getProjectId(),
    },
    'info'
  );
}

if (!app) {
  throw new Error('Firebase app initialization failed');
}

// Initialize the shared Firestore admin client used by backend functions.
const db = getFirestore(app);

firebaseLogger.log(
  'FIRESTORE_READY',
  {
    action: 'initializeFirestore',
    projectId: getProjectId(),
    emulatorEnabled: !isProdEnvironment(),
  },
  'info'
);

export { db };
