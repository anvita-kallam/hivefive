import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Initialize Firebase Admin if not already initialized
// This is a synchronous initialization check
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized || admin.apps.length > 0) {
    return;
  }

  try {
    if (process.env.FIREBASE_ADMIN_SDK_PATH) {
      const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH.startsWith('/')
        ? process.env.FIREBASE_ADMIN_SDK_PATH
        : join(process.cwd(), process.env.FIREBASE_ADMIN_SDK_PATH);
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('Firebase Admin initialized successfully');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Google Application Default Credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      firebaseInitialized = true;
      console.log('Firebase Admin initialized with application default credentials');
    } else {
      console.warn('Firebase Admin credentials not configured. Authentication will fail.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    console.warn('Firebase Admin not initialized. Authentication will fail.');
  }
}

// Initialize on module load
initializeFirebase();

export const authenticateToken = async (req, res, next) => {
  // Ensure Firebase is initialized
  if (!admin.apps.length) {
    initializeFirebase();
  }

  // Check if Firebase is properly initialized
  if (!admin.apps.length) {
    console.error('Firebase Admin not initialized');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header found');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token is empty');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired. Please sign in again.' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};
