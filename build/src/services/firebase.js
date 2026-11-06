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

export async function loginWithGoogle(role = 'citizen', officialDetails = {}) {
  if (!authInstance || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please use Demo Login.');
  }

  const result = await signInWithPopup(authInstance, googleProvider);
  const user = result.user;
  const isOfficial = role === 'official';
  return {
    id: user.uid,
    name: user.displayName || (isOfficial ? 'Municipal Official' : 'Civic Reporter'),
    email: user.email || '',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    role: isOfficial ? 'official' : 'citizen',
    department: isOfficial ? (officialDetails.department || 'Roads & Infrastructure') : null,
    officialTitle: isOfficial ? (officialDetails.title || 'Palghar Ward Officer') : null,
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

export function createDemoUser(config = 'Demo Citizen') {
  // Support string or object parameter
  const isObject = typeof config === 'object' && config !== null;
  const role = isObject ? (config.role || 'citizen') : 'citizen';
  const isOfficial = role === 'official';

  const defaultName = isOfficial ? 'Er. Rajesh Sharma' : 'Demo Citizen';
  const name = isObject ? (config.name || defaultName) : (config || defaultName);
  const department = isObject ? (config.department || 'Roads & Infrastructure') : 'Roads & Infrastructure';
  const officialTitle = isObject ? (config.officialTitle || 'Palghar Municipal Ward Officer') : 'Palghar Municipal Ward Officer';

  return {
    id: isOfficial ? 'usr_official_palghar' : 'usr_demo_palghar',
    name,
    email: isOfficial ? 'r.sharma@palghar-mc.gov.in' : 'demo.citizen@palghar.local',
    avatar: isOfficial
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: isOfficial ? 'official' : 'citizen',
    department: isOfficial ? department : null,
    officialTitle: isOfficial ? officialTitle : null,
    isDemo: true,
  };
}

