import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isBrowser = typeof window !== "undefined";

if (!apiKey && isBrowser) {
  console.warn("⚠️ [OmniVault] NEXT_PUBLIC_FIREBASE_API_KEY is missing. Check your .env.local file.");
}

const firebaseConfig = {
  apiKey: apiKey || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ominivault",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase only in browser to avoid build-time auth initialization failures.
const app = isBrowser && apiKey ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
export const auth: Auth = app ? getAuth(app) : (null as unknown as Auth);
export default app;
