export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const keys = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID'
} as const;

export function readFirebaseConfig(environment: Record<string, unknown>): FirebaseConfig {
  return Object.fromEntries(Object.entries(keys).map(([field, key]) => {
    const value = environment[key];
    if (typeof value !== 'string' || !value) throw new Error(`Missing ${key}`);
    return [field, value];
  })) as unknown as FirebaseConfig;
}
