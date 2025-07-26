import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth, 
  Auth, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './config';

// Initialize Firebase Auth
const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error: any) {
    if (error?.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    console.error('Firebase Auth initialization error:', error);
    throw error;
  }
})();

// Export types and auth functions
export type User = FirebaseUser;

export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const signInWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
  return firebaseSignInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
  return firebaseCreateUserWithEmailAndPassword(auth, email, password);
};

export { auth };
