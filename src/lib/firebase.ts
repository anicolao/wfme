import { initializeApp } from 'firebase/app';
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  signInAnonymously,
  type Auth
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { readFirebaseConfig } from './firebase-config';

export interface FirebaseServices {
  auth: Auth;
  db: Firestore;
}

let services: FirebaseServices | undefined;

export async function initializeFirebase(): Promise<FirebaseServices> {
  if (services) return services;
  const app = initializeApp(readFirebaseConfig(import.meta.env));
  const usesEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  // E2E clients are ephemeral between browser contexts but must retain identity on
  // reload. Session storage avoids IndexedDB startup while preserving that contract.
  const auth = usesEmulators
    ? initializeAuth(app, { persistence: browserSessionPersistence })
    : getAuth(app);
  const db = getFirestore(app);
  if (usesEmulators) {
    connectAuthEmulator(
      auth,
      `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1'}:${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT ?? '9204'}`,
      { disableWarnings: true }
    );
    connectFirestoreEmulator(
      db,
      import.meta.env.VITE_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1',
      Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT ?? '8190')
    );
  }
  if (!auth.currentUser) await signInAnonymously(auth);
  services = { auth, db };
  return services;
}
