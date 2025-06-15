import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC2-CY07HiMJgBGbaGfF3LyrxPWbiB7LjA",
  authDomain: "roasthub-b5d3e.firebaseapp.com",
  projectId: "roasthub-b5d3e",
  storageBucket: "roasthub-b5d3e.firebasestorage.app",
  messagingSenderId: "446191279360",
  appId: "1:446191279360:web:de19a8fc73c6307d04e7e5",
  measurementId: "G-1YDZCHZW9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;