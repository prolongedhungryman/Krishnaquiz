import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

export const firebaseEnvConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseEnvConfig.apiKey &&
  firebaseEnvConfig.apiKey !== 'MY_FIREBASE_API_KEY' &&
  (firebaseEnvConfig.databaseURL || firebaseEnvConfig.projectId)
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseEnvConfig) : getApps()[0];
    auth = getAuth(app);
    if (firebaseEnvConfig.databaseURL) {
      database = getDatabase(app, firebaseEnvConfig.databaseURL);
    } else {
      database = getDatabase(app);
    }
    console.info('[Firebase] Connected to Firebase Realtime Database');
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase:', error);
  }
} else {
  console.info(
    '[Firebase] Configuration missing or incomplete. Using High-Fidelity Realtime Local/Broadcast Channel simulation for preview.'
  );
}

export { app, auth, database };
