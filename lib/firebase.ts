import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth, signInAnonymously, Auth, onAuthStateChanged } from "firebase/auth";

// ---------------------------------------------------------------------------
// Firebase configuration
// ---------------------------------------------------------------------------
// Fill these values in your `.env.local` file (see README.md for instructions).
// The app will still run in "offline demo mode" (using localStorage) if these
// are missing, so it never crashes during development.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Best-effort offline cache; ignore errors (e.g. multiple tabs open).
  if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch(() => {});
  }
}

export { app, db, auth };

/**
 * Ensures the current browser session has an anonymous Firebase auth user.
 * Resolves with the uid, or null if Firebase isn't configured (offline mode).
 */
export function ensureAnonAuth(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user.uid);
      } else {
        signInAnonymously(auth!).catch(() => resolve(null));
      }
    });
  });
}
