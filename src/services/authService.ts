import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      return await this.handleUserAuth(firebaseUser);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await this.handleUserAuth(result.user);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign up with email and password
  static async signUpWithEmail(
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<User | null> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Update profile with name
      await updateProfile(firebaseUser, {
        displayName: name
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
        role: 'Staff', // Default role for new users
        phone: phone || undefined,
        profileImage: firebaseUser.photoURL || undefined,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      return userData;
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Handle user authentication (common logic for Google and email)
  private static async handleUserAuth(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData: User;
      
      if (userDoc.exists()) {
        // User exists, update last login
        userData = userDoc.data() as User;
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLogin: serverTimestamp()
        }, { merge: true });
      } else {
        // New user from Google sign-in, create profile
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          role: 'Staff', // Default role for new users
          phone: firebaseUser.phoneNumber || undefined,
          profileImage: firebaseUser.photoURL || undefined,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }
      
      return userData;
    } catch (error) {
      console.error('Error handling user auth:', error);
      throw error;
    }
  }

  // Handle authentication errors
  private static handleAuthError(error: any): Error {
    let message = 'Terjadi kesalahan saat autentikasi';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Email tidak terdaftar';
        break;
      case 'auth/wrong-password':
        message = 'Password salah';
        break;
      case 'auth/email-already-in-use':
        message = 'Email sudah terdaftar';
        break;
      case 'auth/weak-password':
        message = 'Password terlalu lemah';
        break;
      case 'auth/invalid-email':
        message = 'Format email tidak valid';
        break;
      case 'auth/user-disabled':
        message = 'Akun telah dinonaktifkan';
        break;
      case 'auth/too-many-requests':
        message = 'Terlalu banyak percobaan. Coba lagi nanti';
        break;
      case 'auth/network-request-failed':
        message = 'Koneksi internet bermasalah';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Login dibatalkan';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Login dibatalkan';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            callback(userData);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if email is verified
  static isEmailVerified(): boolean {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  // Resend email verification
  static async resendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    } else {
      throw new Error('No user logged in');
    }
  }
}