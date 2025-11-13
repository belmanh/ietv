import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as Auth from "firebase/auth";
import { getAuth, initializeAuth, setPersistence, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAe-MntIwayT0lTwdMJykNW8HU8jkWPJkQ",
  authDomain: "ie-tv-9bd19.firebaseapp.com",
  projectId: "ie-tv-9bd19",
  storageBucket: "ie-tv-9bd19.firebasestorage.app",
  messagingSenderId: "884851692041",
  appId: "1:884851692041:web:95aace57fa78369db2ded8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// React Native-friendly Auth: use AsyncStorage persistence to avoid browser-only APIs
let authInstance: ReturnType<typeof getAuth>;
const getRNPersistence = (Auth as any).getReactNativePersistence as (storage: any) => any;
try {
  // Reuse when already initialized (fast refresh)
  authInstance = getAuth(app);
  try { await setPersistence(authInstance, getRNPersistence(AsyncStorage)); } catch {}
} catch {
  // First time in RN
  authInstance = initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) });
}

// Optional: sign in anonymously so Storage rules requiring auth() pass
try { if (!authInstance.currentUser) await signInAnonymously(authInstance); } catch {}

export const auth = authInstance;

export const db = getFirestore(app);
// Explicitly target the project bucket to avoid mixing with legacy defaults
export const storage = getStorage(app, "gs://ie-tv-9bd19.firebasestorage.app");
export default app;