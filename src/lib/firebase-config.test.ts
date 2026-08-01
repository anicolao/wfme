import { expect, it } from 'vitest';
import { readFirebaseConfig } from './firebase-config';

it('requires every public Firebase setting', () => {
  expect(() => readFirebaseConfig({})).toThrow('VITE_FIREBASE_API_KEY');
  expect(readFirebaseConfig({
    VITE_FIREBASE_API_KEY: 'key',
    VITE_FIREBASE_AUTH_DOMAIN: 'wfme.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'wfme',
    VITE_FIREBASE_STORAGE_BUCKET: 'wfme.firebasestorage.app',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
    VITE_FIREBASE_APP_ID: 'app'
  }).projectId).toBe('wfme');
});
