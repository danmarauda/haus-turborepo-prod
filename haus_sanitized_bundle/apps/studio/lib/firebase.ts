
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration would typically come from environment variables.
// Using placeholders that will fail if not replaced with valid config in a real deployment.
// However, the structure is correct for implementation.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSy...",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "haus-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "haus-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "haus-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
