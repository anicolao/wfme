import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import { connectFirestoreEmulator, doc, getFirestore, serverTimestamp, setDoc, terminate } from 'firebase/firestore';

async function withinEventDeadline<T>(label: string, operation: Promise<T>): Promise<T> {
  const deadline = AbortSignal.timeout(2_000);
  const expired = new Promise<never>((_, reject) => {
    deadline.addEventListener('abort', () => reject(new Error(`${label} exceeded 2,000 ms`)), {
      once: true
    });
  });
  return await Promise.race([operation, expired]);
}

export default async function globalSetup() {
  const app = initializeApp({
    apiKey: 'e2e-api-key',
    authDomain: 'wfme-e2e.firebaseapp.com',
    projectId: 'wfme-e2e',
    storageBucket: 'wfme-e2e.firebasestorage.app',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:e2e'
  }, `wfme-e2e-preflight-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9204', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8190);

  try {
    const credential = await withinEventDeadline('Firebase Auth preflight', signInAnonymously(auth));
    const actorUid = credential.user.uid;
    await withinEventDeadline('Firestore write preflight', setDoc(doc(db, 'games', 'WARM1', 'events', `${actorUid}-1`), {
      id: `${actorUid}-1`,
      type: 'game/created',
      payload: { roomCode: 'WARM1', displayName: 'E2E preflight' },
      actorUid,
      clientSeq: 1,
      createdAtMillis: 1,
      schemaVersion: 2,
      reducerVersion: 'integrated-tracer-v1',
      roomCode: 'WARM1',
      committedAt: serverTimestamp()
    }));
  } finally {
    await terminate(db);
    await deleteApp(app);
  }
}
