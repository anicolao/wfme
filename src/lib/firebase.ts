import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously, type Auth } from 'firebase/auth';
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
  const auth = getAuth(app);
  const db = getFirestore(app);
  const usesEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
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
