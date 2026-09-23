import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "missing-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "missing-app-id"
};

let app, db, auth, storage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { db, auth, storage };
export default app;
