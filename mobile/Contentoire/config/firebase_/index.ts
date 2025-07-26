// Re-export all Firebase services
export { app } from './config';
export { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User 
} from './auth';
export { db } from './firestore';
export { messaging, initializeMessaging, getFCMToken, onMessageListener } from './messaging';
export { googleProvider, signInWithGoogle, request, response, promptAsync } from './google-auth';
