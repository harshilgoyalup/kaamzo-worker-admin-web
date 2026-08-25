import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "AIzaSyBBuJUlwhGV9Y_Wdx20EEFQ89GejXy4tsI",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
    "kaamzo-platform.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_PROJECT_ID ||
    "kaamzo-platform",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_STORAGE_BUCKET ||
    "kaamzo-platform.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID ||
    "13778754649",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.NEXT_PUBLIC_APP_ID ||
    "1:13778754649:web:a7bbc6a104a8b9e39d6548",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
