import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hivefive-477603.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hivefive-477603",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hivefive-477603.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "231258515997",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:231258515997:web:827c3520193ef0e7fcf4f4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GC7V2BFH44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export const analyticsInstance = analytics;

export const googleProvider = new GoogleAuthProvider();
// No domain restriction - any Google account can sign in

export default app;

