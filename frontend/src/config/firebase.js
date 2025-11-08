import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDYqYaDGBf_vxJz-YoZt-RL6BHkqoKcz1A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hivefive-4384c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hivefive-4384c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hivefive-4384c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "456545013550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:456545013550:web:05d326d9492e052e8ff4bf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TMRP5PPQF8"
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
googleProvider.setCustomParameters({
  hd: 'gatech.edu' // Restrict to Georgia Tech domain
});

export default app;

