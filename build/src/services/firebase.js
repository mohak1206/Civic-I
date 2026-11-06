import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your-firebase-api-key' &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

let authInstance = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    authInstance = null;
  }
}

export async function loginWithGoogle() {
  if (!authInstance || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please use Demo Login.');
  }

  const result = await signInWithPopup(authInstance, googleProvider);
  const user = result.user;
  return {
    id: user.uid,
    name: user.displayName || 'Civic Reporter',
    email: user.email || '',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    isDemo: false,
  };
}

export async function logoutFirebase() {
  if (authInstance) {
    try {
      await signOut(authInstance);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
}

export function createDemoUser(customName = 'Demo Citizen') {
  return {
    id: 'usr_demo_palghar',
    name: customName,
    email: 'demo.citizen@palghar.local',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isDemo: true,
  };
}

